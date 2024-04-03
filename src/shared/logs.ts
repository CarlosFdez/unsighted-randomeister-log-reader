import * as R from "remeda";

export function processEdges(edges: EdgeData[]): EdgeData[] {
    return R.pipe(
        R.clone(edges),
        R.groupBy((edge) => `${edge.sourceNode}|${edge.targetNode}`),
        R.values,
        R.flatMap((group) => {
            // Set all to active first
            for (const edge of group) {
                edge.status = "active";
            }

            // Find redundant edges in the group. Presort data so that higher gameTimes get marked off first
            // An edge is redundant if another edge if such that:
            // 1) The actions are a superset of this edge
            // 2) The states after normalization are a subset of this edge
            const sortedGroup = R.sortBy(group, [(e) => e.gameTime, "desc"]);
            for (const edge of sortedGroup) {
                const thisStates = normalizeStates(edge.states);
                for (const testEdge of sortedGroup) {
                    if (testEdge.status === "redundant" || edge === testEdge) {
                        continue;
                    }

                    const otherStates = normalizeStates(testEdge.states);
                    const isSuperset =
                        isSupersetOf(edge.actions, testEdge.actions) &&
                        isSupersetOf(thisStates, otherStates);
                    if (isSuperset) {
                        edge.status = "redundant";
                        break;
                    }
                }
            }

            return group;
        }),
    );
}

function normalizeStates(states: Set<string>): Set<string> {
    const result = new Set<string>();
    for (const state of states) {
        // result.add(state);
        result.add(state.replace(/RockBlock_(.*)_Broken/g, "RockBlock_Broken"));
    }
    return result;
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

/** Simple set difference, here until typescript/electron catches up */
function difference<T>(set: Set<T>, other: Set<T>): Set<T> {
    const result = new Set<T>();
    for (const item of set) {
        if (!other.has(item)) {
            result.add(item);
        }
    }
    return result;
}

/** Returns true if set is a subset of other, here until typescript/electron catches up */
function isSupersetOf<T>(set: Set<T>, other: Set<T>): boolean {
    if (set.size < other.size) return false;
    return [...other].every((i) => set.has(i));
}

export const DEFAULT_LOGS: LogData = {
    actions: new Set(),
    states: new Set(),
    edges: [],
    nodes: {},
};
