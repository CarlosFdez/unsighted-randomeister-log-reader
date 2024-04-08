/** Normalized data from unsighted randomeister movement logs */
interface LogData {
    actions: Set<string>;
    states: Set<string>;
    /** Nodes mapped by key */
    nodes: Record<string, NodeData>;
    edges: EdgeData[];
    ignoredConnections: IgnoredConnection[];
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
    status: EdgeStatus;
    /** If this edge is part of an ignored connection, the edge will be marked as ignored */
    ignored: boolean;
}

/** Identifies a connection that we are not interested in the edges for */
interface IgnoredConnection {
    sourceNode: string;
    targetNode: string;
}

type EdgeStatus = null | "active" | "redundant" | "rejected";
