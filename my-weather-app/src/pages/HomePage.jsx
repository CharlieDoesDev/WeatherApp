// src/pages/HomePage.jsx
import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { getEarthImagery, searchLocation } from '../services/earthAPI';

// Add this utility function at the top of the file
const randomPosition = () => ({
    style: {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`
    }
  });

// 1) Gradient keyframes (fallback before search)
const gradientAnimation = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 2) Zoom effect when new image loads
const zoomEffect = keyframes`
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// 3) Main Background container
const Background = styled.div`
  position: relative;
  min-height: 100vh;
  padding: 2rem;
  overflow: hidden;

  /* top = nasa image (if any), bottom = gradient */
  background-image: ${({ imageurl }) =>
    imageurl
      ? `url(${imageurl}), linear-gradient(-45deg, #0f0c29, #1a1833, #24243e)`
      : `linear-gradient(-45deg, #0f0c29, #1a1833, #24243e)`};

  background-size: ${({ imageurl }) =>
    imageurl ? 'cover, 400% 400%' : '400% 400%'};
  background-position: ${({ imageurl }) =>
    imageurl ? 'center, 0% 50%' : '0% 50%'};
  background-repeat: no-repeat;

  animation: ${({ imageurl, triggerZoom }) =>
    imageurl
      ? css`${zoomEffect} 1s ease forwards`
      : css`${gradientAnimation} 15s ease infinite`};
`;

const FloatingBlobs = styled.div.attrs(randomPosition)`
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  filter: blur(80px);
`;

const TimeDisplay = styled.div`
  position: fixed; top: 2rem; right: 2rem;
  color: white; font-size: 1.5rem;
  font-family: 'Courier New', monospace;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const SearchBar = styled.form`
  max-width: 600px; margin: 0 auto;
  display: flex; gap: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1.25rem 2rem;
  border: none; border-radius: 2rem;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  color: white; font-size: 1.1rem;
  transition: background 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    background: rgba(255,255,255,0.2);
    box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
    outline: none;
  }
`;

const SearchButton = styled.button`
  padding: 1rem 2rem;
  border: none; border-radius: 2rem;
  background: linear-gradient(45deg, #6b48ff, #00a3ff);
  color: white; font-weight: bold;
  cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(107,72,255,0.4);
  }
`;

const ErrorMessage = styled.div`
  margin-top: 1rem;
  text-align: center;
  color: #ff6b6b;
  font-weight: bold;
`;

const WeatherCard = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 2rem; padding: 2.5rem;
  max-width: 800px; margin: 2rem auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform-style: preserve-3d;

  &:hover {
    transform: translateY(-5px) rotateX(2deg) rotateY(2deg);
    box-shadow: 0 15px 45px rgba(0,0,0,0.2);
  }
`;

const WeatherContent = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
  margin-top: 2rem;
`;

const TemperatureDisplay = styled.div`
  font-size: 5rem; font-weight: 300;
  color: #2d2d2d; line-height: 1;
`;

const WeatherMeta = styled.div`
  display: flex; flex-direction: column; gap: 0.5rem;
  color: #666;
`;

const HomePage = () => {
  const [coordinates, setCoordinates] = useState(null);
  const [imageryUrl, setImageryUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerZoom, setTriggerZoom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async e => {
    e.preventDefault();
    console.log('🔍 handleSearch fired with:', searchTerm);

    if (!searchTerm.trim()) {
      setErrorMessage('Please enter a location.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    try {
      const coords = await searchLocation(searchTerm);
      console.log('📍 coords:', coords);
      setCoordinates(coords);

      const { url } = await getEarthImagery(coords);
      console.log('🖼️ imagery URL:', url);
      setImageryUrl(url);

      // retrigger zoom
      setTriggerZoom(z => !z);
    } catch (err) {
      console.error('🚨 NASA API Error:', err);
      setErrorMessage('Failed to load imagery. Check console or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update Background component
    const Background = styled.div.attrs(props => ({
        style: {
        backgroundImage: props.$imageurl 
            ? `url(${props.$imageurl}), linear-gradient(-45deg, #0f0c29, #1a1833, #24243e)`
            : `linear-gradient(-45deg, #0f0c29, #1a1833, #24243e)`,
        backgroundSize: props.$imageurl ? 'cover, 400% 400%' : '400% 400%',
        backgroundPosition: props.$imageurl ? 'center, 0% 50%' : '0% 50%',
        }
    }))`
        position: relative;
        min-height: 100vh;
        padding: 2rem;
        overflow: hidden;
        background-repeat: no-repeat;
        animation: ${props => props.$triggerZoom 
        ? css`${zoomEffect} 1s ease forwards` 
        : css`${gradientAnimation} 15s ease infinite`};
    `;
    
    // Update FloatingBlobs
    const FloatingBlobs = styled.div.attrs(() => ({
        style: {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`
        }
    }))`
        position: absolute;
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
        filter: blur(80px);
    `;
    
    // Update HomePage component usage
    return (
        <Background $imageurl={imageryUrl} $triggerZoom={triggerZoom}>
        {/* ... */}
        </Background>
    );
};

export default HomePage;
