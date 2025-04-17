import axios from 'axios';

// src/services/earthAPI.js
export const searchLocation = async (query) => {
    try {
      // Use OpenStreetMap Nominatim API instead of NASA for geocoding
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`
      );
      
      if (response.data.length === 0) throw new Error('Location not found');
      
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to find location');
    }
  };
  
  export const getEarthImagery = async (coords) => {
    try {
      const response = await axios.get('https://api.nasa.gov/planetary/earth/imagery', {
        params: {
          lat: coords.lat,
          lon: coords.lon,
          date: '2023-01-01',
          dim: 0.15,
          api_key: process.env.REACT_APP_NASA_KEY
        }
      });
      return { url: response.data.url };
    } catch (error) {
      console.error('NASA Imagery error:', error);
      throw new Error('Satellite imagery unavailable');
    }
  };