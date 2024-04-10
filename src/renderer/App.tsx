
import { Route, RouterProvider, createMemoryRouter, createRoutesFromElements } from 'react-router-dom'
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { HomeView, SceneSidebarView } from './views';

import { TypeOptions, toast } from "react-toastify"
import { useEffect } from 'react';

const router = createMemoryRouter(
    createRoutesFromElements([
        <Route path="/" element={<HomeView />}>
            <Route path="scenes/:sceneName" element={<SceneSidebarView />} />
        </Route>,
    ])
);

/** Main entry point of the application. Renders the router, which contains the actual views */
export function App(): JSX.Element {
    // Setup app wide listeners
    useEffect(() => {
        const off = ipcRenderer.on("notification", (_event, data: NotificationParams) => {
            toast(data.content, {
                type: data.type ?? "default",
                hideProgressBar: true,
                pauseOnHover: false,
                autoClose: 3000
            });
        });

        return () => off();
    }, []);

    return (
        <DndProvider backend={HTML5Backend}>
            <RouterProvider router={router} />
        </DndProvider>
    );
}

interface NotificationParams {
    type: TypeOptions;
    content: string;
}
