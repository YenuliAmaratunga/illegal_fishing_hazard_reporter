//Initialize express and middelware
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import weatherRoutes from "./routes/weatherRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_, res) => res.status(200).send('OK'));

app.use("/api/weather", weatherRoutes);

export default app;
