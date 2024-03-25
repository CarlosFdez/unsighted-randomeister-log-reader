import { IpcRendererEvent, ipcRenderer } from "electron";
import * as R from "remeda";

type Destructor = () => void;

/**
 * Exposed to the renderer to perform IPC stuff on its behalf.
 * Because of the electron security model, electron API is not available to the web view.
 * This is the only renderer code that has any access.
 * Due to the way electron works, this can't be a class
 */
const globals = {
    /** Expose a subset of ipcRenderer functions to the process */
    ipcRenderer: {
        ...R.pick(ipcRenderer, ["invoke", "on", "once", "removeListener", "send"]),
    },
    unsighted: {
        /**
         * Create listener that is called when receiving new logs.
         * When registered, it requests the current logs from the server as well.
         * @returns a function that can be called to unregister
         */
        receiveLogs(callback: (logs: LogData) => void): Destructor {
            const off = on("updateLogs", (_, data) => callback(data as LogData));
            ipcRenderer.invoke("getLogs").then((logs) => {
                callback(logs);
            });
            return off;
        },
    },
};

function on<T>(channel: string, callback: (evt: IpcRendererEvent, data: T) => void): Destructor {
    ipcRenderer.on(channel, callback);
    return () => ipcRenderer.off(channel, callback);
}

export { globals };
