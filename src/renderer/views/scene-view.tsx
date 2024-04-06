import { useMatch } from "react-router-dom";
import { ConnectionData, useScene } from "../hooks";
import { SidebarStyle } from "../components/Sidebar";
import { css } from "@emotion/react";
import { normalizeActions, normalizeStates, processEdges } from "../../shared/logs";
import { IconCheck, IconCircleX, IconX } from "@tabler/icons-react";
import { useMemo } from "react";

export function SceneView() {
    const { sceneName } = useMatch("/scenes/:sceneName")?.params ?? {};
    const scene = useScene(sceneName ?? "");
    if (!scene) return <div css={SidebarStyle}>Failed to find Scene</div>

    // Make sure that nodes transitioning out are at the bottom
    const innerConnections = scene.connections.filter((c) => c.target.scene === scene.name);
    const outgoingConnections = scene.connections.filter((c) => c.target.scene !== scene.name);

    // // Disabled until we're certain we want to delete these edges
    // function deleteRedundantAndDisabled() {
    //     const allSceneEdges = processEdges(scene.connections.flatMap((c) => c.edges), { disabled });
    //     const edgesToDelete = allSceneEdges.filter((e) => e.status === "redundant").map((e) => e.key);
    //     console.log(edgesToDelete);
    //     ipcRenderer.send("deleteEdges", edgesToDelete);
    // }

    return (
        <div css={SceneViewStyle}>
            <header>
                <strong>{scene.name}</strong>
                {/*<a onClick={() => deleteRedundantAndDisabled()}>Delete Redundant and Disabled Edges</a>*/}
            </header>
            <div css={ConnectionListStyle}>
                {innerConnections.map((n) =>
                    <ConnectionEntry key={n.key} connection={n} scene={scene.name} />
                )}
                {innerConnections.length && outgoingConnections.length && <hr/>}
                {outgoingConnections.map((n) =>
                    <ConnectionEntry key={n.key} connection={n} scene={scene.name} />
                )}
            </div>
        </div>
    );
}

function ConnectionEntry(props: { connection: ConnectionData; scene?: string }) {
    const { connection } = props;
    const sourceName = connection.source.scene === props.scene ? connection.source.location : connection.source.key;
    const targetName = connection.target.scene === props.scene ? connection.target.location : connection.target.key;

    // Mark disabled, and reprocess edges when disabled updates
    const edges = useMemo(() => {
        return processEdges(connection.edges);
    }, [connection]);

    return (
        <div css={ConnectionEntryStyle}>
            <header>
                <strong>{sourceName}</strong> to <strong>{targetName}</strong>
            </header>
            {edges.map((edge) => {
                const rejectIcon = edge.status !== "rejected"
                    ? <IconX size={14} onClick={() => ipcRenderer.send("updateEdgeStatus", edge.key, "rejected")} />
                    : <IconCircleX size={14} onClick={() => ipcRenderer.send("updateEdgeStatus", edge.key, null)} />
                const activeIcon = edge.status !== "active"
                    ? <IconCheck size={14} onClick={() => ipcRenderer.send("updateEdgeStatus", edge.key, "active")} />
                    : <IconCircleX size={14} onClick={() => ipcRenderer.send("updateEdgeStatus", edge.key, null)} />

                return (
                    <div key={edge.key} css={EdgeStyle({ status: edge.status })}>
                        {rejectIcon}
                        {activeIcon}
                        {edge.actions.size === 0 && edge.states.size === 0 ? <span>No actions or states required</span> : null}
                        {[...normalizeActions(edge.actions)].map((a) => <span key={a}>{a}</span>)}
                        {[...normalizeStates(edge)].map((s) => <span key={s}>{s}</span>)}
                    </div>
                )
            })}
        </div>
    );
}

const SceneViewStyle = css`
    ${SidebarStyle}
    display: flex;
    flex-direction: column;
    & > header {
        margin-top: 0;
        padding: 4px 6px;
        strong {
            display: block;
            font-size: 1.25em;
        }
    }
`;

const ConnectionListStyle = css`
    overflow: auto;
`;

const ConnectionEntryStyle = css`
    padding: 4px 6px;
    header {
        font-weight: 500;
    }
`;

const EdgeStyle = (props: { status: EdgeData["status"] }) => css`
    color: ${props.status === "rejected" ? "#300" : props.status === "active" ? "#003" : "#000"};
    opacity: ${props.status === "redundant" ? 0.6 : 1};
    display: flex;
    align-items: center;
    font-size: 0.9em;
    span {
        white-space: nowrap;
        margin-left: 3px;
    }
    svg {
        cursor: pointer;
        padding: 2px 0;
        flex: 0 0 min-content;
        &:hover {
            filter: drop-shadow(0 0 3px #000);
        }
    }
`;
