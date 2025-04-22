# Live Location GPS App Tutorial with React & Firebase

This tutorial will guide you through building a real-time location tracking app with:
- React (with Vite) for the frontend
- Firebase Firestore for real-time database
- Firebase Authentication for anonymous sign-in
- Leaflet for interactive maps
- Material-UI for beautiful UI components


## YouTube Tutorial
Watch the full tutorial on YouTube:
[COMING SOON](https://youtu.be/LKxL-wlwTOw)


## Prerequisites
Ensure you have:
- Node.js (v16+ recommended)
- npm or yarn
- A Firebase account
- Basic React knowledge


## Setup Instructions

### 1. Create Vite App
```bash
npm create vite@latest live-location-app --template react
cd live-location-app
```

### 2. Install Dependencies
```bash
npm install firebase @mui/material @mui/icons-material @emotion/react @emotion/styled leaflet react-leaflet react-router-dom
```

### 3. Clean Up Project
1. Delete the `src` folder
2. Create these new files:
   - `src/main.jsx`
   - `src/App.jsx`
   - `src/index.css`
   - `src/App.css`

## Firebase Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" and name it "Live Location Tracker"
3. Follow the setup wizard

### 2. Create Web App
1. In your project, click the web icon (</>)
2. Register your app with nickname "Live Location Web"
3. Copy the firebaseConfig object

### 3. Create `firebase.js`
```javascript
// src/firebase.js

// Import Firebase services
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
const database = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Export the services we'll use
export { database, auth, signInAnonymously };
```

### 4. Create `constants.js`
```javascript
// src/constants.js

// Default coordinates (replace with your location)
// Get your coordinates from https://www.gps-coordinates.net/
export const DEFAULT_COORDINATES = {
  latitude: 6.5244,  // Replace with your latitude
  longitude: 3.3792  // Replace with your longitude
};

// How much random variation to add around the default coordinates
// (in degrees, about 1km at equator)
export const COORDINATE_VARIATION = 0.02;

// How much to move each simulation step (about 100-300m at equator)
export const SIMULATION_STEP = 0.001;
```

### 5. Enable Anonymous Authentication
1. In Firebase Console, go to Authentication
2. Click "Sign-in method" tab
3. Enable "Anonymous" provider
4. Click "Save"

### 6. Set Up Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Start in "test mode" (for development)
4. Choose location closest to your users
5. Click "Enable"

### 7. Set Firestore Security Rules
Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /locations/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Building the App

### 1. Create `main.jsx`
```javascript
// src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### 2. Create `App.jsx`
```javascript
// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BroadcastPage from './BroadcastPage';
import MapViewPage from './MapViewPage';
import NavBar from './NavBar';
import LocationsListener from './LocationsListener';

export default function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<BroadcastPage />} />
        <Route path="/map" element={<MapViewPage />} />
        <Route path="/listener" element={<LocationsListener />} />
      </Routes>
    </Router>
  );
}
```

### 3. Create CSS Files

#### `index.css`
```css
/* src/index.css */

:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root{
  width: 100%;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
```

#### `App.css`
```css
/* src/App.css */

#root {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}
```

### 4. Create `NavBar.jsx`
```javascript
// src/NavBar.jsx

import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { LocationOn, Map, Visibility } from '@mui/icons-material';

export default function NavBar() {
  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: 'none'
    }}>
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1}>
          <LocationOn sx={{ mr: 1 }} />
          <Box component="span" sx={{ fontWeight: 'bold' }}>LiveGPS</Box>
        </Box>
        <Box>
          <Button 
            component={Link} 
            to="/" 
            startIcon={<LocationOn />}
            sx={{ color: 'white' }}
          >
            Broadcast
          </Button>
          <Button 
            component={Link} 
            to="/map" 
            startIcon={<Map />}
            sx={{ color: 'white' }}
          >
            Map
          </Button>
          <Button 
            component={Link} 
            to="/listener" 
            startIcon={<Visibility />}
            sx={{ color: 'white' }}
          >
            Listener
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
```

### 5. BroadcastPage.jsx
Create this file to handle location broadcasting:

```javascript
// src/BroadcastPage.jsx

import { useState } from "react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { database, auth } from "./firebase";
import { DEFAULT_COORDINATES, COORDINATE_VARIATION, SIMULATION_STEP } from "./constants";
import { 
  Button, TextField, Box, Typography, Card, CardContent,
  Avatar, CircularProgress, Switch, FormControlLabel
} from "@mui/material";
import { LocationOn, Send, Stop, DirectionsWalk } from "@mui/icons-material";

export default function BroadcastPage() {
  // State management
  const [name, setName] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulateMovement, setSimulateMovement] = useState(false);
  const [simulatedPosition, setSimulatedPosition] = useState(null);
  
  // Update location in Firestore
  const updateLocation = async (uid, coords) => {
    await setDoc(doc(database, "locations", uid), {
      name,
      latitude: coords.latitude,
      longitude: coords.longitude,
      timestamp: new Date(),
      isSimulated: simulateMovement,
    });
  };

  // Start/stop broadcasting functions
  const startBroadcasting = async () => {
    if (!name) return;
    setLoading(true);
    
    try {
      const { user } = await signInAnonymously(auth);
      setUserId(user.uid);
      
      if (simulateMovement) {
        startSimulatedMovement(user.uid);
      } else {
        startRealLocationUpdates(user.uid);
      }
      
      setIsBroadcasting(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clean up functions
  const stopBroadcasting = async () => {
    if (userId) await deleteDoc(doc(database, "locations", userId));
    setIsBroadcasting(false);
    setUserId(null);
    stopSimulatedMovement();
  };

  // Location tracking implementation
  const startRealLocationUpdates = (uid) => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => updateLocation(uid, position.coords),
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true }
    );
    
    return () => navigator.geolocation.clearWatch(watchId);
  };

  // Simulation functions
  let simulationIntervalId = null;

  const startSimulatedMovement = (uid) => {
    const startPos = {
      latitude: DEFAULT_COORDINATES.latitude + (Math.random() * COORDINATE_VARIATION - COORDINATE_VARIATION/2),
      longitude: DEFAULT_COORDINATES.longitude + (Math.random() * COORDINATE_VARIATION - COORDINATE_VARIATION/2),
    };
    setSimulatedPosition(startPos);
    updateLocation(uid, startPos);
    
    simulationIntervalId = setInterval(() => {
      setSimulatedPosition((prev) => {
        if (!prev) return prev;
        const newPos = {
          latitude: prev.latitude + (Math.random() * SIMULATION_STEP - SIMULATION_STEP/2),
          longitude: prev.longitude + (Math.random() * SIMULATION_STEP - SIMULATION_STEP/2),
        };
        updateLocation(uid, newPos);
        return newPos;
      });
    }, 2000);
  };

  const stopSimulatedMovement = () => {
    if (simulationIntervalId) {
      clearInterval(simulationIntervalId);
      simulationIntervalId = null;
    }
    setSimulatedPosition(null);
  };

   const toggleBroadcasting = async () => {
    if (isBroadcasting) {
      await stopBroadcasting();
    } else {
      await startBroadcasting();
    }
  };

  // Render the component
  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header section with logo */}
          <Box textAlign="center" mb={3}>
            <Avatar
              sx={{
                bgcolor: "#764ba2",
                color: "white",
                width: 56,
                height: 56,
                mx: "auto",
                mb: 2,
              }}
            >
              <LocationOn fontSize="large" />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">
              {isBroadcasting
                ? "Live Broadcast Active"
                : "Start Location Sharing"}
            </Typography>
          </Box>

          {/* Name input field */}
          <TextField
            label="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            disabled={isBroadcasting}
            sx={{ mb: 3 }}
          />

          {/* Broadcast button */}
          <Button
            variant="contained"
            onClick={toggleBroadcasting}
            size="large"
            fullWidth
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : isBroadcasting ? (
                <Stop />
              ) : (
                <Send />
              )
            }
            disabled={loading || (!isBroadcasting && !name)}
            sx={{
              py: 1.5,
              background: isBroadcasting
                ? "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                opacity: 0.9,
              },
            }}
          >
            {loading
              ? "Processing..."
              : isBroadcasting
              ? "Stop Broadcasting"
              : "Start Broadcasting"}
          </Button>

          {/* Status message */}
          {isBroadcasting && (
            <Box mt={3} p={2} bgcolor="#f0f4ff" borderRadius={2}>
              <Typography variant="body2">
                Your real location is being shared
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
```

### 6. LocationsListener.jsx
Create this component to monitor location updates:

```javascript
// src/LocationsListener.jsx

// Import React hooks and Firebase functions
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
// Import our Firebase configuration
import { database } from './firebase';

// Location listener component
const LocationsListener = () => {
  // State to store location data
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // Reference to our 'locations' collection in Firestore
    const locationsRef = collection(database, 'locations');

    // Set up real-time listener for the locations collection
    const unsubscribe = onSnapshot(locationsRef, (snapshot) => {
      // Transform the documents into an array of location objects
      const locationsData = snapshot.docs.map((doc) => ({
        id: doc.id, // Document ID (user ID)
        ...doc.data(), // Spread all document data
      }));
      // Update our state with the new data
      setLocations(locationsData);
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div>
      <h2>Realtime Locations (Firestore)</h2>
      {locations.length === 0 ? (
        <p>No locations available.</p>
      ) : (
        <ul>
          {locations.map((location) => (
            <li key={location.id}>
              <strong>{location.id}</strong>: {JSON.stringify(location)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationsListener;
```

### 7. MapViewPage.jsx
Create this file for the interactive map:

```javascript
// src/MapViewPage.jsx

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, database } from './firebase';
import { DEFAULT_COORDINATES } from './constants';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Box, Typography, Avatar, Paper, IconButton,
  List, ListItem, ListItemAvatar, ListItemText, CircularProgress
} from '@mui/material';
import { LocationOn, Refresh, Shuffle } from '@mui/icons-material';

// Map control component
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

// Custom map markers
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  iconRetinaUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const realLocationIcon = createIcon('blue');
const simulatedIcon = createIcon('green');

export default function MapViewPage() {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  // Calculate map center
  const center = useMemo(() => {
    const userList = Object.values(users);
    if (userList.length === 0) return [DEFAULT_COORDINATES.latitude, DEFAULT_COORDINATES.longitude];
    
    const latitudes = userList.map(user => user.latitude);
    const longitudes = userList.map(user => user.longitude);
    
    return [
      (Math.max(...latitudes) + Math.min(...latitudes)) / 2,
      (Math.max(...longitudes) + Math.min(...longitudes)) / 2
    ];
  }, [users]);

  // Firestore listener
  useEffect(() => {
    const initialize = async () => {
      try {
        await signInAnonymously(auth);
        const q = query(collection(database, 'locations'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const usersData = {};
          querySnapshot.forEach((doc) => {
            usersData[doc.id] = doc.data();
          });
          setUsers(usersData);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Authentication error:", error);
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const refreshData = () => setLoading(true);

  return (
    <Box sx={{ height: '100vh', width: '100%', position: 'relative' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <MapUpdater center={center} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {Object.entries(users).map(([userId, user]) => (
          <Marker 
            key={userId} 
            position={[user.latitude, user.longitude]}
            icon={user.isSimulated ? simulatedIcon : realLocationIcon}
          >
            <Popup>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ 
                  bgcolor: user.isSimulated ? '#4caf50' : '#2196f3', 
                  width: 32, 
                  height: 32,
                  fontSize: '0.875rem'
                }}>
                  {user.name?.charAt(0).toUpperCase() || '?'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">{user.name || 'Anonymous'}</Typography>
                  <Typography variant="caption" display="block">
                    {user.isSimulated ? 'Simulated' : 'Real'} location
                  </Typography>
                  <Typography variant="caption" display="block">
                    {user.latitude.toFixed(6)}, {user.longitude.toFixed(6)}
                  </Typography>
                </Box>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Side panel */}
      <Paper sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)',
        width: 300,
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <LocationOn color="primary" />
          <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
            Active Trackers
          </Typography>
          <IconButton onClick={refreshData} size="small" disabled={loading}>
            <Refresh fontSize="small" />
          </IconButton>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : Object.keys(users).length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" p={2}>
            No active broadcasts
          </Typography>
        ) : (
          <List dense sx={{ pt: 0 }}>
            {Object.entries(users).map(([userId, user]) => (
              <ListItem key={userId} sx={{ py: 0.5 }}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: user.isSimulated ? '#4caf50' : '#2196f3', 
                    width: 32, 
                    height: 32 
                  }}>
                    {user.name?.charAt(0) || '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.name || 'Anonymous'}
                  secondary={
                    <>
                      {user.latitude.toFixed(6)}, {user.longitude.toFixed(6)}
                      {user.isSimulated && (
                        <Box component="span" ml={1}>
                          <Shuffle fontSize="inherit" color="success" />
                        </Box>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
```

# Testing
Run the app:

```
npm run dev
```
### Test all features:
- Broadcast real location
- Broadcast simulated location
- View locations on map
- Check listener page
- Verify data in Firestore console

## Troubleshooting Guide

### Common Issues

1. **Firebase Permission Errors**
   - Verify your security rules
   - Check if anonymous authentication is enabled
   - Ensure you're signed in before accessing Firestore

2. **Map Not Displaying**
   - Check Leaflet CSS is imported
   - Verify container has defined height
   - Ensure valid coordinates are being passed

3. **Location Not Updating**
   - Check browser permissions for geolocation
   - Verify Firestore writes are successful
   - Confirm real-time listeners are properly set up

4. **Simulation Not Working**
   - Check constants.js values
   - Verify the simulation interval is running
   - Confirm Firestore updates are being called

## Final Notes

### Customization Options

1. **Styling**:
   - Modify the color scheme in NavBar.jsx
   - Update gradients in BroadcastPage.jsx
   - Adjust map appearance in MapViewPage.jsx

2. **Functionality**:
   - Add user authentication methods
   - Implement location history
   - Create geofencing features
   - Add group functionality

3. **Performance**:
   - Implement throttling for location updates
   - Add loading states
   - Optimize Firestore queries

### Learning Resources

1. [Firebase Documentation](https://firebase.google.com/docs)
2. [React Leaflet Documentation](https://react-leaflet.js.org/)
3. [Material-UI Documentation](https://mui.com/)
4. [React Documentation](https://react.dev/)

## Conclusion

Congratulations! You've built a fully functional real-time location tracking application. This project demonstrates:

- Real-time data synchronization with Firestore
- Secure authentication patterns
- Interactive map integration
- Responsive UI design
- Proper state management

## Share This Guide

📢 **Copy this guide link to share with a colleague or friend:**
```html
https://github.com/chrisHalogen/HID-Tutorials/tree/main/live-location-app
```

## Support Us!
If this guide was helpful, please support us by:

✅ Liking the video: [COMING SOON](https://youtu.be/LKxL-wlwTOw)  
✅ Subscribing to the channel: [https://www.youtube.com/@halogenius-ideas](https://www.youtube.com/@halogenius-ideas)  
✅ Sharing it on your social platforms  
Thank you! 🚀










