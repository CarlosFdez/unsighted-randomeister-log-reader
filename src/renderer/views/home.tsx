import { MapView } from "./map";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { TopBar } from "./top-bar";
import { useEffect, useState } from "react";
import { LogsContext } from "@renderer/hooks";
import { LogReport } from "./log-report";
import { css } from "@emotion/react";
import { SceneList } from "./scene-list";
import { DEFAULT_LOGS } from "../../shared/logs";

export function HomeView() {
    const [logs, setLogs] = useState<LogData>(DEFAULT_LOGS);

    useEffect(() => {
        const off = unsighted.receiveLogs((logs) => {
            console.log(logs);
            setLogs(logs);
        });
        return () => off();
    }, []);

    return (
        <LogsContext.Provider value={logs}>
            <MapView />
            <div css={SidebarListStyle}>
                <SceneList />
                <Outlet />
                <div css={PropertiesStyle}>
                    <TopBar/>
                    <LogReport logs={logs} />
                </div>
            </div>
            <ScrollRestoration />
        </LogsContext.Provider>
    );
}

const SidebarListStyle = css`
    position: absolute;
    top: 8px;
    left: 8px;
    bottom: 8px;
    right: 8px;

    display: flex;
    gap: 12px;
    pointer-events: none;
    * {
        pointer-events: all;
    }
`;

const PropertiesStyle = css`
    display: flex;
    flex-direction: column;
    margin: 8px;
    margin-left: auto;
    justify-content: space-between;
`;
