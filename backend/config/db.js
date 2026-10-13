import mongoose from "mongoose";

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set. Copy .env.example to .env and fill it in.");
  }
  try {
    // dbName lets the URI omit a database; otherwise MongoDB would silently use "test".
    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || "fieldnote",
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    throw new Error(
      `Could not connect to MongoDB (${err.message}). Check MONGO_URI and, for Atlas, that your IP is allowed in Network Access.`
    );
  }
}

export default connectDB;
