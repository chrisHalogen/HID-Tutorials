// src/MapViewPage.jsx

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { auth, database } from "./firebase";
import { DEFAULT_COORDINATES } from "./constants";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { LocationOn, Refresh, Shuffle } from "@mui/icons-material";

// Map control component
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

// Custom map markers
const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconRetinaUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const realLocationIcon = createIcon("blue");
const simulatedIcon = createIcon("green");

export default function MapViewPage() {
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  // Calculate map center
  const center = useMemo(() => {
    const userList = Object.values(users);
    if (userList.length === 0)
      return [DEFAULT_COORDINATES.latitude, DEFAULT_COORDINATES.longitude];

    const latitudes = userList.map((user) => user.latitude);
    const longitudes = userList.map((user) => user.longitude);

    return [
      (Math.max(...latitudes) + Math.min(...latitudes)) / 2,
      (Math.max(...longitudes) + Math.min(...longitudes)) / 2,
    ];
  }, [users]);

  // Firestore listener
  useEffect(() => {
    const initialize = async () => {
      try {
        await signInAnonymously(auth);
        const q = query(collection(database, "locations"));
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
    <Box sx={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
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
                <Avatar
                  sx={{
                    bgcolor: user.isSimulated ? "#4caf50" : "#2196f3",
                    width: 32,
                    height: 32,
                    fontSize: "0.875rem",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">
                    {user.name || "Anonymous"}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {user.isSimulated ? "Simulated" : "Real"} location
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
      <Paper
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1000,
          p: 2,
          borderRadius: 2,
          boxShadow: 3,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(5px)",
          width: 300,
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
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
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            p={2}
          >
            No active broadcasts
          </Typography>
        ) : (
          <List dense sx={{ pt: 0 }}>
            {Object.entries(users).map(([userId, user]) => (
              <ListItem key={userId} sx={{ py: 0.5 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: user.isSimulated ? "#4caf50" : "#2196f3",
                      width: 32,
                      height: 32,
                    }}
                  >
                    {user.name?.charAt(0) || "?"}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.name || "Anonymous"}
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
