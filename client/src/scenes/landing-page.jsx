import React from "react";
import { useEth } from "../contexts/EthContext";
import Home from "../components/Home";
import OwnerDashboard from "./dashboard/owner";
import PropertyOwnerDashboard from "./dashboard/propertyOwner";
import CertifiedDiagnosticianDashboard from "./dashboard/CertifiedDiagnostician";
import UncertifiedDiagnosticianDashboard from "./dashboard/UncertifiedDiagnostician";

const LandingPage = () => {
  const {
    state: { myself },
  } = useEth();

  return (
    <div>
      {myself?.role === "NoRole" && <Home/>}
      {!!myself?.isOwner && <OwnerDashboard/>}
      {!!myself?.isPropertyOwner && <PropertyOwnerDashboard/>}
      {!!myself?.isCertifiedDiagnostician && <CertifiedDiagnosticianDashboard/>}
      {!!myself?.isUncertifiedDiagnostician && <UncertifiedDiagnosticianDashboard/>}
    </div>
  );
};

export default LandingPage;
