import useEth from "../../contexts/EthContext/useEth";
import LandingPage from "../landing-page";


const Dashboard = () => {

  const {
    state: { myself },
  } = useEth();


  return (
    <div>
      <LandingPage />
    </div>
  );
};

export default Dashboard;
