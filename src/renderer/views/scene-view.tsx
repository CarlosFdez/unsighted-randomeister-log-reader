import { useMatch } from "react-router-dom";
import { ConnectionData, useScene } from "../hooks";
import { SidebarStyle } from "../components/Sidebar";
import { css } from "@emotion/react";
import { normalizeActions, normalizeStates, processEdges } from "../../shared/logs";
import { IconCheck, IconCircleX, IconX } from "@tabler/icons-react";
import { useMemo } from "react";
import * as R from "remeda";

export function SceneView() {
    const { sceneName } = useMatch("/scenes/:sceneName")?.params ?? {};
    const scene = useScene(sceneName ?? "");
    if (!scene) return <div css={SidebarStyle}>Failed to find Scene</div>

    // Make sure that nodes transitioning out are at the bottom
    const connectionGroups = R.groupBy(
        scene.connections,
        (c) => c.ignored ? "ignored" : c.target.scene === scene.name ? "incoming" : "outgoing"
    );

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
                {["incoming", "outgoing", "ignored"].map((g) =>
                    <div key={g} className="group">
                        {connectionGroups[g]?.map((n) =>
                            <ConnectionEntry key={n.key} connection={n} scene={scene.name} />
                        )}
                    </div>
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

    function toggleIgnored() {
        ipcRenderer.send("ignoreConnection", {
            sourceNode: connection.source.key,
            targetNode: connection.target.key,
            ignored: !connection.ignored
        });
    }

    // If ignored, return a simple ignored connection view
    if (connection.ignored) {
        return (
            <div css={[ConnectionEntryStyle, ConnectionIgnoredStyle]}>
                <header>
                    <span>
                        <strong>{sourceName}</strong> to <strong>{targetName}</strong> ({connection.edges.length} edges)
                    </span>
                    <a onClick={() => toggleIgnored()}><IconCircleX size={14}/></a>
                </header>
            </div>
        );
    }

    return (
        <div css={ConnectionEntryStyle}>
            <header>
                <span><strong>{sourceName}</strong> to <strong>{targetName}</strong></span>
                <a onClick={() => toggleIgnored()}><IconX size={14}/></a>
            </header>
            {edges.map((edge) => {
                const rejectIcon = edge.status !== "rejected"
                    ? <a onClick={() => ipcRenderer.send("updateEdgeStatus", edge.key, "rejected")}><IconX size={14}/></a>
                    : <a onClick={() => ipcRenderer.send("updateEdgeStatus", edge.key, null)}><IconCircleX size={14}/></a>
                const activeIcon = edge.status !== "active"
                    ? <a onClick={() => ipcRenderer.send("updateEdgeStatus", edge.key, "active")}><IconCheck size={14}/></a>
                    : <a onClick={() => ipcRenderer.send("updateEdgeStatus", edge.key, null)}><IconCircleX size={14}/></a>

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

    a:has(svg) {
        cursor: pointer;
        color: unset;
        display: flex;
        flex: 0 0 min-content;
        &:hover {
            filter: drop-shadow(0 0 3px #000);
        }
    }
`;

const ConnectionListStyle = css`
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding-bottom: 0.75rem;
    .group {
        width: 100%;
    }
    .group + .group {
        border-top: 1px solid #888;
        margin-top: 0.25rem;
        padding-top: 0.25rem;
    }
`;

const ConnectionEntryStyle = css`
    padding: 4px 6px;
    header {
        display: flex;
        align-items: center;
        font-weight: 500;
        gap: 0.25rem;
    }
`;

const ConnectionIgnoredStyle = css`
    opacity: 0.8;
    font-size: 0.9em;
    padding-bottom: 0;
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
`;
