import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import Home from "./pages/page";
import History from "./pages/History";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  Navigate,
} from "react-router-dom";

import { getConfig } from "./config";
import { Auth0Provider } from "@auth0/auth0-react";
import { NavigationBar } from "./components/NavigationBar";

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();
  const config = getConfig();

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: config.audience,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
};

// Main app component
const App = () => {
  return (
    <Theme>
      <Router>
        <Auth0ProviderWithNavigate>
          <div>
            <NavigationBar />
            <Routes>
              <Route path="/" element={<Navigate to="/analysis" replace />} />
              <Route path="/analysis" element={<Home />} />
              <Route path="/analysis/:id" element={<Home />} />
              <Route path="/analyses" element={<History />} />
            </Routes>
          </div>
        </Auth0ProviderWithNavigate>
      </Router>
    </Theme>
  );
};

const app = document.querySelector("#app")!;
const root = ReactDOM.createRoot(app);

root.render(<App />);
