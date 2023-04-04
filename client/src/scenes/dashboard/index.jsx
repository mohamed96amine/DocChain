import useEth from "../../contexts/EthContext/useEth";
import OwnerDashboard from "./owner";
import DiagnosticianDashboard from "./diagnostician";
import LandingPage from "../landing-page";


const Dashboard = () => {

  const {
    state: { myself },
  } = useEth();


  return (
    <div>
      {myself && myself.isOwner && <OwnerDashboard />}
      {myself && !myself.isOwner && myself.isCertified && <DiagnosticianDashboard />}
      {myself && !myself.isOwner && !myself.isCertified && <LandingPage />}
    </div>
  );
};

export default Dashboard;
