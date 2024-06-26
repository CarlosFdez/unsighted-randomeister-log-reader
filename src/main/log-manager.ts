import { ipcMain } from "electron";
import { DEFAULT_LOGS, getDuplicateEdges, processEdges } from "../shared/logs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import fs from "node:fs/promises";
import * as path from "node:path";
import { randomUUID } from "crypto";

import * as R from "remeda";

/** Main class for storing and merging logs. Static because we need to accessible in preload */
class LogManager {
    static instance = new LogManager();

    data = DEFAULT_LOGS;

    constructor() {
        this.reload();
    }

    async reload(): Promise<void> {
        this.data = await this.readLogs("data");
        ipcMain.emit("updateLogs", this.data);
    }

    /**
     * Reads movement logs from a file.
     * While numerical ids link entries within there, these ids are only unique within a single log.
     * When parsing, we relink things based on more stable ids.
     */
    async readLogs(base: string): Promise<LogData> {
        const rawActions = await readTsv(path.join(base, "actions.tsv"));
        const rawStates = await readTsv(path.join(base, "states.tsv"));
        const rawNodes = await readTsv(path.join(base, "nodes.tsv"));
        const rawEdges = await readTsv(path.join(base, "edges.tsv"));
        const rawIgnoredConnections =
            (await readTsv(path.join(base, "ignoredConnections.tsv"))) ?? [];

        if (!rawActions || !rawStates || !rawNodes || !rawEdges) {
            throw new Error("Failed to read unsighted logs, this isn't a valid logs folder");
        }

        const actionsById = R.mapToObj(rawActions, (a) => [a.id, a.action]);

        const statesById = R.mapToObj(rawStates, (s) => [
            s.id,
            R.filter([s.scene, s.name], R.isTruthy).join("/"),
        ]);

        const nodesById = R.mapToObj(rawNodes, (n) => [
            n.id,
            {
                key: `${n.scene}/${n.location}`,
                ...R.mapValues(R.pick(n, ["scene", "location"] as const), String),
                ...R.mapValues(R.pick(n, ["x", "y", "height"] as const), Number),
            },
        ]);

        const ignoredConnections = rawIgnoredConnections.map(
            (data): IgnoredConnection => ({
                sourceNode: nodesById[data.source].key,
                targetNode: nodesById[data.target].key,
            }),
        );

        const edges = (() => {
            const edgeObjects = rawEdges.map<EdgeData>((data) => ({
                key: randomUUID(),
                sourceScene: nodesById[data.source].scene,
                sourceNode: nodesById[data.source].key,
                targetNode: nodesById[data.target].key,
                actions: new Set(
                    data.actions
                        .split(",")
                        .map((id) => actionsById[id])
                        .filter(R.isTruthy),
                ),
                states: new Set(
                    data.states
                        .split(",")
                        .map((id) => statesById[id])
                        .filter(R.isTruthy),
                ),
                sceneChange: data["scene change"] === "1",
                realTime: Number(data["real time"]),
                gameTime: Number(data["game time"]),
                timestamp: Number(data["timestamp"]),
                status: (String(data["status"] ?? "") || null) as EdgeStatus,
                ignored: false,
            }));
            const processed = processEdges(edgeObjects, { ignored: ignoredConnections });
            const duplicates = getDuplicateEdges(processed, { exact: true });
            const duplicateKeys = new Set(duplicates.map((e) => e.key));
            return processed.filter((e) => !duplicateKeys.has(e.key));
        })();

        return {
            actions: new Set(Object.values(actionsById)),
            states: new Set(Object.values(statesById)),
            nodes: R.mapToObj(Object.values(nodesById), (n) => [n.key, n]),
            edges,
            ignoredConnections,
        };
    }

    /** Delete edges using their uuids */
    deleteEdges(edgeKeys: Set<string>) {
        this.data.edges = processEdges(this.data.edges.filter((e) => !edgeKeys.has(e.key)));
    }

    updateConnectionStatus(sourceNode: string, targetNode: string, ignored: boolean): boolean {
        const logs = this.data;
        const existing = logs.ignoredConnections.findIndex(
            (c) => c.sourceNode === sourceNode && c.targetNode === targetNode,
        );
        if (existing > -1 && !ignored) {
            logs.ignoredConnections.splice(existing, 1);
            logs.edges = processEdges(logs.edges, { ignored: logs.ignoredConnections });
            return true;
        } else if (existing === -1 && ignored) {
            logs.ignoredConnections.push({ sourceNode, targetNode });
            logs.edges = processEdges(logs.edges, { ignored: logs.ignoredConnections });
            return true;
        }

        return false;
    }

    async save(base = "data", logs = this.data) {
        const actions = [...logs.actions].map((action, idx) => ({ id: idx, action }));
        const states = [...logs.states].map((state, idx) => {
            const [scene, name] = state.includes("/") ? state.split("/", 2) : ["", state];
            return { id: idx, name, scene };
        });
        const nodes = Object.values(logs.nodes).map((node, idx) => {
            return {
                id: idx,
                scene: node.scene,
                location: node.location,
                x: node.x,
                y: node.y,
                height: node.height,
            };
        });

        const getNode = (key: string) => nodes.find((n) => [n.scene, n.location].join("/") === key);

        const edges = logs.edges.map((edge) => ({
            source: getNode(edge.sourceNode)!.id,
            target: getNode(edge.targetNode)!.id,
            actions: [...edge.actions]
                .map((name) => actions.find((a) => a.action === name)!.id)
                .join(","),
            states: [...edge.states]
                .map(
                    (name) =>
                        states.find(
                            (s) => R.filter([s.scene, s.name], R.isTruthy).join("/") === name,
                        )!.id,
                )
                .join(","),
            "scene change": edge.sceneChange ? "1" : "0",
            "real time": edge.realTime,
            "game time": edge.gameTime,
            timestamp: edge.timestamp,
            status: edge.status,
        }));
        const ignoredConnections = logs.ignoredConnections.map((c) => ({
            source: getNode(c.sourceNode)!.id,
            target: getNode(c.targetNode)!.id,
        }));

        writeTsv(`${base}/actions.tsv`, actions, ["id", "action"]);
        writeTsv(`${base}/states.tsv`, states, ["id", "name", "scene"]);
        writeTsv(`${base}/nodes.tsv`, nodes, ["id", "scene", "location", "x", "y", "height"]);
        writeTsv(`${base}/edges.tsv`, edges, [
            "source",
            "target",
            "actions",
            "states",
            "scene change",
            "real time",
            "game time",
            "timestamp",
            "status",
        ]);
        writeTsv(`${base}/ignoredConnections.tsv`, ignoredConnections, ["source", "target"]);
        console.log("Write Complete");
    }

    mergeLog() {}
}

async function readTsv(filePath: string): Promise<Record<string, string>[] | null> {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        return parse(data, {
            delimiter: "\t",
            columns: true,
        });
    } catch (ex) {
        console.error(String(ex));
        return null;
    }
}

async function writeTsv(filePath: string, records: Record<string, unknown>[], columns: string[]) {
    try {
        const data = stringify(records, {
            header: true,
            columns,
            delimiter: "\t",
        });
        await fs.writeFile(filePath, data, "utf-8");
    } catch (ex) {
        console.error(String(ex));
    }
}

export { LogManager };
