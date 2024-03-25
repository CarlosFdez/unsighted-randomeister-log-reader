import { css } from "@emotion/react";
import { forwardRef, useEffect, useRef } from "react";
import { useDrop } from "react-dnd";

import MapVersion2 from "../../assets/Texture2D/MapVersion2.png";

function toNumber(value: string | undefined | null) {
    return Number(value?.replace("px", "") || "0");
}

export function MapView() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const elementEl = containerRef.current;
        const mapEl = mapRef.current;
        if (!elementEl || !mapEl) return;

        const mouseMove = (evt: MouseEvent) => {
            // eslint-disable-next-line no-bitwise
            const rightClickHeld = (evt.buttons & 2) > 0;
            if (rightClickHeld) {
                mapEl.style.left = `${toNumber(mapEl.style.left) + evt.movementX}px`;
                mapEl.style.top = `${toNumber(mapEl.style.top) + evt.movementY}px`;
            }
        };

        // Zoom in/out (negative deltaY is up, increment is 100)
        const wheel = (evt: WheelEvent) => {
            const tick = evt.deltaY / 1000;
            const newScale = Number(mapEl.dataset.scale ?? 1) - tick;
            mapEl.dataset.scale = String(newScale);
            mapEl.style.transform = `scale(${newScale})`;
        };

        elementEl.addEventListener("mousemove", mouseMove);
        elementEl.addEventListener("wheel", wheel);

        return (): void => {
            elementEl.removeEventListener("mousemove", mouseMove);
            elementEl.removeEventListener("wheel", wheel);
        };
    }, []);

    return (
        <div css={ContainerStyle} ref={containerRef}>
            <MapImage ref={mapRef} />
        </div>
    );
}

const MapImage = forwardRef<HTMLDivElement>((props, ref) => {
    // note: this is here from me trying to figure out how to use react-dnd. I'll fix it later
    const [collectedProps, drop] = useDrop(() => ({
        accept: "scene",
        collect: (monitor) => ({
            item: monitor.getItem(),
            isHovering: monitor.isOver({ shallow: true})
        }),
        hover: (item, monitor) => {
            console.log("HOVER");
        },
        drop: (item, monitor) => {
            console.log(item, monitor);
            return item;
        },
        canDrop: (item, monitor) => {
            return true;
        }
    }));

    return (
        <div ref={ref} css={MapStyle}>
            <img ref={drop} src={MapVersion2} />
        </div>
    )
});

const ContainerStyle = css`
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

const MapStyle = css`
    position: absolute;
    background-color: black;
    overflow: hidden;
    z-index: -1;
`;
