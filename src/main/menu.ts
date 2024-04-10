import { Menu, dialog, ipcMain } from "electron";
import { LogManager } from "./log-manager";
import { getDuplicateEdges } from "../shared/logs";

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
                        const logs = await logManager.readLogs(path);
                        console.log(logs);
                    } catch (ex) {
                        const message = ex instanceof Error ? ex.message : "Failed to read logs";
                        dialog.showErrorBox("Error", message);
                    }
                },
            },
            {
                label: "Save",
                accelerator: "CTRL+S",
                click: async (_, window) => {
                    await logManager.save();
                    window?.webContents.send("notification", { content: "Save successful" });
                },
            },
        ],
    },
    {
        label: "Actions",
        submenu: [
            {
                label: "Remove Logical Duplicates",
                click: async (_item, window) => {
                    const duplicates = getDuplicateEdges(logManager.data.edges, { exact: false });
                    if (duplicates.length === 0) {
                        dialog.showMessageBox({ message: "There are no logical duplicate edges" });
                        return;
                    }

                    const result = await dialog.showMessageBox({
                        message: `Remove ${duplicates.length} duplicate edges?`,
                        buttons: ["OK", "Cancel"],
                    });
                    if (result.response === 0) {
                        logManager.deleteEdges(new Set(duplicates.map((d) => d.key)));
                        window?.webContents.send("updateLogs", logManager.data);
                        console.log("Duplicate logs deleted");
                    }
                },
            },
        ],
    },
]);

export { menu };
