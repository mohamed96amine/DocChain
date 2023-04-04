import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Typography,
  Autocomplete,
  Box,
} from "@mui/material";

const AddressForm = ({ onAddressSelected }) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    if (input.length > 2) {
      axios
        .get("https://api-adresse.data.gouv.fr/search", {
          params: { q: input },
        })
        .then((response) => {
          console.log(response);
          setSuggestions(response.data.features);
        });
    } else {
      setSuggestions([]);
    }
  }, [input]);

  return (
    <Box>
      <Autocomplete
        options={suggestions}
        getOptionLabel={(option) => option.properties.label}
        value={selectedAddress}
        inputValue={input}
        onInputChange={(event, newInputValue) => {
          setInput(newInputValue);
        }}
        onChange={(event, newValue) => {
          setSelectedAddress(newValue);
          if (onAddressSelected) {
            onAddressSelected(newValue);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Entrez une adresse..."
            variant="outlined"
            fullWidth
          />
        )}
      />
      {selectedAddress && (
        <Box>
          <Typography variant="h6">Adresse sélectionnée :</Typography>
          <Typography>{selectedAddress.properties.label}</Typography>
        </Box>
      )}
    </Box>
  );
};
export default AddressForm;
