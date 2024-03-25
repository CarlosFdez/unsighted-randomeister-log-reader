import { useScenes } from "../../hooks";
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
      }))

    return (
        <Link css={SceneListEntryStyle} to={`scenes/${scene.name}`} ref={dragPreview} draggable={false}>
            <span className="name" ref={drag}>
                {scene.name}
            </span>
            <span className="nodes">{scene.nodes.length} Nodes</span>
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
`;
