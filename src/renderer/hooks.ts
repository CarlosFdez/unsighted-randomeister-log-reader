import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOGS } from "../shared/logs";
import * as R from "remeda";

const LogsContext = createContext<LogData>(DEFAULT_LOGS);

function useScenes(): Record<string, SceneData> {
    const { nodes, edges } = useContext(LogsContext);

    return useMemo(() => {
        const nodeList = Object.values(nodes);
        const sceneNames = R.unique(nodeList.map((n) => n.scene));
        const scenes: SceneData[] = sceneNames.map((name) => {
            const sceneNodes = nodeList.filter((n) => n.scene === name);
            const nodeKeys = new Set(sceneNodes.map((n) => n.key));
            const sceneEdges = edges.filter(
                (e) => nodeKeys.has(e.sourceNode) || nodeKeys.has(e.targetNode),
            );
            return {
                name,
                nodes: sceneNodes,
                edges: sceneEdges,
                connections: R.pipe(
                    R.groupBy(sceneEdges, (e) => `${e.sourceNode}|${e.targetNode}}`),
                    R.values,
                    R.map((edges): ConnectionData => {
                        return {
                            source: nodes[edges[0].sourceNode],
                            target: nodes[edges[0].targetNode],
                            edges,
                        };
                    }),
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

interface ConnectionData {
    source: NodeData;
    target: NodeData;
    edges: EdgeData[];
}

export { LogsContext, useScenes };
