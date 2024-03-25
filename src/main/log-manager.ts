import { ipcMain } from "electron";
import { DEFAULT_LOGS } from "../shared/logs";
import { parse } from "csv-parse/sync";
import fs from "node:fs/promises";
import * as path from "node:path";

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

        const edges = rawEdges.map<EdgeData>((data) => ({
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
        }));

        return {
            actions: new Set(Object.values(actionsById)),
            states: new Set(Object.values(statesById)),
            nodes: R.mapToObj(Object.values(nodesById), (n) => [n.key, n]),
            edges,
        };
    }

    async save() {
        const output = JSON.stringify(this.data, null, "\t");
        return fs.writeFile("data/output.json", output, { encoding: "utf-8" });
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
    } catch {
        return null;
    }
}

export { LogManager };
