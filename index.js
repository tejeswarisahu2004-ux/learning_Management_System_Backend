import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth.routes.js";
import courseRouter from "./routers/course.routes.js";
import { connectToDB } from "./config/db.js";
import mediaRouter from "./routers/media.routes.js";

dotenv.config();
await connectToDB();

const app = express();

const PORT = process.env.BACKEND_PORT || 3000;
// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended : true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);


// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/media", mediaRouter);
// Database connection


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});