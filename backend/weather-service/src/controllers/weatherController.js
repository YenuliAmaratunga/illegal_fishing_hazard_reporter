import { fetchWeatherData, fetchStormGlassData, fetchTideData, fetchExtendedForecast } from "../services/weatherServices.js";
import weatherForecast from "../models/weatherForecast.js";
export const getWeatherData = async (req, res) => {
  const { lat, lon } = req.query;

  try {
    // 1️⃣ Check if forecast already exists in DB
    const existingForecast = await weatherForecast.findOne({ lat, lon }).sort({ createdAt: -1 });
    if (existingForecast) {
      console.log("✅ Returning cached forecast from DB");
      return res.json({
        success: true,
        data: existingForecast.data,
        cached: true, // helpful flag for debugging
      });
    }

    // 2️⃣ If not in DB, fetch from external APIs
    const [openWeather, stormGlass, tides, extended] = await Promise.all([
      fetchWeatherData(lat, lon),
      fetchStormGlassData(lat, lon),
      fetchTideData(lat, lon),
      fetchExtendedForecast(lat, lon),
    ]);

    const combinedData = { openWeather, stormGlass, tides, extended };

    // 3️⃣ Save to DB
    await weatherForecast.create({
      lat,
      lon,
      source: "Combined",
      data: combinedData,
    });

    res.json({
      success: true,
      data: combinedData,
      cached: false, // indicates fresh API call
    });
  } catch (err) {
    console.error("❌ Error in getWeatherData:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

