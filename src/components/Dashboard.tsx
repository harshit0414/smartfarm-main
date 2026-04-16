import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { fetchWeather, type WeatherData } from "@/lib/weather";
import logo from "@/assets/logo.png";

interface ESP32Status {
  connected: boolean;
  ip: string;
  ssid: string;
  rssi: number;
  lastSeen: string;
}

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span className="relative flex h-3 w-3">
      {connected && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
      )}
      <span
        className={`relative inline-flex h-3 w-3 rounded-full ${connected ? "bg-success" : "bg-destructive"}`}
      />
    </span>
  );
}

function StatCard({ label, value, unit, icon }: { label: string; value: string; unit?: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold text-foreground font-display">
        {value}
        {unit && <span className="text-base font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </motion.div>
  );
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [espStatus, setEspStatus] = useState<ESP32Status>({
    connected: false,
    ip: "—",
    ssid: "—",
    rssi: 0,
    lastSeen: "Never",
  });
  const [pumpOn, setPumpOn] = useState(false);
  const [irrigationDelayed, setIrrigationDelayed] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  // Fetch weather data
  const loadWeather = useCallback(async () => {
    try {
      setWeatherLoading(true);
      setWeatherError("");
      const data = await fetchWeather();
      setWeather(data);

      // Auto-delay irrigation if rain expected
      if (data.rainExpected || data.isRaining) {
        if (pumpOn) {
          setPumpOn(false);
        }
        setIrrigationDelayed(true);
      } else {
        setIrrigationDelayed(false);
      }
    } catch {
      setWeatherError("Could not fetch weather data");
    } finally {
      setWeatherLoading(false);
    }
  }, [pumpOn]);

  useEffect(() => {
    loadWeather();
    const interval = setInterval(loadWeather, 10 * 60 * 1000); // every 10 min
    return () => clearInterval(interval);
  }, []);

  // Simulated ESP32 status polling
  useEffect(() => {
    const mockCheck = () => {
      const isConnected = Math.random() > 0.3;
      setEspStatus({
        connected: isConnected,
        ip: isConnected ? "192.168.1.105" : "—",
        ssid: isConnected ? "FarmNet_5G" : "—",
        rssi: isConnected ? -45 - Math.floor(Math.random() * 20) : 0,
        lastSeen: isConnected ? new Date().toLocaleTimeString() : espStatus.lastSeen,
      });
    };
    mockCheck();
    const interval = setInterval(mockCheck, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePumpToggle = () => {
    if (irrigationDelayed && !pumpOn) {
      // Allow manual override but warn
      const confirmed = window.confirm(
        "Rain is expected. Are you sure you want to turn on the irrigation pump?"
      );
      if (!confirmed) return;
      setIrrigationDelayed(false);
    }
    setPumpOn(!pumpOn);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SmartFarm" className="h-9 w-9" width={36} height={36} />
            <div>
              <h1 className="text-lg font-display text-foreground leading-tight">SmartFarm</h1>
              <p className="text-xs text-muted-foreground">IoT Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Weather Monitoring Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border-2 border-border bg-card p-6 shadow-sm overflow-hidden relative"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Current Weather */}
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-solar/15 text-4xl shrink-0">
                {weatherLoading ? "🌍" : weather?.icon || "🌍"}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  Current Weather
                  {weather?.isRaining && (
                    <span className="text-xs font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                      RAINING NOW
                    </span>
                  )}
                </h2>
                {weatherLoading ? (
                  <p className="text-sm text-muted-foreground mt-1">Fetching weather data...</p>
                ) : weatherError ? (
                  <p className="text-sm text-destructive mt-1">{weatherError}</p>
                ) : weather ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    {weather.description} • {weather.temperature}°C • Humidity {weather.humidity}% • Wind {weather.windSpeed} km/h
                  </p>
                ) : null}
              </div>
            </div>

            {/* Rain Forecast */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Rain Chance (6h)</p>
                <div className={`text-2xl font-display font-bold ${
                  (weather?.rainProbability ?? 0) >= 50 ? "text-destructive" : 
                  (weather?.rainProbability ?? 0) >= 30 ? "text-warning" : "text-success"
                }`}>
                  {weatherLoading ? "—" : `${weather?.rainProbability ?? 0}%`}
                </div>
              </div>
              <button
                onClick={loadWeather}
                disabled={weatherLoading}
                className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Rain Alert Banner */}
          <AnimatePresence>
            {(weather?.rainExpected || weather?.isRaining) && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌧️</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {weather?.isRaining ? "It's currently raining!" : "Rain Alert — Rain expected in the next 6 hours"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {irrigationDelayed
                        ? "✅ Irrigation has been automatically delayed to conserve water. You can manually override."
                        : "Irrigation will be automatically paused when rain is detected."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ESP32 Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 rounded-2xl border-2 p-6 shadow-sm ${
            espStatus.connected
              ? "border-success/30 bg-success/5"
              : "border-destructive/30 bg-destructive/5"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl ${
                  espStatus.connected ? "bg-success/15" : "bg-destructive/15"
                }`}
              >
                📡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <StatusDot connected={espStatus.connected} />
                  <h2 className="text-lg font-semibold text-foreground">
                    ESP32 {espStatus.connected ? "Connected" : "Disconnected"}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {espStatus.connected
                    ? `WiFi: ${espStatus.ssid} • IP: ${espStatus.ip} • Signal: ${espStatus.rssi} dBm`
                    : "Device is not connected to WiFi. Check your ESP32 module."}
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Last seen: {espStatus.lastSeen}
            </div>
          </div>
        </motion.div>

        {/* Irrigation Pump Control */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 rounded-2xl border-2 p-6 shadow-sm ${
            irrigationDelayed
              ? "border-warning/30 bg-warning/5"
              : "border-border bg-card"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl ${
                irrigationDelayed ? "bg-warning/15" : "bg-primary/10"
              }`}>
                💦
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  Irrigation Pump
                  {irrigationDelayed && (
                    <span className="text-xs font-medium bg-warning/15 text-warning-foreground px-2 py-0.5 rounded-full">
                      DELAYED — RAIN
                    </span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {irrigationDelayed
                    ? "Irrigation delayed due to expected rain. You can manually override."
                    : pumpOn
                      ? "Pump is currently running — water is flowing to crops"
                      : "Pump is off — tap the button to start irrigation"}
                </p>
              </div>
            </div>
            <button
              onClick={handlePumpToggle}
              className={`relative flex items-center gap-3 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 shadow-md ${
                pumpOn
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : irrigationDelayed
                    ? "bg-warning text-warning-foreground hover:bg-warning/90"
                    : "bg-success text-success-foreground hover:bg-success/90"
              }`}
            >
              <span className="relative flex h-3 w-3">
                {pumpOn && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive-foreground opacity-75" />
                )}
                <span className={`relative inline-flex h-3 w-3 rounded-full ${
                  pumpOn ? "bg-destructive-foreground" : irrigationDelayed ? "bg-warning-foreground" : "bg-success-foreground"
                }`} />
              </span>
              {pumpOn ? "Turn OFF" : irrigationDelayed ? "Override & Turn ON" : "Turn ON"}
            </button>
          </div>
        </motion.div>

        {/* Sensor Stats Grid */}
        <h3 className="text-lg font-semibold text-foreground mb-4">Farm Sensors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🌡️" label="Temperature" value={weather ? weather.temperature.toFixed(1) : "28.5"} unit="°C" />
          <StatCard icon="💧" label="Soil Moisture" value="65" unit="%" />
          <StatCard icon="🌤️" label="Light Intensity" value="842" unit="lux" />
          <StatCard icon="💨" label="Humidity" value={weather ? String(weather.humidity) : "72"} unit="%" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="☀️" label="Solar Power" value="4.2" unit="W" />
          <StatCard icon="🔋" label="Battery Level" value="87" unit="%" />
          <StatCard icon="🌱" label="Soil pH" value="6.5" />
          <StatCard icon="🌬️" label="Wind Speed" value={weather ? weather.windSpeed.toFixed(1) : "12"} unit="km/h" />
        </div>

        {/* AI Recommendations */}
        <h3 className="text-lg font-semibold text-foreground mb-4">AI Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Rain-based recommendation */}
          {weather?.rainExpected && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-destructive/20 bg-destructive/5 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🌧️</span>
                <span className="text-sm font-semibold text-foreground">Rain-Smart Irrigation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Rain probability is {weather.rainProbability}% in the next 6 hours. 
                Irrigation has been automatically delayed. This saves approximately 2,000 liters of water per cycle.
              </p>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🤖</span>
              <span className="text-sm font-semibold text-foreground">Irrigation Alert</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Soil moisture is at 65%. {weather?.rainExpected 
                ? "However, rain is expected — no irrigation needed now."
                : "Based on current weather forecast, consider irrigating in the next 2 hours for optimal growth."}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚡</span>
              <span className="text-sm font-semibold text-foreground">Solar Optimization</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Solar panels producing 4.2W. Battery at 87%. System is self-sufficient. 
              Panel angle can be adjusted 5° west for 12% more afternoon yield.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
