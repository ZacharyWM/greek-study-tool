import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

const App = () => {
  // need html and body tags?
  return (
    <html>
      <body>
        <Theme>your react app</Theme>
      </body>
    </html>
  );
};

const app = document.querySelector("#app")!;
const root = ReactDOM.createRoot(app);

root.render(<App />);
