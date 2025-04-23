// src/constants.js

// Default coordinates (replace with your location)
// Get your coordinates from https://www.gps-coordinates.net/
export const DEFAULT_COORDINATES = {
  latitude: 40.741895, // Replace with your latitude
  longitude: -73.989308, // Replace with your longitude
};

// How much random variation to add around the default coordinates
// (in degrees, about 1km at equator)
export const COORDINATE_VARIATION = 0.02;

// How much to move each simulation step (about 100-300m at equator)
export const SIMULATION_STEP = 0.001;
