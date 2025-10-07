let units = "metric"; 

// Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const unitToggle = document.getElementById("unitToggle");
const modeToggle = document.getElementById("modeToggle");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const icon = document.getElementById("icon");
const forecastDiv = document.getElementById("forecast");
const hourlyDiv = document.getElementById("hourlyForecast");
const historyDiv = document.getElementById("history");

// Recommendations
const healthTip = document.getElementById("healthTip");
const travelTip = document.getElementById("travelTip");
const musicTip = document.getElementById("musicTip");
const clothesTip = document.getElementById("clothesTip");
const quote = document.getElementById("quote");

// ==================== Weather Fetch ====================
async function getWeather(query) {
  try {
    // Replace <your-live-railway-url> with your Railway service URL
    const response = await fetch(`https://<your-live-railway-url>/api/weather?${query}&units=${units}`);
    const data = await response.json();

    if (!response.ok || !data || data.cod === "404") {
      alert("City not found!");
      return;
    }

    displayWeather(data);
    displayForecast(data.forecast);
    saveHistory(data.name);
    generateRecommendations(data);
  } catch (err) {
    console.error("Error fetching weather:", err);
    alert("Error fetching weather data. Please try again.");
  }
}

// ==================== Display Functions ====================
function displayWeather(data) {
  cityName.textContent = data.name;
  temperature.textContent = `${data.main.temp} ${units === "metric" ? "°C" : "°F"}`;
  condition.textContent = data.weather[0].description;
  icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById("extra").textContent =
    `Feels like ${data.main.feels_like}°, Wind ${data.wind.speed} ${units === "metric" ? "m/s" : "mph"}`;

  const main = data.weather[0].main;
  if (main === "Rain") document.body.style.background = "linear-gradient(to right, #4e54c8, #8f94fb)";
  else if (main === "Clear") document.body.style.background = "linear-gradient(to right, #fddb92, #d1fdff)";
  else if (main === "Clouds") document.body.style.background = "linear-gradient(to right, #bdc3c7, #2c3e50)";
  else if (main === "Snow") document.body.style.background = "linear-gradient(to right, #e6e9f0, #eef1f5)";
  else document.body.style.background = "linear-gradient(to right, #74ebd5, #9face6)";
}

function displayForecast(forecastData) {
  forecastDiv.innerHTML = "";
  hourlyDiv.innerHTML = "";
  if (!forecastData?.list) return;

  for (let i = 0; i < 12; i++) {
    const hour = forecastData.list[i];
    if (!hour) continue;
    const time = new Date(hour.dt_txt).getHours() + ":00";
    const div = document.createElement("div");
    div.classList.add("hourly-card");
    div.innerHTML = `
      <p>${time}</p>
      <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" />
      <p>${hour.main.temp} ${units === "metric" ? "°C" : "°F"}</p>
    `;
    hourlyDiv.appendChild(div);
  }

  for (let i = 0; i < forecastData.list.length; i += 8) {
    const day = forecastData.list[i];
    const date = new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" });
    const div = document.createElement("div");
    div.classList.add("forecast-day");
    div.innerHTML = `
      <h4>${date}</h4>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" />
      <p>${day.main.temp} ${units === "metric" ? "°C" : "°F"}</p>
    `;
    forecastDiv.appendChild(div);
  }
}

// ==================== Search History & Recommendations ====================
function saveHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem("weatherHistory", JSON.stringify(history));
    renderHistory();
  }
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  historyDiv.innerHTML = "";
  history.forEach(city => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.onclick = () => getWeather(`city=${city}`);
    historyDiv.appendChild(btn);
  });
}

function generateRecommendations(data) {
  const temp = data.main.temp;
  const main = data.weather[0].main;
  const wind = data.wind.speed;

  if (temp < 15) healthTip.textContent = "🧥 Wear warm clothes and drink hot fluids.";
  else if (temp > 30) healthTip.textContent = "💧 Stay hydrated and avoid outdoor noon activities.";
  else healthTip.textContent = "😊 Weather looks pleasant, enjoy your day!";

  if (main === "Rain") travelTip.textContent = "☔ Carry an umbrella, traffic may be slow.";
  else if (wind > 10) travelTip.textContent = "🌬️ Strong winds, avoid biking.";
  else travelTip.textContent = "🚗 Perfect conditions for travel.";

  if (main === "Rain") musicTip.textContent = "🎵 Lo-fi / Relaxing rain sounds";
  else if (main === "Clear" && temp > 25) musicTip.textContent = "🎶 Energetic upbeat playlist";
  else if (temp < 15) musicTip.textContent = "🎸 Warm cozy acoustic music";
  else musicTip.textContent = "🎷 Calm background jazz";

  if (temp < 15) clothesTip.textContent = "🧣 Jacket, Sweater, Scarf";
  else if (temp > 30) clothesTip.textContent = "😎 Light cotton clothes, sunglasses";
  else if (main === "Rain") clothesTip.textContent = "☔ Raincoat / Umbrella";
  else clothesTip.textContent = "👕 Casual wear";

  const quotes = [
    "🌟 Every day is a fresh start!",
    "☀️ Stay positive, work hard, make it happen.",
    "💡 Small steps lead to big results.",
    "🌈 Enjoy the little things in life.",
    "🔥 Push yourself, because no one else will."
  ];
  quote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

// ==================== Event Listeners ====================
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(`city=${city}`);
});

unitToggle.addEventListener("click", () => {
  units = units === "metric" ? "imperial" : "metric";
  const city = cityName.textContent;
  if (city !== "--") getWeather(`city=${city}`);
});

modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// ==================== On Page Load ====================
window.onload = () => {
  renderHistory();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      getWeather(`lat=${lat}&lon=${lon}`);
    });
  }
};
