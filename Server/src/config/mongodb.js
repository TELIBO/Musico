import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Database connected successfully");
        });

        await mongoose.connect(`${process.env.MONGODB_URI}/musicly`);
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1); // Exit the process if the database connection fails
    }
};

export default connectDB;