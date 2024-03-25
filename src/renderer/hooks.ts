import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOGS } from "../shared/logs";
import * as R from "remeda";

const LogsContext = createContext<LogData>(DEFAULT_LOGS);

function useScenes() {
    const { nodes } = useContext(LogsContext);

    return useMemo(() => {
        const nodeList = Object.values(nodes);
        return R.pipe(
            nodeList.map((n) => n.scene),
            R.unique(),
            R.map((name) => ({
                name: name,
                nodes: nodeList.filter((n) => n.scene === name),
            })),
            R.mapToObj((scene) => [scene.name, scene]),
        );
    }, [nodes]);
}

export { LogsContext, useScenes };
