import { css } from "@emotion/react";

export const SidebarStyle = css`
    position: absolute;
    background-color: #dadae0;
    border-radius: 5px;
    filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.4));

    top: 8px;
    left: 8px;
    bottom: 8px;
    width: 340px;
    overflow: auto;
    z-index: 1;

    ::-webkit-scrollbar-track {
        border-radius: 5px;
    }
`;
