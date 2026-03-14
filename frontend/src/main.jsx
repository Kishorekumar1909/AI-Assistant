import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#13161b",
          color: "#e8eaf0",
          border: "1px solid #2a3040",
          fontFamily: "Inter, sans-serif",
          fontSize: "0.875rem",
        },
        success: { iconTheme: { primary: "#4caf82", secondary: "#fff" } },
        error: { iconTheme: { primary: "#e05c6a", secondary: "#fff" } },
      }}
    />
  </React.StrictMode>
);
