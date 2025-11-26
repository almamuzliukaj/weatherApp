import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  FlatList,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  ActivityIndicator
} from "react-native";

const { width } = Dimensions.get("window");

export default function App() {
  const [city, setCity] = useState("Pristina");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_KEY = "4899bb7a90f578bd5f45d3f36241f326";

  const fetchWeatherByCity = async (cityName) => {
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;

    setLoading(true);
    setWeather(null);
    setForecast([]);
    setError("");

    try {
      Keyboard.dismiss();

      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("City not found");

      const data = await response.json();
      setWeather(data);
      await fetchForecast(cityName);
    } catch {
      setError("Unable to fetch weather. Check city or connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (cityName) => {
    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`;
    const response = await fetch(FORECAST_URL);
    const data = await response.json();
    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    setForecast(daily);
  };

  useEffect(() => {
    fetchWeatherByCity(city);
  }, []);

  const getIcon = (icon) =>
    `https://openweathermap.org/img/wn/${icon}@4x.png`;

  // Helper function to format dates (e.g. "Thu, Nov 27")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // NEW: Helper function to format UNIX timestamps to HH:MM AM/PM (Step 3)
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  /* ================= MODAL DETAIL VIEW ================= */

  const WeatherDetailModal = () => (
    <Modal visible={!!selectedDay} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalDate}>
            {selectedDay ? formatDate(selectedDay.dt_txt) : ""}
          </Text>

          <Image
            source={{ uri: getIcon(selectedDay?.weather[0].icon) }}
            style={styles.modalIcon}
          />

          <Text style={styles.modalTemp}>
            {Math.round(selectedDay?.main.temp)}°C
          </Text>

          <Text style={styles.modalDesc}>
            {selectedDay?.weather[0].description}
          </Text>

          <View style={styles.modalStats}>
            <Text style={styles.stat}>Feels Like: {Math.round(selectedDay?.main.feels_like)}°C</Text>
            <Text style={styles.stat}>Humidity: {selectedDay?.main.humidity}%</Text>
            <Text style={styles.stat}>Wind: {selectedDay?.wind.speed} m/s</Text>
            <Text style={styles.stat}>Pressure: {selectedDay?.main.pressure} hPa</Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedDay(null)}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Weather Dashboard</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Enter city"
        />
        <TouchableOpacity style={styles.button} onPress={() => fetchWeatherByCity(city)} disabled={loading}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* ERROR MESSAGE */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* LOADING SPINNER */}
      {loading ? (
        <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 50 }} />
      ) : (
        <>
          {weather && (
            <View style={styles.todayCard}>
              <Text style={styles.city}>{weather.name}</Text>
              <Image source={{ uri: getIcon(weather.weather[0].icon) }} style={styles.mainIcon} />
              <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
              <Text style={styles.description}>{weather.weather[0].description}</Text>

              {/* MODIFIED: Added Sunrise and Sunset here (Step 3) */}
              <View style={styles.currentDetails}>
                <Text style={styles.detailText}>Feels Like: {Math.round(weather.main.feels_like)}°C</Text>
                <Text style={styles.detailText}>Humidity: {weather.main.humidity}%</Text>
                <Text style={styles.detailText}>Wind: {weather.wind.speed} m/s</Text>
                
                {/* SUNRISE / SUNSET DATA */}
                <Text style={styles.detailText}>Sunrise: {formatTime(weather.sys.sunrise)}</Text>
                <Text style={styles.detailText}>Sunset: {formatTime(weather.sys.sunset)}</Text>
              </View>
            </View>
          )}

          {forecast.length > 0 && (
            <View style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>5-Day Forecast</Text>

              <FlatList
                horizontal
                data={forecast}
                keyExtractor={(item) => item.dt.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.forecastCard}
                    onPress={() => setSelectedDay(item)}
                  >
                    <Text style={styles.forecastDate}>{formatDate(item.dt_txt)}</Text>
                    
                    <Image source={{ uri: getIcon(item.weather[0].icon) }} style={styles.forecastIcon} />
                    <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
                    <Text style={styles.forecastDesc}>{item.weather[0].description}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </>
      )}

      {selectedDay && <WeatherDetailModal />}
    </ScrollView>
  );
}

/* ================== STYLES ================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  scrollContainer: { padding: 20, paddingTop: 60, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 20 },

  searchContainer: { flexDirection: "row", gap: 10, width: "100%", marginBottom: 20 },
  input: { flex: 1, backgroundColor: "#fff", padding: 12, borderRadius: 10 },
  button: { backgroundColor: "#2563eb", paddingHorizontal: 20, borderRadius: 10, justifyContent: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  errorText: { color: "#ef4444", marginBottom: 10, fontWeight: "bold" },

  todayCard: {
    backgroundColor: "#1e293b",
    padding: 30,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 40
  },
  mainIcon: { width: 120, height: 120 },
  city: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  temp: { fontSize: 56, color: "#38bdf8" },
  description: { fontSize: 20, color: "#cbd5f5", textTransform: "capitalize" },

  currentDetails: { marginTop: 15 },
  detailText: { color: "#94a3b8", fontSize: 14 },

  forecastContainer: { width: "100%" },
  forecastTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15 },

  forecastCard: {
    backgroundColor: "#1e293b",
    borderRadius: 15,
    padding: 20,
    width: width * 0.45,
    marginHorizontal: 10,
    alignItems: "center"
  },
  forecastIcon: { width: 60, height: 60 },
  forecastDate: { color: "#94a3b8" },
  forecastTemp: { color: "#38bdf8", fontSize: 22, fontWeight: "bold" },
  forecastDesc: { color: "#cbd5f5", fontSize: 14, textAlign: "center" },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalCard: {
    backgroundColor: "#1e293b",
    padding: 30,
    borderRadius: 20,
    width: "85%",
    alignItems: "center"
  },
  modalIcon: { width: 100, height: 100 },
  modalDate: { color: "#fff", fontSize: 18 },
  modalTemp: { fontSize: 42, color: "#38bdf8" },
  modalDesc: { color: "#cbd5f5", fontSize: 16, textTransform: "capitalize" },
  modalStats: { marginTop: 15 },
  stat: { color: "#94a3b8" },

  closeButton: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  closeText: { color: "#fff", fontWeight: "bold" }
});