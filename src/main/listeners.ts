import { dialog, ipcMain } from "electron";
import { LogManager } from "./log-manager";

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
