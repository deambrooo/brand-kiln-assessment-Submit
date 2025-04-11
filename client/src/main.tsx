import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProviders } from "./lib/context-provider";

// Create a root element to render into
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
const root = createRoot(rootElement);

// Render the app with all necessary providers
root.render(
  <AppProviders>
    <App />
  </AppProviders>
);
