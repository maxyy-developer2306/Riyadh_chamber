import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import dns from 'dns';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

// Force Node to use Google DNS so the MongoDB SRV lookup works
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const app = express();

// CORS must come first so every response (including preflight and errors) carries the headers
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Simple root route so the deployed URL shows something instead of an error
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Riyadh Chamber API is running' });
});

// 🟢 Database Health Check API
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    // 1 means connected in Mongoose
    const isConnected = dbState === 1;
    
    res.json({
        success: true,
        server: "Running smoothly",
        database: isConnected ? "Connected Successfully 🟢" : "Disconnected 🔴",
        readyState: dbState
    });
});

// Make sure the database is connected before handling any API route
app.use(async (req, res, next) => {
    const conn = await connectDB();
    if (!conn) {
        return res.status(500).json({ success: false, message: 'Database connection failed' });
    }
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Global error handler so unexpected errors return JSON (with CORS headers) instead of crashing
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

// Listen only when running locally; Vercel runs the exported app as a serverless function
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;