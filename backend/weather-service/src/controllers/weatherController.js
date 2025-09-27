import { fetchWeatherData, fetchMarineWeatherData, fetchTideData } from "../services/weatherServices.js";
import weatherForecast from "../models/weatherForecast.js";

export const getWeatherData = async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const existingForecast = await weatherForecast.findOne({ lat, lon }).sort({ createdAt: -1 });
    if (existingForecast) {
      return res.json({ success: true, data: existingForecast.data, cached: true });
    }

    const [weather, marine, tides] = await Promise.all([
      fetchWeatherData(lat, lon),       // Land weather
      fetchMarineWeatherData(lat, lon), // Marine conditions
      fetchTideData(lat, lon),          // Tides
    ]);

    const combinedData = { weather, marine, tides };

    await weatherForecast.create({ lat, lon, source: "Combined", data: combinedData });

    res.json({ success: true, data: combinedData, cached: false });
    

  } catch (err) {
    console.error("Error in getWeatherData:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};