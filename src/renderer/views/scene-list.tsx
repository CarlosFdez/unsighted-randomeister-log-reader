import { SceneData, useScenes } from "../hooks";
import { Link, ScrollRestoration } from "react-router-dom";
import { css } from "@emotion/react";
import { useDrag } from "react-dnd";
import { SidebarStyle } from "@renderer/components/Sidebar";

export function SceneList() {
    const scenes = useScenes();

    return (
        <div css={SidebarStyle}>
            <ScrollRestoration />
            {Object.values(scenes).map((s) => <SceneListEntry key={s.name} scene={s}/>)}
        </div>
    )
}

function SceneListEntry(props: { scene: SceneData }) {
    const scene = props.scene;

    const [_collected, drag, dragPreview] = useDrag(() => ({
        type: "scene",
        item: { sceneName: scene.name }
    }));

    const redundant = scene.edges.filter((e) => e.status === "redundant").length;

    return (
        <Link css={SceneListEntryStyle} to={`scenes/${scene.name}`} ref={dragPreview} draggable={false}>
            <span className="name" ref={drag}>
                {scene.name}
            </span>
            <span className="nodes">{scene.connections.length} Connections</span>
            <span className="nodes">
                {scene.edges.length} Edges
                {redundant > 0 && <span className="redundant">({redundant} Redundant)</span>}
            </span>
        </Link>
    );
}

const SceneListEntryStyle = css`
    display: flex;
    flex-direction: column;
    cursor: pointer;
    color: unset;
    text-decoration: unset;
    padding: 4px 6px;
    &:hover {
        background-color: rgba(255, 255, 255, 0.8);
    }
    .name {
        text-decoration: underline;
    }
    .nodes {
        display: block;
    }
    .redundant {
        color: #AA0000;
        font-weight: 500;
        font-size: 0.95em;
        margin-left: 0.5ch;
    }
`;
