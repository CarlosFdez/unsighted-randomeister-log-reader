import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOGS } from "../shared/logs";
import * as R from "remeda";

const LogsContext = createContext<LogData>(DEFAULT_LOGS);

/** Compiles logs data into a collection of scene data, which can be used to observe connnections */
function useScenes(): Record<string, SceneData> {
    const { nodes, edges } = useContext(LogsContext);

    return useMemo(() => {
        const nodeList = Object.values(nodes);
        const sceneNames = R.unique(nodeList.map((n) => n.scene));
        const scenes: SceneData[] = sceneNames.map((name) => {
            const sceneNodes = nodeList.filter((n) => n.scene === name);
            const nodeKeys = new Set(sceneNodes.map((n) => n.key));
            const sceneEdges = edges.filter((e) => nodeKeys.has(e.sourceNode));
            return {
                name,
                nodes: sceneNodes,
                edges: sceneEdges,
                connections: R.pipe(
                    R.groupBy(sceneEdges, (e) => `${e.sourceNode}|${e.targetNode}}`),
                    R.entries.strict,
                    R.map(([key, edges]: [string, EdgeData[]]): ConnectionData => {
                        return {
                            key,
                            source: nodes[edges[0].sourceNode],
                            target: nodes[edges[0].targetNode],
                            sceneChange: edges[0].sceneChange,
                            edges,
                        };
                    }),
                    R.sortBy(
                        (c) => c.source.key,
                        (c) => c.target.key,
                    ),
                ),
            };
        });

        return R.mapToObj(scenes, (scene) => [scene.name, scene]);
    }, [nodes]);
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
}

export { LogsContext, useScenes };
