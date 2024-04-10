import { dialog, ipcMain } from "electron";
import { LogManager } from "./log-manager";
import { processEdges } from "../shared/logs";

const logManager = LogManager.instance;

ipcMain.on("reload", async () => {
    try {
        logManager.reload();
    } catch (err) {
        dialog.showErrorBox("Error", String(err));
    }
});

/** Persists an edge status update manually */
ipcMain.on("updateEdgeStatus", (event, edgeId, status: EdgeStatus) => {
    const edge = logManager.data.edges.find((e) => e.key === edgeId);
    if (edge) {
        edge.status = status;
        logManager.data.edges = processEdges(logManager.data.edges);
        event.reply("updateLogs", logManager.data);
    }
});

ipcMain.on(
    "ignoreConnection",
    (event, options: { sourceNode: string; targetNode: string; ignored?: boolean }) => {
        const ignored = options.ignored ?? true;
        const { sourceNode, targetNode } = options;
        const logs = logManager.data;

        if (!logs.nodes[sourceNode] || !logs.nodes[targetNode]) {
            console.error("ignoreConnection requires a source node and target node that exists");
            return;
        }

        if (logManager.updateConnectionStatus(sourceNode, targetNode, ignored)) {
            event.reply("updateLogs", logs);
        }
    },
);

ipcMain.on("deleteEdges", (event, edges: string[]) => {
    console.log(edges);
    logManager.deleteEdges(new Set(edges));
    event.reply("updateLogs", logManager.data);
});

ipcMain.handle("getLogs", async (_event) => {
    return logManager.data;
});
