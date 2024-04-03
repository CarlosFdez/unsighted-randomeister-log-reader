import { MapView } from "./map";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { TopBar } from "./top-bar";
import { useContext } from "react";
import { LogsContext } from "@renderer/hooks";
import { LogReport } from "./log-report";

export function HomeView() {
    const logs = useContext(LogsContext);

    return (
        <>
            <MapView />
            <Outlet />
            <TopBar/>
            <LogReport logs={logs} />
            <ScrollRestoration />
        </>
    );
}
