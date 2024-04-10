import { SceneData, useScenes } from "../hooks";
import { Link, useMatch } from "react-router-dom";
import { css } from "@emotion/react";
import { useDrag } from "react-dnd";
import { SidebarStyle } from "@renderer/components/Sidebar";
import { FormEvent, useMemo, useState } from "react";
import * as R from "remeda";
import MiniSearch from "minisearch";

export function SceneList() {
    const scenes = useScenes();
    const { sceneName } = useMatch("/scenes/:sceneName")?.params ?? {};
    const [filter, setFilter] = useState("");
    const search = useMemo(() => {
		const search = new MiniSearch({
            idField: "name",
			fields: ["name"],
			searchOptions: {
                prefix: true,
				fuzzy: 0.2,
			},
		});
		search.addAll(Object.values(scenes));
		return search;
	}, [scenes]);

    const results = filter ? search.search(filter) : null;
    const visibleScenes = Object.values(results ? R.pick(scenes, results.map((r) => r.id)) : scenes);

    return (
        <div css={SceneListSidebarStyle}>
            <input type="text" placeholder="Filter" value={filter} onInput={(evt: FormEvent<HTMLInputElement>) => setFilter(evt.currentTarget.value)} />
            <div css={SceneListEntryListStyle}>
                {visibleScenes.map((s) =>
                    <SceneListEntry key={s.name} scene={s} selected={sceneName === s.name}/>
                )}
            </div>
        </div>
    );
}

function SceneListEntry(props: { scene: SceneData, selected: boolean }) {
    const scene = props.scene;

    const [_collected, drag, dragPreview] = useDrag(() => ({
        type: "scene",
        item: { sceneName: scene.name }
    }));

    const unverified = scene.edges.filter((e) => e.status === null && !e.ignored).length;
    const ignoredConnection = scene.connections.filter((c) => c.ignored).length;

    return (
        <Link
            css={SceneListEntryStyle}
            to={`scenes/${scene.name}`}
            ref={dragPreview}
            draggable={false}
            className={props.selected ? "selected" : ""}>
            <span className="name" ref={drag}>
                {scene.name}
            </span>
            <span className="nodes">
                {scene.connections.length - ignoredConnection} Connections
                {ignoredConnection > 0 ? <span className="info">({ignoredConnection} ignored)</span> : null}
            </span>
            <span className="nodes">
                {scene.edges.length} Edges
                {unverified > 0 ? <span className="info redundant">({unverified} unverified)</span> : null}
            </span>
        </Link>
    );
}

const SceneListSidebarStyle = css`
    ${SidebarStyle}
    flex: 0 0 min-content;
    white-space: nowrap;
    display: flex;
    flex-direction: column;

    input {
        border: none;
        border-bottom: 1px solid #666;
        padding: 0.25rem 0.375rem;
    }
`;

const SceneListEntryListStyle = css`
    overflow: auto;
`;

const SceneListEntryStyle = css`
    display: flex;
    flex-direction: column;
    cursor: pointer;
    color: unset;
    text-decoration: unset;
    padding: 0.25rem 0.375rem;
    &:hover, &.selected {
        background-color: rgba(255, 255, 255, 0.8);
    }
    .name {
        text-decoration: underline;
    }
    .nodes {
        display: block;
    }
    .info {
        font-size: 0.95em;
        margin-left: 0.5ch;
    }
    .redundant {
        color: #AA0000;
        font-weight: 500;
    }
`;
