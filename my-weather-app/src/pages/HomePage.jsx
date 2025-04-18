// src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  FiSearch, 
  FiSun, 
  FiCloud, 
  FiCloudRain,
  FiCloudSnow,
  FiWind,
  FiClock,
  FiThermometer,
  FiDroplet
} from 'react-icons/fi';
import { getSearchSuggestions, getCurrentWeather } from '../services/weatherAPI';
import debounce from 'lodash.debounce';

const gradientAnimation = (colors) => keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const getTimeColors = (hour) => {
  if (hour >= 5 && hour < 7) return ['#ffd700', '#ff8c00', '#1a1a2e']; // Dawn
  if (hour >= 7 && hour < 17) return ['#87CEEB', '#00BFFF', '#1a1a2e']; // Day
  if (hour >= 17 && hour < 19) return ['#FF4500', '#8A2BE2', '#1a1a2e']; // Dusk
  return ['#00008B', '#4B0082', '#000000']; // Night
};

const Container = styled.div`
  min-height: 100vh;
  background: ${props => `linear-gradient(-45deg, ${props.colors.join(', ')})`};
  background-size: 400% 400%;
  animation: ${props => gradientAnimation(props.colors)} 15s ease infinite;
  padding: 4rem 2rem 2rem;
  color: white;
  font-family: 'Segoe UI', system-ui, sans-serif;
  transition: background 1s ease;
`;

const WeatherIcon = styled.div`
  font-size: 4rem;
  margin-right: 2rem;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
`;

const TimeDisplayContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  backdrop-filter: blur(10px);
`;

const TimeCard = styled.div`
  text-align: center;
  padding: 1rem;
  
  h3 {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }
  
  div {
    font-size: 1.2rem;
    font-weight: 500;
  }
  
  svg {
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }
`;

const WeatherHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  position: relative;
`;

const SearchForm = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.25rem 4rem 1.25rem 3rem;
  border-radius: 2rem;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  color: white;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(107, 72, 255, 0.4);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
`;

const SearchButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-50%) scale(1.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: calc(100% + 0.5rem);
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  padding: 0.5rem 0;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
`;

const SuggestionItem = styled.li`
  padding: 1rem 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #2d2d2d;
  font-size: 0.95rem;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
`;

const WeatherCard = styled.div`
  background: rgba(255, 255, 255, 0.98);
  border-radius: 2rem;
  padding: 2.5rem;
  max-width: 500px;
  margin: 2rem auto;
  color: #2d2d2d;
  text-align: center;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const UnitToggle = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: linear-gradient(45deg, #6b48ff, #00a3ff);
  color: white;
  border: none;
  border-radius: 1rem;
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(107, 72, 255, 0.3);
  }
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
`;

const WeatherMetric = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 1rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-3px);
  }

  > div {
    margin-top: 0.5rem;
    font-weight: 600;
    color: #444;
  }

  svg {
    color: #6b48ff;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ff6b6b;
  margin: 1rem 0;
  font-weight: 500;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255, 107, 107, 0.1);
`;

const LoadingSpinner = styled.div`
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease infinite;
`;

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState('c');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeData, setTimeData] = useState({
    local: '',
    selected: '',
    utc: ''
  });
  const [backgroundColors, setBackgroundColors] = useState(getTimeColors(new Date().getHours()));
  const debounceRef = useRef();

  const getWeatherIcon = (conditionCode) => {
    const icons = {
      1000: <FiSun />,
      1003: <FiCloud />,
      1006: <FiCloud />,
      1030: <FiCloud />,
      1063: <FiCloudRain />,
      1189: <FiCloudRain />,
      1195: <FiCloudRain />,
      1066: <FiCloudSnow />,
      1219: <FiCloudSnow />,
      1225: <FiCloudSnow />,
      1087: <FiWind />,
    };
    return icons[conditionCode] || <FiCloud />;
  };

  const updateTimes = () => {
    const now = new Date();
    setTimeData({
      local: now.toLocaleTimeString('en-US'),
      selected: weather?.location?.tz_id 
        ? now.toLocaleTimeString('en-US', { timeZone: weather.location.tz_id })
        : 'N/A',
      utc: now.toISOString().substr(11, 8) + ' UTC'
    });
  };

  const fetchSuggestions = useCallback((query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = debounce(async (q) => {
      try {
        const data = await getSearchSuggestions(q);
        setSuggestions(data || []);
      } catch (error) {
        console.error('Suggestions error:', error);
        setSuggestions([]);
      }
    }, 300);
    debounceRef.current(query);
  }, []);

  useEffect(() => {
    fetchSuggestions(searchTerm);
    return () => debounceRef.current?.cancel();
  }, [searchTerm, fetchSuggestions]);

  useEffect(() => {
    const timer = setInterval(() => {
      updateTimes();
      if (weather?.location?.tz_id) {
        const localHour = new Date().toLocaleString('en-US', { 
          hour: 'numeric', 
          hour12: false, 
          timeZone: weather.location.tz_id 
        });
        setBackgroundColors(getTimeColors(parseInt(localHour)));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [weather]);

  const handleSuggestionClick = (location) => {
    const displayText = `${location.name}${location.region ? `, ${location.region}` : ''}, ${location.country}`;
    setSearchTerm(displayText);
    setSuggestions([]);
    debounceRef.current?.cancel();
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await getCurrentWeather(searchTerm.trim());
      setWeather(data);
      setSuggestions([]);
      updateTimes();
    } catch (error) {
      console.error('Search failed:', error);
      setErrorMessage(error.message || 'Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayTemp = (tempC) => {
    return unit === 'c' 
      ? `${Math.round(tempC)}°C` 
      : `${Math.round((tempC * 9/5) + 32)}°F`;
  };

  return (
    <Container colors={backgroundColors}>
      <SearchContainer>
        <SearchForm>
          <SearchIcon />
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search city..."
            disabled={isLoading}
          />
          <SearchButton 
            type="button" 
            onClick={handleSearch} 
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner /> : <FiSearch size={20} />}
          </SearchButton>
          
          {suggestions.length > 0 && (
            <SuggestionsList>
              {suggestions.map((location) => (
                <SuggestionItem
                  key={`${location.id}-${location.lat}-${location.lon}`}
                  onClick={() => handleSuggestionClick(location)}
                >
                  {location.name}{location.region && `, ${location.region}`}, {location.country}
                </SuggestionItem>
              ))}
            </SuggestionsList>
          )}
        </SearchForm>

        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </SearchContainer>

      {weather && (
        <>
          <WeatherCard>
            <UnitToggle onClick={() => setUnit(unit === 'c' ? 'f' : 'c')}>
              °{unit.toUpperCase()}
            </UnitToggle>

            <WeatherHeader>
              <WeatherIcon>
                {getWeatherIcon(weather.current.condition.code)}
              </WeatherIcon>
              <div style={{ fontSize: '3.5rem', fontWeight: '300' }}>
                {getDisplayTemp(weather.current.temp_c)}
              </div>
            </WeatherHeader>

            <h2>
              {weather.location.name}{weather.location.region && `, ${weather.location.region}`}
              <p style={{ fontSize: '1rem', color: '#666', marginTop: '0.5rem' }}>
                {weather.location.country}
              </p>
            </h2>

            <WeatherGrid>
              <WeatherMetric>
                <FiThermometer size={28} />
                <div>Feels Like</div>
                <div>{getDisplayTemp(weather.current.feelslike_c)}</div>
              </WeatherMetric>

              <WeatherMetric>
                <FiDroplet size={28} />
                <div>Humidity</div>
                <div>{weather.current.humidity}%</div>
              </WeatherMetric>

              <WeatherMetric>
                <FiWind size={28} />
                <div>Wind</div>
                <div>
                  {unit === 'c' 
                    ? `${weather.current.wind_kph} kph` 
                    : `${(weather.current.wind_kph * 0.621371).toFixed(1)} mph`}
                </div>
              </WeatherMetric>
            </WeatherGrid>
          </WeatherCard>

          <TimeDisplayContainer>
            <TimeCard>
              <FiClock />
              <h3>Your Time</h3>
              <div>{timeData.local}</div>
            </TimeCard>
            
            <TimeCard>
              <FiClock />
              <h3>{weather?.location?.tz_id || 'Selected'}</h3>
              <div>{timeData.selected}</div>
            </TimeCard>
            
            <TimeCard>
              <FiClock />
              <h3>Global Time</h3>
              <div>{timeData.utc}</div>
            </TimeCard>
          </TimeDisplayContainer>
        </>
      )}
    </Container>
  );
};

export default HomePage;