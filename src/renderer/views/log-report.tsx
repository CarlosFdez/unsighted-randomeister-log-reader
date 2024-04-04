import { css } from "@emotion/react";
import * as R from "remeda";
import { getDuplicateEdges } from "../../shared/logs";

export function LogReport(props: { logs: LogData }) {
    const logs = props.logs;
    const nodeList = Object.values(logs.nodes);
    const connections = R.uniqueBy(logs.edges, (e) => `${e.sourceNode}-${e.targetNode}`).length;
    const redundant = R.sumBy(logs.edges, (e) => e.status === "redundant" ? 1 : 0);
    const logicalDuplicates = getDuplicateEdges(logs.edges, { exact: false })

    return (
        <div css={ReportStyle}>
            <div>Total Nodes: {nodeList.length}</div>
            <div>Active Edges: {logs.edges.length - redundant}</div>
            <div>Redundant Edges: {redundant}</div>
            <div>Logical Duplicates: {logicalDuplicates.length}</div>
            <div>Connections: {connections}</div>
        </div>
    );
}

const ReportStyle = css`
    border-radius: 5px;
    background-color: #222;
    color: white;
    padding: 8px;
    z-index: 1;

    div {
        white-space: nowrap;
    }
`;
