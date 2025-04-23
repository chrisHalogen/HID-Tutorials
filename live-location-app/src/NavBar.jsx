// src/NavBar.jsx

import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { LocationOn, Map, Visibility } from "@mui/icons-material";

export default function NavBar() {
  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(135deg,rgb(30, 31, 36) 0%, #764ba2 100%)",
        boxShadow: "none",
      }}
    >
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1}>
          <LocationOn sx={{ mr: 1 }} />
          <Box component="span" sx={{ fontWeight: "bold" }}>
            LiveGPS
          </Box>
        </Box>
        <Box>
          <Button
            component={Link}
            to="/"
            startIcon={<LocationOn />}
            sx={{ color: "white" }}
          >
            Broadcast
          </Button>
          <Button
            component={Link}
            to="/map"
            startIcon={<Map />}
            sx={{ color: "white" }}
          >
            Map
          </Button>
          <Button
            component={Link}
            to="/listener"
            startIcon={<Visibility />}
            sx={{ color: "white" }}
          >
            Listener
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
