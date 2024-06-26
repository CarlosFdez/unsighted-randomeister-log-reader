import * as R from "remeda";
import { difference, isSetEqual, isSupersetOf } from "./util";

/** A set of manually flagged actions that we are ignoring for the purposes of edge resolution */
const IRRELEVANT_ACTIONS = new Set([
    "Walk",
    "Run",
    "StaminaRecharge",
    "DashAttack",
    "Parry",
    "Grind",
    "JumpUp",
    "CurvedJump",
    "RunningDodge",
    "RunningJump",
    "WallClimb",
]);

export function normalizeActions(actions: Set<string>): Set<string> {
    return new Set([...actions].filter((a) => !IRRELEVANT_ACTIONS.has(a)));
}

export function normalizeStates(edge: EdgeData): Set<string> {
    const result = new Set<string>();
    for (const state of edge.states) {
        const updatedState = state
            .replace(`${edge.sourceScene}/`, "")
            .replace("RockBlock_Rockblock", "RockBlock")
            .replace(/RockBlock_(.*)_Broken/g, "RockBlock_Broken");
        result.add(updatedState);
    }
    return result;
}

/**
 * Returns a copy of the edges where all statuses have been updated based on a set of criteria
 * An edge is redundant if another edge if such that:
 * 1) The actions after filtering are a superset of this edge's
 * 2) The states after normalization are a subset of this edge
 */
export function processEdges(
    edges: EdgeData[],
    options: { disabled?: string[]; ignored?: IgnoredConnection[] } = {},
): EdgeData[] {
    const disabled = options.disabled ?? [];
    const ignoredGroups = new Set(options.ignored?.map((i) => `${i.sourceNode}|${i.targetNode}`));

    return R.pipe(
        R.clone(edges),
        R.groupBy((edge) => `${edge.sourceNode}|${edge.targetNode}`),
        R.entries.strict,
        R.flatMap(([key, group]: [string, EdgeData[]]) => {
            // Pre-pass, update ignored state and possibly status
            for (const edge of group) {
                edge.ignored = options.ignored ? ignoredGroups.has(key) : edge.ignored;

                // Set redundant edges to unverified, unless its disabled
                if (edge.status === "redundant") {
                    edge.status = !disabled.includes(edge.key) ? null : "redundant";
                }
            }

            // Find redundant edges in the group. Presort data so that higher gameTimes get marked off first
            const sortedGroup = R.sortBy(group, [(e) => e.gameTime, "desc"]);
            for (const edge of sortedGroup) {
                // If this edge is manually verifieed, skip it
                if (edge.status !== null && edge.status !== "redundant") {
                    continue;
                }

                const actions = normalizeActions(edge.actions);
                const states = normalizeStates(edge);
                for (const testEdge of sortedGroup) {
                    // We only check for redundant compared to an active edge
                    if (testEdge.status !== "active" || edge === testEdge) {
                        continue;
                    }

                    // Check for subset. If the post-normalization result is equal, then we prefer smaller real values
                    const otherActions = normalizeActions(testEdge.actions);
                    const otherStates = normalizeStates(testEdge);
                    const isSuperset =
                        isSetEqual(actions, otherActions) && isSetEqual(states, otherStates)
                            ? isSupersetOf(edge.actions, testEdge.actions) &&
                              isSupersetOf(edge.states, testEdge.states)
                            : isSupersetOf(actions, otherActions) &&
                              isSupersetOf(states, otherStates);
                    if (isSuperset) {
                        // Because this is *after* normalization, we want to prioritize the smaller every time
                        edge.status = "redundant";
                        break;
                    }
                }
            }

            return group;
        }),
    );
}

/**
 * Computes what will change when inputting a new log.
 * Split from merging for confirmation dialog purposes.
 * TODO: FINISH
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

export function getDuplicateEdges(edges: EdgeData[], { exact = false } = {}): EdgeData[] {
    return R.pipe(
        [...edges],
        R.sortBy([(e) => e.realTime, "desc"]),
        R.groupBy((e) => {
            const actions = [...(exact ? e.actions : normalizeActions(e.actions))].sort();
            const states = [...(exact ? e.states : normalizeStates(e))].sort();
            return `${e.sourceNode}|${e.targetNode}|${actions.join(",")}|${states.join(",")}`;
        }),
        R.values,
        R.filter((g) => g.length > 1),
        R.map((g) => g.slice(1)),
    ).flat();
}

export const DEFAULT_LOGS: LogData = {
    actions: new Set(),
    states: new Set(),
    edges: [],
    nodes: {},
    ignoredConnections: [],
};
