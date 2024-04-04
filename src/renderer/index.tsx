import "./assets/main.css"

import React from "react"
import ReactDOM from "react-dom/client"

import { Route, RouterProvider, createMemoryRouter, createRoutesFromElements } from 'react-router-dom'
import { DndProvider } from 'react-dnd';
import { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LogsContext } from './hooks';
import { DEFAULT_LOGS } from '../shared/logs';
import { HomeView, SceneSidebarView } from './views';

const router = createMemoryRouter(
    createRoutesFromElements([
        <Route path="/" element={<HomeView />}>
            <Route path="scenes/:sceneId" element={<SceneSidebarView />} />
        </Route>,
    ])
);

function App(): JSX.Element {
    const [logs, setLogs] = useState<LogData>(DEFAULT_LOGS);

    useEffect(() => {
        const off = unsighted.receiveLogs((logs) => {
            console.log(logs);
            setLogs(logs);
        });
        return () => off();
    }, []);

    return (
        <DndProvider backend={HTML5Backend}>
            <LogsContext.Provider value={logs}>
                <RouterProvider router={router} />
            </LogsContext.Provider>
        </DndProvider>
    );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
