import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.use(cors({origin: ['http://localhost:3012', 'https://sam.netdw.tech']}));
app.use(express.json());

// Resources Routes Import
import leadsRoutes from "./routes/leads.routes.js";
import businessRoutes from "./routes/business.routes.js";
import donationsRoutes from "./routes/donations.routes.js";
import institutionsRoutes from "./routes/institutions.routes.js";
import needsRoutes from "./routes/needs.routes.js";
import offersRoutes from "./routes/offers.routes.js";
import patronsRoutes from "./routes/patrons.routes.js";
import minioRoutes from "./routes/minio.routes.js";
import citizensRoutes from "./routes/citizens.routes.js";

import vouchersRoutes from "./routes/vouchers.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import logsRoutes from "./routes/logs.routes.js";
import telemetryRoutes from "./routes/telemetry.routes.js"; 

// Apply Router
app.use('/leads', leadsRoutes);
app.use('/business', businessRoutes);
app.use('/donations', donationsRoutes);
app.use('/institutions', institutionsRoutes);
app.use('/needs', needsRoutes);
app.use('/offers', offersRoutes);
app.use('/patrons', patronsRoutes);
app.use('/citizens', citizensRoutes);

app.use('/vouchers', vouchersRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/logs', logsRoutes);
app.use('/telemetry', telemetryRoutes);

app.use("/api/upload", minioRoutes);

// Unknown Routes Handler
app.use((req, res, next) => {
    const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
    error.status = 404;
    next(error)
});

// Error Handler
app.use((err, req, res, next) => {
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

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});