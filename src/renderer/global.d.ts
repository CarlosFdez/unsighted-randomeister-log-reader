import type { globals } from "../preload/api";

declare global {
    const ipcRenderer: (typeof globals)["ipcRenderer"];
    const unsighted: (typeof globals)["unsighted"];
}
