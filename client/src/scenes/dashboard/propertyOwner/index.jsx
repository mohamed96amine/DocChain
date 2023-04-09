import React, { useEffect, useState } from "react";
import useEth from "../../../contexts/EthContext/useEth";
import PropertyOwnerMenu from "../../../components/PropertyOwnerMenu";
import AddPropertyForm from "../../../components/AddPropertyForm";
import Property from "../../../components/Property";

const PropertyOwnerDashboard = () => {
  const {
    state: { myself, userService },
  } = useEth();

  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("");

  const toggleAddPropertyForm = () => {
    setShowAddPropertyForm((prev) => !prev);
  };

  useEffect(() => {}, []);

  const requestDiagnostic = () => {
    const event = userService.askForVerification();
    if (event.status == true) {
      console.log("ok");
    }
  };
  

  return (
    <div>
      <PropertyOwnerMenu
        toggleAddPropertyForm={toggleAddPropertyForm}
        setSelectedProperty={setSelectedProperty}
      />

      {showAddPropertyForm && <AddPropertyForm />}
      {selectedProperty && <Property contractAddress={selectedProperty} />}
    </div>
  );
};

export default PropertyOwnerDashboard;
