import React, { useState, useEffect } from "react";
import { useEth } from "../contexts/EthContext";
import { AppBar, Toolbar, Menu, MenuItem, Button } from "@mui/material";
import db from "../service/db/FireBase";
import { collection, query, where, getDocs } from "firebase/firestore";

const PropertyOwnerMenu = ({ toggleAddPropertyForm, setSelectedProperty }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [properties, setProperties] = useState([]);
  const {
    state: { userService },
  } = useEth();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    const res = userService.getUserProperties();
    res.then((addresses) => {
      const promises = addresses.map((item) => {
        return findPropertiesByContractAddress(item).then((item) => {
          if (item[0] !== undefined) {
            return { name: item[0].name, contract: item[0].contractAddress};
          }
        });
      });
      Promise.all(promises).then((result) => {
        console.log(result);
        const filteredArray = result.filter(obj => obj && obj.name && obj.contract);
        setProperties(filteredArray);
      });
    });
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const findPropertiesByContractAddress = async (contractAddress) => {
    const propertiesRef = collection(db, "properties");
    const q = query(
      propertiesRef,
      where("contractAddress", "==", contractAddress)
    );
    const querySnapshot = await getDocs(q);
    const matchingProperties = [];
    querySnapshot.forEach((doc) => {
      matchingProperties.push({ id: doc.id, ...doc.data() });
    });
    return matchingProperties;
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Button
          aria-controls="properties-menu"
          aria-haspopup="true"
          onClick={handleClick}
          color="inherit"
        >
          Mes biens
        </Button>
        <Menu
          id="properties-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {properties.map((property, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                handleClose();
                setSelectedProperty(property.contract);
              }}
            >
              {property.name}
            </MenuItem>
          ))}
        </Menu>
        <Button color="inherit" onClick={toggleAddPropertyForm}>
          Ajouter un bien
        </Button>
        <Button color="inherit">Tous mes diagnostics</Button>
      </Toolbar>
    </AppBar>
  );
};

export default PropertyOwnerMenu;
