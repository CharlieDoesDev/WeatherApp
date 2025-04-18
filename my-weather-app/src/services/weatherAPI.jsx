// src/services/weatherApi.js
const API_KEY = "ccf521f2b1e0457bb30103730251704"; // Directly embed the key

// src/services/weatherApi.js
export const getSearchSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`
      );
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('Suggestions API Error:', error);
      return [];
    }
  };
  
  export const getCurrentWeather = async (location) => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}`
      );
      if (!response.ok) throw new Error('Weather fetch failed');
      return response.json();
    } catch (error) {
      console.error('Weather API Error:', error);
      throw error;
    }
  };