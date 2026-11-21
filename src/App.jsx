import AppRoutes from "./routes/AppRoutes";
import {EntityProvider} from "./contexts/EntityContexts";
import SessionExpiredBanner from "./components/SessionExpiredBanner/SessionExpiredBanner";
import { FlashMessageProvider } from "./components/FlashMessage/FlashMessage";

import SupportChat from "./components/SupportChat/SupportChat";

const App = () => {
  return (
    <FlashMessageProvider>
    <EntityProvider>
      <SessionExpiredBanner />
      <AppRoutes />
      <SupportChat />
    </EntityProvider>
    </FlashMessageProvider>
  );
};

export default App;
