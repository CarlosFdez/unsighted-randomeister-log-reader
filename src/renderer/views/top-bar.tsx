import { css } from "@emotion/react";
import { IconBackspace, IconHome } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";

/** Top navigational component showed on all pages */
export function TopBar() {
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
    border-radius: 5px;
    top: 0;
    right: 0;
    z-index: 5;

    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px;
    margin: 8px;

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

`;
