import AppRoutes from "./routes/AppRoutes";
import {EntityProvider} from "./contexts/EntityContexts";
import SessionExpiredBanner from "./components/SessionExpiredBanner/SessionExpiredBanner";

const App = () => {
  return (
    <EntityProvider>
      <SessionExpiredBanner />
      <AppRoutes />
    </EntityProvider>
  );
};

export default App;
