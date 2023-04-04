import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField, Box, Button, Stack } from "@mui/material";
import { styled } from "@mui/system";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";

const markerIcon = new Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const NeonButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #AD1EEB 30%, #d938a9 90%)",
  borderRadius: 3,
  border: 0,
  color: "white",
  height: 48,
  padding: "0 30px",
  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
}));

const NeonTextField = styled(TextField)(({ theme }) => ({
  "& label.Mui-focused": {
    color: "cyan",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "cyan",
  },
  "& .MuiFilledInput-root": {
    background: "rgba(128, 128, 128, 0.7)",
    "&:hover": {
      background: "rgba(128, 128, 128, 0.8)",
    },
    "&.Mui-focused": {
      background: "rgba(128, 128, 128, 0.9)",
    },
  },
  "& .MuiFilledInput-input": {
    color: "white",
  },
}));

const AddressSearchBox = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchAddress = async (search) => {
    try {
      const response = await axios.get(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
          search
        )}&limit=5`
      );
      return response.data.features;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }
  };

  const handleInputChange = async (event, newInputValue) => {
    setInputValue(newInputValue);
    const results = await fetchAddress(newInputValue);
    setOptions(results);
  };

  const handleSelectionChange = (event, newValue) => {
    if (newValue) {
      setSelectedLocation([
        newValue.geometry.coordinates[1],
        newValue.geometry.coordinates[0],
      ]);
    } else {
      setSelectedLocation(null);
    }
  };


  const handleSearchButtonClick = () => {
    onSearch(inputValue);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <Box sx={{ flex: 1, p: 2 }}>
        <Stack spacing={4}>
          <Autocomplete
            sx={{ width: 600 }}
            options={options}
            getOptionLabel={(option) => option.properties.label}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={handleSelectionChange}
            renderInput={(params) => (
              <NeonTextField
                {...params}
                label="Recherche par adresse.."
                variant="filled"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: <>{params.InputProps.endAdornment}</>,
                }}
              />
            )}
          />
          <NeonButton onClick={handleSearchButtonClick}>Recherche</NeonButton>
        </Stack>
      </Box>
      <Box sx={{ flex: 1 }}>
        <MapContainer
          center={selectedLocation || [46.603354, 1.888334]}
          zoom={selectedLocation ? 13 : 5}
          style={{ width: "400px", height: "400px", marginTop: "16px", borderRadius: "50px" }} // Changez la largeur et la hauteur ici
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {selectedLocation && (
            <Marker position={selectedLocation} icon={markerIcon}>
              <Popup>Adresse sélectionnée</Popup>
            </Marker>
          )}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default AddressSearchBox;
