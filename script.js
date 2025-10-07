let units = "metric";

// ==================== Element References ====================
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
const alertDiv = document.getElementById("alert");
const historyDiv = document.getElementById("history");

const healthTip = document.getElementById("healthTip");
const travelTip = document.getElementById("travelTip");
const musicTip = document.getElementById("musicTip");
const clothesTip = document.getElementById("clothesTip");
const quote = document.getElementById("quote");

// ==================== Weather Fetch ====================
async function getWeather(query) {
  try {
    // ✅ Call backend route (API key hidden in .env)
    const response = await fetch(`/api/weather?${query}&units=${units}`);
    const data = await response.json();

    // ✅ Handle invalid responses safely
    if (!response.ok || !data || data.cod === "404") {
      alert("⚠️ City not found or invalid response.");
      return;
    }

    // ✅ Display weather + forecast
    displayWeather(data);
    displayForecast(data.forecast);
    saveHistory(data.name);
    generateRecommendations(data);
  } catch (err) {
    console.error("Error fetching weather:", err);
    alert("❌ Error fetching weather data. Try again later.");
  }
}

// ==================== Display Functions ====================
function displayWeather(data) {
  cityName.textContent = data.name || "--";
  temperature.textContent = `${Math.round(data.main.temp)} ${units === "metric" ? "°C" : "°F"}`;
  condition.textContent = data.weather[0].description;
  icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  document.getElementById("extra").textContent =
    `Feels like ${Math.round(data.main.feels_like)}°, Wind ${data.wind.speed} ${units === "metric" ? "m/s" : "mph"}`;

  // ✅ Dynamic background
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

  // ✅ Hourly forecast (next 12 hours)
  for (let i = 0; i < 12; i++) {
    const hour = forecastData.list[i];
    if (!hour) continue;
    const time = new Date(hour.dt_txt).getHours().toString().padStart(2, "0") + ":00";
    const div = document.createElement("div");
    div.classList.add("hourly-card");
    div.innerHTML = `
      <p>${time}</p>
      <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="icon" />
      <p>${Math.round(hour.main.temp)} ${units === "metric" ? "°C" : "°F"}</p>
    `;
    hourlyDiv.appendChild(div);
  }

  // ✅ 5-day forecast (every 8th data point = 1 day)
  for (let i = 0; i < forecastData.list.length; i += 8) {
    const day = forecastData.list[i];
    const date = new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" });
    const div = document.createElement("div");
    div.classList.add("forecast-day");
    div.innerHTML = `
      <h4>${date}</h4>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="icon" />
      <p>${Math.round(day.main.temp)} ${units === "metric" ? "°C" : "°F"}</p>
    `;
    forecastDiv.appendChild(div);
  }
}

// ==================== Smart Recommendations ====================
function generateRecommendations(data) {
  const temp = data.main.temp;
  const main = data.weather[0].main;
  const wind = data.wind.speed;

  // Health tips
  if (temp < 15) healthTip.textContent = "🧥 Wear warm clothes and drink something hot.";
  else if (temp > 30) healthTip.textContent = "💧 Stay hydrated and avoid heat exposure.";
  else healthTip.textContent = "😊 Pleasant weather — enjoy your day!";

  // Travel tips
  if (main === "Rain") travelTip.textContent = "☔ Carry an umbrella — roads may be wet.";
  else if (wind > 10) travelTip.textContent = "🌬️ Strong winds — drive carefully.";
  else travelTip.textContent = "🚗 Perfect for travel.";

  // Music
  if (main === "Rain") musicTip.textContent = "🎵 Lo-fi or relaxing rain sounds.";
  else if (main === "Clear" && temp > 25) musicTip.textContent = "🎶 Energetic upbeat playlist.";
  else if (temp < 15) musicTip.textContent = "🎸 Cozy acoustic tunes.";
  else musicTip.textContent = "🎷 Chill background jazz.";

  // Clothes
  if (temp < 15) clothesTip.textContent = "🧣 Jacket, Sweater, and Scarf.";
  else if (temp > 30) clothesTip.textContent = "😎 Light cotton and sunglasses.";
  else if (main === "Rain") clothesTip.textContent = "☔ Raincoat or Umbrella.";
  else clothesTip.textContent = "👕 Casual comfortable wear.";

  // Random motivational quote
  const quotes = [
    "🌟 Every day is a fresh start!",
    "☀️ Stay positive, work hard, make it happen.",
    "💡 Small steps lead to big results.",
    "🌈 Enjoy the little things in life.",
    "🔥 Push yourself — no one else will."
  ];
  quote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

// ==================== Search History ====================
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
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  historyDiv.innerHTML = "";
  history.forEach(city => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.onclick = () => getWeather(`city=${city}`);
    historyDiv.appendChild(btn);
  });
}

// ==================== Event Listeners ====================
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(`city=${city}`);
});

unitToggle.addEventListener("click", () => {
  units = units === "metric" ? "imperial" : "metric";
  const city = cityName.textContent;
  if (city && city !== "--") getWeather(`city=${city}`);
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
    }, () => {
      console.warn("Location access denied. Please search manually.");
    });
  } else {
    console.warn("Geolocation not supported by your browser.");
  }
};
