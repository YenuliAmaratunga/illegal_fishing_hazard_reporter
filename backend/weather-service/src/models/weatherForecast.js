import mongoose from "mongoose";

const WeatherForecastSchema = new mongoose.Schema({
  lat: Number,
  lon: Number,
  source: String,
  data: Object, // store raw API response or parsed JSON
  createdAt: { type: Date, default: Date.now, expires: 3600 } // auto-delete after 1hr
});

export default mongoose.model("Forecast", WeatherForecastSchema);
