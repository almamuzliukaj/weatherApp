import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, FlatList, ScrollView } from "react-native";

export default function App() {
  const [city, setCity] = useState("London");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const API_KEY = "4899bb7a90f578bd5f45d3f36241f326";

  const fetchWeatherByCity = async (cityName) => {
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
    try {
      Keyboard.dismiss();
      setError("");

      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("City not found or API issue");

      const data = await response.json();
      console.log("FULL WEATHER OBJECT:", data);
      setWeather(data);

      fetchForecast(cityName);

    } catch (err) {
      console.error("Error fetching weather:", err.message);
      setError("Unable to fetch weather. Check city name or connection.");
    }
  };

  const fetchForecast = async (cityName) => {
    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`;
    try {
      const response = await fetch(FORECAST_URL);
      if (!response.ok) throw new Error("Forecast fetch failed");

      const data = await response.json();
      console.log("FULL FORECAST OBJECT:", data);

      const dailyForecasts = data.list.filter(forecastItem => forecastItem.dt_txt.includes("12:00:00"));
      setForecast(dailyForecasts);
      console.log("Parsed Daily Forecasts:", dailyForecasts);

    } catch (err) {
      console.error("Error fetching forecast:", err.message);
    }
  };

  useEffect(() => {
    fetchWeatherByCity(city);
  }, []);

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
        <TouchableOpacity
          style={styles.button}
          onPress={() => fetchWeatherByCity(city)}
        >
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {weather && (
        <View style={[styles.weatherCard, styles.todayCard]}>
          <Text style={[styles.city, styles.todayCity]}>{weather.name}</Text>
          <Text style={[styles.temp, styles.todayTemp]}>{weather.main.temp}°C</Text>
          <Text style={[styles.description, styles.todayDesc]}>{weather.weather[0].description}</Text>
        </View>
      )}

      {forecast.length > 0 && (
        <View style={styles.forecastContainer}>
          <Text style={styles.forecastTitle}>5-Day Forecast</Text>
          <FlatList
            horizontal
            contentContainerStyle={styles.forecastList}
            data={forecast}
            keyExtractor={(item) => item.dt.toString()}
            renderItem={({ item }) => (
              <View style={styles.forecastCard}>
                <Text style={styles.forecastDate}>{item.dt_txt.split(' ')[0]}</Text>
                <Text style={styles.forecastTemp}>{item.main.temp}°C</Text>
                <Text style={styles.forecastDesc}>{item.weather[0].description}</Text>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    width: "100%",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  error: {
    color: "#f87171",
    textAlign: "center",
    marginBottom: 10,
  },
  weatherCard: {
    backgroundColor: "#1e293b",
    padding: 25,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 30,
    width: 300,
  },
  todayCard: {
    width: 320,
    padding: 30,
  },
  city: {
    fontSize: 22,
    color: "#ffffff",
    fontWeight: "bold",
  },
  todayCity: {
    fontSize: 26,
  },
  temp: {
    fontSize: 48,
    color: "#38bdf8",
    marginVertical: 10,
  },
  todayTemp: {
    fontSize: 56,
  },
  description: {
    fontSize: 18,
    color: "#cbd5f5",
    textTransform: "capitalize",
  },
  todayDesc: {
    fontSize: 20,
  },
  forecastContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  forecastTitle: {
    fontSize: 22,
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  forecastList: {
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  forecastCard: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 10,
    width: 140,
  },
  forecastDate: {
    color: "#94a3b8",
    marginBottom: 8,
    fontSize: 14,
  },
  forecastTemp: {
    color: "#38bdf8",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  forecastDesc: {
    color: "#cbd5f5",
    fontSize: 14,
    textAlign: "center",
  },
});