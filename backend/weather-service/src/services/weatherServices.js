// External API calls (OpenWeatherMap, StormGlass, WorldTides)
import axios from "axios";

// Fetch current weather data (OpenWeather)
export const fetchWeatherData = async (lat, lon) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    return {
      source: "OpenWeather",
      location: response.data.name,
      temperature: response.data.main.temp,
      windSpeed: response.data.wind.speed,
      conditions: response.data.weather[0].description,
    };
  } catch (err) {
    console.error("OpenWeather API error:", err.message);
    return { source: "OpenWeather", error: err.message };
  }
};

// Fetch extended forecast (OpenWeather One Call API)
export const fetchExtendedForecast = async (lat, lon) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    return {
      source: "OpenWeather",
      current: response.data.current,
      hourly: response.data.hourly,
      daily: response.data.daily,
    };
  } catch (err) {
    console.error("OpenWeather OneCall error:", err.message);
    return { source: "OpenWeather", error: err.message };
  }
};


// Fetch marine data: waves, tides, currents (StormGlass)
export const fetchStormGlassData = async (lat, lon) => {
  try {
    const apiKey = process.env.STORMGLASS_API_KEY;
    const url = `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=waveHeight,windSpeed,currentSpeed`;

    const response = await axios.get(url, {
      headers: { Authorization: apiKey },
    });

    const data = response.data.hours[0]; // first hour forecast
    return {
      source: "StormGlass",
      waveHeight: data.waveHeight?.noaa ?? null,
      windSpeed: data.windSpeed?.noaa ?? null,
      currentSpeed: data.currentSpeed?.noaa ?? null,
    };
  } catch (err) {
    console.error("StormGlass API error:", err.message);
    return { source: "StormGlass", error: err.message };
  }
};

// Fetch tide data (WorldTides)
export const fetchTideData = async (lat, lon) => {
  try {
    const apiKey = process.env.WORLDTIDES_API_KEY;
    const url = `https://www.worldtides.info/api/v3?extremes&lat=${lat}&lon=${lon}&key=${apiKey}`;

    const response = await axios.get(url);
    return {
      source: "WorldTides",
      tides: response.data.extremes.map((tide) => ({
        type: tide.type,
        date: tide.date,
        height: tide.height,
      })),
    };
  } catch (err) {
    console.error("WorldTides API error:", err.message);
    return { source: "WorldTides", error: err.message };
  }
};
