import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOGS } from "../shared/logs";
import * as R from "remeda";

const LogsContext = createContext<LogData>(DEFAULT_LOGS);

/** Compiles logs data into a collection of scene data, which can be used to observe connnections */
function useScenes(): Record<string, SceneData> {
    const logs = useContext(LogsContext);

    return useMemo(() => {
        const nodeList = Object.values(logs.nodes);
        const sceneNames = R.unique(nodeList.map((n) => n.scene));
        const scenes = sceneNames
            .map((name) => createSceneData(name, logs, nodeList))
            .filter((s): s is SceneData => !!s);
        return R.mapToObj(scenes, (scene) => [scene.name, scene]);
    }, [logs.nodes]);
}

/** A hook that returns a scene, that will last until the scene has changed. All edges are cloned */
function useScene(scene: string) {
    const logs = useContext(LogsContext);
    return useMemo(() => {
        return createSceneData(scene, logs);
    }, [scene, logs]);
}

function createSceneData(scene: string, logs: LogData, nodeList?: NodeData[]): SceneData | null {
    const { edges, nodes } = logs;
    nodeList ??= Object.values(nodes);
    const sceneNodes = nodeList.filter((n) => n.scene === scene);
    if (sceneNodes.length === 0) return null;

    const nodeKeys = new Set(sceneNodes.map((n) => n.key));
    const sceneEdges = R.clone(edges.filter((e) => nodeKeys.has(e.sourceNode)));
    const connections = R.pipe(
        R.groupBy(sceneEdges, (e) => `${e.sourceNode}|${e.targetNode}}`),
        R.entries.strict,
        R.map(([key, edges]: [string, EdgeData[]]): ConnectionData => {
            return {
                key,
                source: nodes[edges[0].sourceNode],
                target: nodes[edges[0].targetNode],
                sceneChange: edges[0].sceneChange,
                edges,
                ignored: !!logs.ignoredConnections.find(
                    (c) =>
                        c.sourceNode === edges[0].sourceNode &&
                        c.targetNode === edges[0].targetNode,
                ),
            };
        }),
    );

    // Add ignored connections that don't have edges. These wouldn't show up in the previous grouping
    for (const connection of logs.ignoredConnections) {
        const source = nodes[connection.sourceNode];
        if (source.scene !== scene) continue;

        const alreadyExists = connections.some(
            (c) => c.source.key === connection.sourceNode && c.target.key === connection.targetNode,
        );
        if (!alreadyExists) {
            const target = nodes[connection.targetNode];
            connections.push({
                key: `${connection.sourceNode}|${connection.targetNode}}`,
                source,
                target,
                sceneChange: source.scene !== target.scene,
                edges: [],
                ignored: true,
            });
        }
    }

    return {
        name: scene,
        nodes: sceneNodes,
        edges: sceneEdges,
        connections: R.sortBy(
            connections,
            (c) => c.source.key,
            (c) => c.target.key,
        ),
    };
}

export interface SceneData {
    name: string;
    nodes: NodeData[];
    /** All edges related to this scene */
    edges: EdgeData[];
    connections: ConnectionData[];
}

export interface ConnectionData {
    key: string;
    source: NodeData;
    target: NodeData;
    sceneChange: boolean;
    edges: EdgeData[];
    ignored: boolean;
}

export { LogsContext, useScenes, useScene };
