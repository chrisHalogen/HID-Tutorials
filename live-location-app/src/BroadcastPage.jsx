// src/BroadcastPage.jsx

// React and Firebase hooks & functions
import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore"; // Firestore methods
import { signInAnonymously } from "firebase/auth"; // Auth method
import { database, auth } from "./firebase"; // Custom Firebase config

// Material UI components & icons
import {
  Button,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { LocationOn, Send, Stop, DirectionsWalk } from "@mui/icons-material";

// Constants for simulation
import {
  DEFAULT_COORDINATES,
  COORDINATE_VARIATION,
  SIMULATION_STEP,
} from "./constants";

// Main component to broadcast user's location
export default function BroadcastPage() {
  const [name, setName] = useState(""); // User's name input
  const [isBroadcasting, setIsBroadcasting] = useState(false); // Tracks broadcasting state
  const [userId, setUserId] = useState(null); // Firebase Auth user ID
  const [loading, setLoading] = useState(false); // Loading state during auth/broadcast
  const [simulateMovement, setSimulateMovement] = useState(false); // Toggle for simulation
  const [simulatedPosition, setSimulatedPosition] = useState(null); // Current simulated coordinates

  // Upload user location to Firestore
  const updateLocation = async (uid, coords) => {
    await setDoc(doc(database, "locations", uid), {
      name, // user's display name
      latitude: coords.latitude,
      longitude: coords.longitude,
      timestamp: new Date(), // current time
      isSimulated: simulateMovement, // flag for simulated or real data
    });
  };

  // Starts the location broadcasting session
  const startBroadcasting = async () => {
    if (!name) return; // Ensure name is entered

    setLoading(true); // Show loading spinner

    try {
      const { user } = await signInAnonymously(auth); // Anonymous login
      setUserId(user.uid); // Store UID

      // Decide between simulated or real geolocation
      if (simulateMovement) {
        startSimulatedMovement(user.uid);
      } else {
        startRealLocationUpdates(user.uid);
      }

      setIsBroadcasting(true); // Mark as broadcasting
    } catch (error) {
      console.error("Error:", error); // Handle errors
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  // Stops the location broadcasting session
  const stopBroadcasting = async () => {
    if (userId) {
      await deleteDoc(doc(database, "locations", userId)); // Remove location from Firestore
    }
    setIsBroadcasting(false); // Reset state
    setUserId(null); // Clear user ID
    stopSimulatedMovement(); // Stop simulated movement (if any)
  };

  // Start watching real-time location via Geolocation API
  const startRealLocationUpdates = (uid) => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => updateLocation(uid, position.coords), // Success callback
      (error) => console.error("Geolocation error:", error), // Error callback
      { enableHighAccuracy: true } // Enable high accuracy
    );

    return () => navigator.geolocation.clearWatch(watchId); // Cleanup
  };

  // Variable to hold simulation interval ID
  let simulationIntervalId = null;

  // Simulates random movement from a starting point
  const startSimulatedMovement = (uid) => {
    const startPos = {
      latitude:
        DEFAULT_COORDINATES.latitude +
        (Math.random() * COORDINATE_VARIATION - COORDINATE_VARIATION / 2),
      longitude:
        DEFAULT_COORDINATES.longitude +
        (Math.random() * COORDINATE_VARIATION - COORDINATE_VARIATION / 2),
    };
    setSimulatedPosition(startPos); // Set initial simulated location
    updateLocation(uid, startPos); // Push to Firestore

    // Every 2 seconds, simulate a small random movement
    simulationIntervalId = setInterval(() => {
      setSimulatedPosition((prev) => {
        if (!prev) return prev;
        const newPos = {
          latitude:
            prev.latitude +
            (Math.random() * SIMULATION_STEP - SIMULATION_STEP / 2),
          longitude:
            prev.longitude +
            (Math.random() * SIMULATION_STEP - SIMULATION_STEP / 2),
        };
        updateLocation(uid, newPos); // Update Firestore
        return newPos; // Set new position
      });
    }, 2000);
  };

  // Clears the simulation interval
  const stopSimulatedMovement = () => {
    if (simulationIntervalId) {
      clearInterval(simulationIntervalId);
      simulationIntervalId = null;
    }
    setSimulatedPosition(null);
  };

  // Toggle broadcast state: start or stop
  const toggleBroadcasting = async () => {
    if (isBroadcasting) {
      await stopBroadcasting();
    } else {
      await startBroadcasting();
    }
  };

  // UI Rendering
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
          {/* Header with Avatar and Title */}
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

          {/* Simulation toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={simulateMovement}
                onChange={() => setSimulateMovement(!simulateMovement)}
                disabled={isBroadcasting}
              />
            }
            label={
              <Box display="flex" alignItems="center">
                <DirectionsWalk sx={{ mr: 1 }} />
                Simulate Movement
              </Box>
            }
            sx={{ mb: 3 }}
          />

          {/* Start/Stop button */}
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

          {/* Info Box displayed when broadcasting */}
          {isBroadcasting && (
            <Box mt={3} p={2} bgcolor="#f0f4ff" borderRadius={2}>
              <Typography variant="body2">
                {simulateMovement ? (
                  <>
                    <strong>Simulation Active</strong> - Moving randomly around{" "}
                    {simulatedPosition?.latitude.toFixed(4)},
                    {simulatedPosition?.longitude.toFixed(4)}
                  </>
                ) : (
                  "Your real location is being shared"
                )}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
