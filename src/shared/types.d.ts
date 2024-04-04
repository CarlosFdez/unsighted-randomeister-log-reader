/** Normalized data from unsighted randomeister movement logs */
interface LogData {
    actions: Set<string>;
    states: Set<string>;
    /** Nodes mapped by key */
    nodes: Record<string, NodeData>;
    edges: EdgeData[];
}

interface NodeData {
    /** A key is an identifier that will work for the node across all logs */
    key: string;
    scene: string;
    location: string;
    x: number;
    y: number;
    height: number;
}

interface EdgeData {
    sourceNode: string;
    targetNode: string;
    actions: Set<string>;
    states: Set<string>;
    realTime: number;
    gameTime: number;
    timestamp: number;
    status: "active" | "redundant";
}
