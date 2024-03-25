import { contextBridge } from "electron";
import { globals } from "./api";

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        for (const [key, value] of Object.entries(globals)) {
            contextBridge.exposeInMainWorld(key, value);
        }
    } catch (error) {
        console.error(error);
    }
} else {
    for (const [key, value] of Object.entries(globals)) {
        window[key] = value;
    }
}
