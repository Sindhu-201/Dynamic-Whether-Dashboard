import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// Railway auto-assigns PORT
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from root (index.html should be in project root)
app.use(express.static(path.join(__dirname)));

// Weather API route
app.get("/api/weather", async (req, res) => {
  const { city, lat, lon } = req.query;
  const apiKey = process.env.API_KEY;
  const units = "metric";

  try {
    let url;
    if (city) url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;
    else if (lat && lon) url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    else return res.status(400).json({ error: "City or coordinates required" });

    const response = await fetch(url);
    const data = await response.json();

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}&units=${units}`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    res.json({ ...data, forecast: forecastData });
  } catch (err) {
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

// Fallback for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
