import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import Home from "./pages/page";
import {
  useNavigate,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import { getConfig } from "./config";
import { Auth0Provider } from "@auth0/auth0-react";

const App = () => {
  // Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
  // for a full list of the available properties on the provider
  const config = getConfig();

  const onRedirectCallback = (appState) => {
    const navigate = useNavigate();
    navigate(
      appState && appState.returnTo
        ? appState.returnTo
        : window.location.pathname
    );
  };

  const providerConfig = {
    domain: config.domain,
    clientId: config.clientId,
    onRedirectCallback,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: config.audience,
    },
  };

  return (
    <Auth0Provider {...providerConfig}>
      <Theme>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Add more routes here as needed */}
          </Routes>
        </Router>
      </Theme>
    </Auth0Provider>
  );
};

const app = document.querySelector("#app")!;
const root = ReactDOM.createRoot(app);

root.render(<App />);
