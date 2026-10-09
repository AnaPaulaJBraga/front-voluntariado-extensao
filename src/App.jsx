import AppRoutes from "./routes/AppRoutes";
import {EntityProvider} from "./contexts/EntityContexts";

const App = () => {
  return (
    <EntityProvider>
      <AppRoutes />
    </EntityProvider>
  );
};

export default App;
