import { Menu, dialog, ipcMain } from "electron";
import { LogManager } from "./log-manager";

const logManager = LogManager.instance;
const menu = Menu.buildFromTemplate([
    {
        label: "File",
        submenu: [
            {
                label: "Import New Logs",
                click: async () => {
                    const result = await dialog.showOpenDialog({
                        properties: ["openDirectory"],
                        title: "Open Log Directory",
                    });
                    const path = result.filePaths.at(0);
                    if (!path) return;

                    try {
                        console.log(logManager.data);
                        const logs = await logManager.readLogs(path);
                        ipcMain.emit("handleImport", logs);
                    } catch (ex) {
                        const message = ex instanceof Error ? ex.message : "Failed to read logs";
                        dialog.showErrorBox("Error", message);
                    }
                },
            },
            {
                label: "Save",
                accelerator: "CTRL+S",
                click: async () => {
                    await logManager.save();
                },
            },
        ],
    },
]);

export { menu };
