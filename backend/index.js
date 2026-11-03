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

connectDB();

const app = express();

app.use(cors());
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

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 5000;

// Listen only when running locally; Vercel runs the exported app as a serverless function
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;