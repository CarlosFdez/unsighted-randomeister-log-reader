import * as R from "remeda";

export function processEdges(edges: EdgeData[]): EdgeData[] {
    return edges;
}

/**
 * Computes what will change when inputting a new log.
 * Split from merging for confirmation dialog purposes.
 */
export function getLogChanges(destination: LogData, newEntry: LogData) {
    const newActions = difference(newEntry.actions, destination.actions);
    const newStates = difference(newEntry.actions, destination.actions);
    const newNodeKeys = difference(
        new Set(Object.keys(newEntry.nodes)),
        new Set(Object.keys(destination.nodes)),
    );

    return {
        newActions,
        newStates,
        newNodes: R.pick(newEntry.nodes, [...newNodeKeys]),
    };
}

export function applyLogChanges(destination: LogData, changes: ReturnType<typeof getLogChanges>) {
    changes.newActions.forEach((a) => destination.actions.add(a));
    changes.newStates.forEach((a) => destination.states.add(a));
    destination.nodes = { ...destination.nodes, ...changes.newNodes };

    // todo: edges
    // todo objects
    // todo: figure out how to refresh scenes
}

/** Simple set difference, here until browsers catch up and start supporting it */
function difference<T>(set: Set<T>, other: Set<T>): Set<T> {
    const result = new Set<T>();
    for (const item of set) {
        if (!other.has(item)) {
            result.add(item);
        }
    }
    return result;
}

export const DEFAULT_LOGS: LogData = {
    actions: new Set(),
    states: new Set(),
    edges: [],
    objects: [],
    nodes: {},
};
