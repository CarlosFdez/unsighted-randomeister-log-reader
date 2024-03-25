import { useMatch } from "react-router-dom";
import { useScenes } from "../../hooks";
import { SidebarStyle } from "../../components/Sidebar";

export function SceneSidebarView() {
    const scenes = useScenes();
	const { sceneId } = useMatch("/scenes/:sceneId")?.params ?? {};
    const scene = scenes[sceneId ?? ""];
    if (!scene) return <div css={SidebarStyle}>Failed to find Scene</div>

    return (
        <div css={SidebarStyle}>
            <h2>{scene.name}</h2>
            {scene.nodes.map((n) => <SceneNodeInfo key={n.key} node={n} />)}
        </div>
    );
}

function SceneNodeInfo(props: { node: NodeData }) {
    const { node } = props;
    return (<div>{node.location}</div>);
}
