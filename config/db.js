import mongoose from "mongoose";
import dns from "dns";

export const connectToDB = async () => {
    try {
        // Set DNS servers to Google public DNS to bypass local ISP DNS issues with SRV records
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
