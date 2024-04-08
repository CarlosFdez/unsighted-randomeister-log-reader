import { css } from "@emotion/react";
import * as R from "remeda";
import { getDuplicateEdges } from "../../shared/logs";

export function LogReport(props: { logs: LogData }) {
    const logs = props.logs;
    const nodeList = Object.values(logs.nodes);
    const connections = R.uniqueBy([...logs.edges, ...logs.ignoredConnections], (e) => `${e.sourceNode}-${e.targetNode}`).length;
    const logicalDuplicates = getDuplicateEdges(logs.edges, { exact: false })
    const activeEdges = logs.edges.filter((e) => !e.ignored);

    return (
        <div css={ReportStyle}>
            <div>Total Nodes: {nodeList.length}</div>
            <div>Connections: {connections - logs.ignoredConnections.length}</div>
            <hr/>
            <div>Approved Edges: {R.filter(activeEdges, (e) => e.status === "active").length}</div>
            <div>Redundant Edges: {R.filter(activeEdges, (e) => e.status === "redundant").length}</div>
            <div>Unverified Edges: {R.filter(activeEdges, (e) => e.status === null).length}</div>
            <div>Ignored Edges: {logs.edges.length - activeEdges.length}</div>
            <hr/>
            <div>Logical Duplicates: {logicalDuplicates.length}</div>
        </div>
    );
}

const ReportStyle = css`
    border-radius: 5px;
    background-color: #222;
    color: white;
    padding: 8px;
    z-index: 1;

    hr {
        border-color: #aaa;
        margin: 0.25rem 0;
    }

    div {
        white-space: nowrap;
    }
`;
