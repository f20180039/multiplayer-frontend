import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </ThemeProvider>
  </React.StrictMode>
);
