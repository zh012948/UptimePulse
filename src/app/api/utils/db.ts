import mongoose from "mongoose";

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    if (!process.env.MONGO_URI_ATLAS) throw new Error("MONGO_URI_ATLAS not defined");
    if (!process.env.DB_NAME) throw new Error("DB_NAME not defined");

    const mongoUri = `${process.env.MONGO_URI_ATLAS}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
};

export default connectDB;
