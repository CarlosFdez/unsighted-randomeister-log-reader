import "./assets/main.css";

import React from "react"
import ReactDOM from "react-dom/client";
import { App } from "./App";

// The root App component must be imported and cannot be part of this file, or the console will have errors
// when hot reloading
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
