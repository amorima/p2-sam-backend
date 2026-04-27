import express from "express";
import "dotenv/config";

const app = express();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

app.use(express.json());

// Resources Routes Import
import leadsRoutes from "./routes/leads.routes.js";

// Apply Router
app.use('/leads', leadsRoutes);

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