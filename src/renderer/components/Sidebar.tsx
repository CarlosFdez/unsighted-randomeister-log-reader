import { css } from "@emotion/react";

export const SidebarStyle = css`
    background-color: #dadae0;
    border-radius: 5px;
    filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.6));
    overflow: auto;
    z-index: 1;

    ::-webkit-scrollbar-track {
        border-radius: 5px;
    }
`;
