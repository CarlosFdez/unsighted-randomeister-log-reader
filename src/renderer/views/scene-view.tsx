import { useMatch } from "react-router-dom";
import { ConnectionData, useScenes } from "../hooks";
import { SidebarStyle } from "../components/Sidebar";
import { css } from "@emotion/react";
import { normalizeActions, normalizeStates, processEdges } from "../../shared/logs";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useMemo, useState } from "react";

export function SceneView() {
    const scenes = useScenes();
    const { sceneName } = useMatch("/scenes/:sceneName")?.params ?? {};
    const [disabled, setDisabled] = useState<string[]>([]);

    const scene = scenes[sceneName ?? ""];
    if (!scene) return <div css={SidebarStyle}>Failed to find Scene</div>

    // Make sure that nodes transitioning out are at the bottom
    const innerConnections = scene.connections.filter((c) => c.target.scene === scene.name);
    const outgoingConnections = scene.connections.filter((c) => c.target.scene !== scene.name);

    function deleteRedundantAndDisabled() {
        const allSceneEdges = processEdges(scene.connections.flatMap((c) => c.edges), { disabled });
        const edgesToDelete = allSceneEdges.filter((e) => e.status === "redundant").map((e) => e.key);
        console.log(edgesToDelete);
        ipcRenderer.send("deleteEdges", edgesToDelete);
    }

    return (
        <div css={SceneViewStyle}>
            <header>
                <strong>{scene.name}</strong>
                <a onClick={() => deleteRedundantAndDisabled()}>Delete Redundant and Disabled Edges</a>
            </header>
            <div css={ConnectionListStyle}>
                {innerConnections.map((n) =>
                    <ConnectionEntry key={n.key} connection={n} scene={scene.name} disabled={disabled} setDisabled={setDisabled} />
                )}
                {innerConnections.length && outgoingConnections.length && <hr/>}
                {outgoingConnections.map((n) =>
                    <ConnectionEntry key={n.key} connection={n} scene={scene.name} disabled={disabled} setDisabled={setDisabled} />
                )}
            </div>
        </div>
    );
}

function ConnectionEntry(props: { connection: ConnectionData; scene?: string; disabled: string[], setDisabled: React.Dispatch<React.SetStateAction<string[]>> }) {
    const { connection, disabled, setDisabled } = props;
    const sourceName = connection.source.scene === props.scene ? connection.source.location : connection.source.key;
    const targetName = connection.target.scene === props.scene ? connection.target.location : connection.target.key;

    // Mark disabled, and reprocess edges when disabled updates
    const edges = useMemo(() => {
        return processEdges(connection.edges, { disabled });
    }, [disabled, connection]);

    return (
        <div css={ConnectionEntryStyle}>
            <header>
                <strong>{sourceName}</strong> to <strong>{targetName}</strong>
            </header>
            {edges.map((edge) => {
                const edgeDisabled = disabled.includes(edge.key);
                const removeIcon = edgeDisabled
                    ? <IconPlus className="icon" size={14} onClick={() => setDisabled((current) => current.filter((c) => c !== edge.key))}/>
                    : <IconX className="icon" size={14} onClick={() => setDisabled((current) => [...current, edge.key])}/>

                return (
                    <div key={edge.key} css={EdgeStyle({ status: edge.status, disabled: edgeDisabled })}>
                        {removeIcon}
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

const EdgeStyle = (props: { status: EdgeData["status"], disabled: boolean }) => css`
    opacity: ${props.disabled || props.status === "redundant" ? 0.6 : 1};
    ${props.disabled ? "text-decoration: line-through;" : null}
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 0.9em;
    span {
        white-space: nowrap;
    }
    .icon {
        cursor: pointer;
        padding: 2px;
        flex: 0 0 min-content;
    }

    &:has(.icon:hover) {
        ${props.disabled ? null : "text-decoration: line-through;"}
    }
`;
