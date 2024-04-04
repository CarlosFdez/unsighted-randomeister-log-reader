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
    key: string; // a uniquely generated id to make server commands easier
    sourceScene: string;
    sourceNode: string;
    targetNode: string;
    actions: Set<string>;
    states: Set<string>;
    sceneChange: boolean;
    realTime: number;
    gameTime: number;
    timestamp: number;
    status: "active" | "redundant";
}
