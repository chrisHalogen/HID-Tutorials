// src/LocationsListener.jsx

// Import React hooks and Firebase functions
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
// Import our Firebase configuration
import { database } from "./firebase";

// Location listener component
const LocationsListener = () => {
  // State to store location data
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // Reference to our 'locations' collection in Firestore
    const locationsRef = collection(database, "locations");

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

    console.log(locations);

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
