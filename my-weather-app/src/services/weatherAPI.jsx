// src/services/weatherApi.js
const API_KEY = process.env.ccf521f2b1e0457bb30103730251704;

export const searchLocation = async (query) => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Location search failed');
  }
};

export const getCurrentWeather = async (location) => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}&aqi=no`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Weather data fetch failed');
  }
};

export const getForecast = async (location) => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=3&aqi=no&alerts=no`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Forecast fetch failed');
  }
};