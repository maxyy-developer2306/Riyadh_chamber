import mongoose from 'mongoose';

// Cache the connection so serverless invocations reuse it instead of reconnecting every time
let cached = global._mongooseCache;
if (!cached) {
    cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
    // Reuse the existing connection if there is one
    if (cached.conn) return cached.conn;

    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is missing in environment variables');
        return null;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
    } catch (error) {
        // Reset the promise so the next request can retry; never exit the process on serverless
        cached.promise = null;
        console.error(`Error: ${error.message}`);
    }

    return cached.conn;
};

export default connectDB;