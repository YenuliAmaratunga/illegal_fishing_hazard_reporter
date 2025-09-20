// controllers/weatherController.js
import { fetchWeatherData, fetchStormGlassData, fetchTideData } from "../services/weatherServices.js";

export const getWeatherData = async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const [openWeather, stormGlass, tides] = await Promise.all([
      fetchWeatherData(lat, lon),
      fetchStormGlassData(lat, lon),
      fetchTideData(lat, lon),
    ]);

    res.json({
      success: true,
      data: { openWeather, stormGlass, tides },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
