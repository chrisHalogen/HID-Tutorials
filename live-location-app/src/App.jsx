// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BroadcastPage from "./BroadcastPage";
import MapViewPage from "./MapViewPage";
import NavBar from "./NavBar";
import LocationsListener from "./LocationsListener";

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
