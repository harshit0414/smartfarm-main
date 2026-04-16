export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isRaining: boolean;
  rainProbability: number;
  rainExpected: boolean;
  description: string;
  icon: string;
}

const WEATHER_CODE_MAP: Record<number, { description: string; icon: string; isRain: boolean }> = {
  0: { description: "Clear sky", icon: "☀️", isRain: false },
  1: { description: "Mainly clear", icon: "🌤️", isRain: false },
  2: { description: "Partly cloudy", icon: "⛅", isRain: false },
  3: { description: "Overcast", icon: "☁️", isRain: false },
  45: { description: "Foggy", icon: "🌫️", isRain: false },
  48: { description: "Depositing rime fog", icon: "🌫️", isRain: false },
  51: { description: "Light drizzle", icon: "🌦️", isRain: true },
  53: { description: "Moderate drizzle", icon: "🌦️", isRain: true },
  55: { description: "Dense drizzle", icon: "🌧️", isRain: true },
  61: { description: "Slight rain", icon: "🌧️", isRain: true },
  63: { description: "Moderate rain", icon: "🌧️", isRain: true },
  65: { description: "Heavy rain", icon: "🌧️", isRain: true },
  80: { description: "Slight rain showers", icon: "🌦️", isRain: true },
  81: { description: "Moderate rain showers", icon: "🌧️", isRain: true },
  82: { description: "Violent rain showers", icon: "⛈️", isRain: true },
  95: { description: "Thunderstorm", icon: "⛈️", isRain: true },
  96: { description: "Thunderstorm with hail", icon: "⛈️", isRain: true },
  99: { description: "Thunderstorm with heavy hail", icon: "⛈️", isRain: true },
};

function getWeatherInfo(code: number) {
  return WEATHER_CODE_MAP[code] || { description: "Unknown", icon: "🌍", isRain: false };
}

export async function fetchWeather(lat: number = 20.5937, lon: number = 78.9629): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=precipitation_probability&forecast_days=1&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status}`);
  }

  const data = await res.json();
  const current = data.current;
  const weatherInfo = getWeatherInfo(current.weather_code);

  // Check next 6 hours for rain probability
  const hourlyProbs: number[] = data.hourly?.precipitation_probability?.slice(0, 6) || [];
  const maxRainProb = Math.max(...hourlyProbs, 0);

  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
    isRaining: weatherInfo.isRain,
    rainProbability: maxRainProb,
    rainExpected: maxRainProb >= 50,
    description: weatherInfo.description,
    icon: weatherInfo.icon,
  };
}
