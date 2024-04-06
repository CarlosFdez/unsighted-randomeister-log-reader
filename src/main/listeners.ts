import { dialog, ipcMain } from "electron";
import { LogManager } from "./log-manager";
import { processEdges } from "../shared/logs";

const logManager = LogManager.instance;
const test = ipcMain;
console.log(test);

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

ipcMain.on("deleteEdges", (event, edges: string[]) => {
    console.log(edges);
    logManager.deleteEdges(new Set(edges));
    event.reply("updateLogs", logManager.data);
});

ipcMain.handle("getLogs", async (_event) => {
    return logManager.data;
});

ipcMain.handle("save", async () => {
    await logManager.save();
    return true;
});
