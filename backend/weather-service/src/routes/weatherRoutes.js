//Controllers handle request + response logic
import express from "express";
import { getWeatherData } from "../controllers/weatherController.js";

const router = express.Router();

router.get("/forecast", getWeatherData);

export default router;
