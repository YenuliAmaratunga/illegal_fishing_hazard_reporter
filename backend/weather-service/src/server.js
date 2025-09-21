//Start the server
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5001;

// connect to DB
connectDB();

app.listen(PORT, () => {
  console.log(`🌍 Weather service running on port ${PORT}`);
});
