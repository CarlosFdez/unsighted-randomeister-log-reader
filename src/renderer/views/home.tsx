import { MapView } from "./map";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { TopBar } from "./top-bar";
import { useContext } from "react";
import { LogsContext } from "@renderer/hooks";
import { LogReport } from "./log-report";
import { css } from "@emotion/react";
import { SceneList } from "./scene-list";

export function HomeView() {
    const logs = useContext(LogsContext);

    return (
        <>
            <MapView />
            <TopBar/>
            <LogReport logs={logs} />
            <div css={SidebarList}>
                <SceneList />
                <Outlet />
            </div>
            <ScrollRestoration />
        </>
    );
}

const SidebarList = css`
    position: absolute;
    top: 8px;
    left: 8px;
    bottom: 8px;

    display: flex;
    gap: 8px;
    overflow: hidden;
`;
