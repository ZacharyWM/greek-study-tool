import React from "react";
import ReactDOM from "react-dom/client";

const App = () => {
  return <div>Your React app!</div>;
};
const app = document.querySelector("#app")!;
const root = ReactDOM.createRoot(app);
root.render(<App />);
