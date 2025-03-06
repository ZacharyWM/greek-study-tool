import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import Home from "./pages/page";

const App = () => {
  return (
    <Theme>
      <Home />
    </Theme>
  );
};

const app = document.querySelector("#app")!;
const root = ReactDOM.createRoot(app);

root.render(<App />);
