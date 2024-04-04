
import { Route, RouterProvider, createMemoryRouter, createRoutesFromElements } from 'react-router-dom'
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { HomeView, SceneSidebarView } from './views';

const router = createMemoryRouter(
    createRoutesFromElements([
        <Route path="/" element={<HomeView />}>
            <Route path="scenes/:sceneName" element={<SceneSidebarView />} />
        </Route>,
    ])
);

export function App(): JSX.Element {
    return (
        <DndProvider backend={HTML5Backend}>
            <RouterProvider router={router} />
        </DndProvider>
    );
}
