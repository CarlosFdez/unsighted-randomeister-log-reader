import { css } from "@emotion/react";
import { MapView } from "./map";
import { Link, Outlet, ScrollRestoration, useNavigate } from "react-router-dom";
import { IconBackspace, IconHome } from "@tabler/icons-react";

export function HomeView() {
    return (
        <>
            <MapView />
            <Outlet />
            <TopBar/>
            <ScrollRestoration />
        </>
    );
}

function TopBar() {
    const navigate = useNavigate();

    return (
        <div css={TopBarStyle}>
            <Link to="/"><IconHome/> Home</Link>
            <a onClick={() => navigate(-1)}><IconBackspace/> Back</a>
        </div>
    )
}

const TopBarStyle = css`
    position: absolute;
    background-color: #222;
    top: 0;
    left: 0;
    z-index: 5;

    a {
        color: white;
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 4px;
        cursor: pointer;
        text-decoration: none;
        &:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
    }

    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px;
    margin: 5px;
`;
