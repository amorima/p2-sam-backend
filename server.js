import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { initSocket } from "./utils/socket.js";

const app = express();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3012',
  'https://sam.netdw.tech'
]

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
}

app.use(helmet())
app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
app.use(express.json());

// Global rate limit. Generous because legitimate clients are chatty: the public
// kiosk panel pushes telemetry on an interval and fans out the goods listing
// into several backend reads, and the admin dashboard auto-refreshes.
const skipTestRequests = (req, res) => {
  if (req.headers['x-test-client'] === 'true') {
    // Log test bypass for audit
    console.log(`[RATE_LIMIT_BYPASS] ${req.method} ${req.path} from test client`);
    return true; // Skip this request
  }
  return false;
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  skip: skipTestRequests,
  standardHeaders: true,
  legacyHeaders: false,
  // The public kiosk panel pushes telemetry every 5s and fans the goods listing
  // into several reads; exempt those high-frequency, low-risk endpoints so the
  // panel is never throttled (it has no auth/login surface to brute force).
  skip: (req) =>
    req.path.startsWith('/telemetry')
    || req.path.startsWith('/leads')
    || req.path.startsWith('/needs')
    || req.path.startsWith('/institutions'),
  message: { description: 'Demasiados pedidos. Tente novamente mais tarde.' }
})

// Strict limit for login: prevents brute force on NIF/password
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: skipTestRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { description: 'Demasiadas tentativas de login. Tente novamente em 15 minutos.' }
})

// Moderate limit for token refresh: covers authBackendFetch refresh chains
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  skip: skipTestRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { description: 'Demasiados pedidos de renovação de sessão.' }
})

app.use(globalLimiter)

// Resources Routes Import
import authRoutes from "./routes/auth.routes.js";
import leadsRoutes from "./routes/leads.routes.js";
import businessRoutes from "./routes/business.routes.js";
import donationsRoutes from "./routes/donations.routes.js";
import institutionsRoutes from "./routes/institutions.routes.js";
import needsRoutes from "./routes/needs.routes.js";
import offersRoutes from "./routes/offers.routes.js";
import patronsRoutes from "./routes/patrons.routes.js";
import minioRoutes from "./routes/minio.routes.js";
import citizensRoutes from "./routes/citizens.routes.js";
import entitiesRoutes from "./routes/entities.routes.js";

import vouchersRoutes from "./routes/vouchers.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import logsRoutes from "./routes/logs.routes.js";
import telemetryRoutes from "./routes/telemetry.routes.js";
import goodsServicesRoutes from "./routes/goods_services.routes.js";
import apiTokensRoutes from "./routes/api_tokens.routes.js";

// Apply Router
app.use('/auth/login', loginLimiter);
app.use('/auth/refresh', refreshLimiter);
app.use('/auth', authRoutes);
app.use('/leads', leadsRoutes);
app.use('/business', businessRoutes);
app.use('/donations', donationsRoutes);
app.use('/institutions', institutionsRoutes);
app.use('/needs', needsRoutes);
app.use('/offers', offersRoutes);
app.use('/patrons', patronsRoutes);
app.use('/citizens', citizensRoutes);
app.use('/entities', entitiesRoutes);

app.use('/vouchers', vouchersRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/logs', logsRoutes);
app.use('/telemetry', telemetryRoutes);
app.use('/goods-services', goodsServicesRoutes);

app.use("/api/upload", minioRoutes);
app.use('/api-tokens', apiTokensRoutes);

// Unknown Routes Handler
app.use((req, res, next) => {
    const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
    error.status = 404;
    next(error)
});

// Error Handler
app.use((err, req, res, next) => {
    // Log error details for debugging
    console.error(`[${new Date().toISOString()}] Error:`, {
        message: err.message,
        status: err.status || 500,
        path: req.path,
        method: req.method,
        stack: err.stack,
    });

    // Errors in JSON parcing
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        err.message = "Invalid JSON payload";
        err.status = 400;
    }

    res.status(err.status || 500).json({
        description: err.message || "Internal server error",
        ...(err.errors && { errors: err.errors })
    });
})

import { verifyEmailTransport } from "./utils/email.utils.js";

const httpServer = createServer(app);
initSocket(httpServer, allowedOrigins);

httpServer.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    verifyEmailTransport();
});