import React, { useEffect, useMemo, useRef, useState } from 'react';

const tileSize = 256;
const width = 600;
const height = 320;

const project = (point, zoom) => {
    const scale = tileSize * (2 ** zoom);
    const sinLat = Math.sin((point.lat * Math.PI) / 180);

    return {
        x: ((point.lng + 180) / 360) * scale,
        y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
    };
};

const finitePoints = (points) => points.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

export default function RondaRouteMap({ pathPoints = [], checkpointPoints = [] }) {
    const routePoints = finitePoints(pathPoints);
    const markers = finitePoints(checkpointPoints);
    const allPoints = [...routePoints, ...markers];
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const dragRef = useRef(null);
    const pointKey = allPoints.map((point) => `${point.id}:${point.name}:${point.lat},${point.lng}:${point.scanned}`).join('|');

    useEffect(() => setPan({ x: 0, y: 0 }), [pointKey]);

    const map = useMemo(() => {
        if (allPoints.length === 0) return null;

        const minLat = Math.min(...allPoints.map((point) => point.lat));
        const maxLat = Math.max(...allPoints.map((point) => point.lat));
        const minLng = Math.min(...allPoints.map((point) => point.lng));
        const maxLng = Math.max(...allPoints.map((point) => point.lng));
        const center = { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
        const zoom = (() => {
            for (let nextZoom = 18; nextZoom >= 12; nextZoom -= 1) {
                const topLeft = project({ lat: maxLat, lng: minLng }, nextZoom);
                const bottomRight = project({ lat: minLat, lng: maxLng }, nextZoom);
                if (Math.abs(bottomRight.x - topLeft.x) <= width - 96 && Math.abs(bottomRight.y - topLeft.y) <= height - 96) return nextZoom;
            }

            return 12;
        })();
        const centerWorld = project(center, zoom);
        const maxTile = 2 ** zoom;
        const centerTileX = Math.floor(centerWorld.x / tileSize);
        const centerTileY = Math.floor(centerWorld.y / tileSize);
        const tiles = [];

        for (let x = centerTileX - 3; x <= centerTileX + 3; x += 1) {
            for (let y = centerTileY - 3; y <= centerTileY + 3; y += 1) {
                if (y < 0 || y >= maxTile) continue;
                const wrappedX = ((x % maxTile) + maxTile) % maxTile;
                tiles.push({
                    key: `${zoom}-${x}-${y}`,
                    src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
                    left: width / 2 + (x * tileSize - centerWorld.x),
                    top: height / 2 + (y * tileSize - centerWorld.y),
                });
            }
        }

        const toScreen = (point) => ({
            ...point,
            x: width / 2 + (project(point, zoom).x - centerWorld.x),
            y: height / 2 + (project(point, zoom).y - centerWorld.y),
        });

        return {
            zoom,
            tiles,
            route: routePoints.map(toScreen),
            markers: markers.map(toScreen),
        };
    }, [pointKey]);

    if (!map) {
        return <div className="grid h-80 place-items-center rounded-lg border border-dashed bg-slate-50 text-sm text-slate-500">Belum ada data rute.</div>;
    }

    const line = map.route.map((point) => `${point.x + pan.x},${point.y + pan.y}`).join(' ');

    const startDrag = (event) => {
        dragRef.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const moveDrag = (event) => {
        if (!dragRef.current) return;
        const dx = event.clientX - dragRef.current.x;
        const dy = event.clientY - dragRef.current.y;
        dragRef.current = { x: event.clientX, y: event.clientY };
        setPan((current) => ({ x: current.x + dx, y: current.y + dy }));
    };

    const endDrag = () => {
        dragRef.current = null;
    };

    return (
        <div
            className="relative h-80 cursor-grab overflow-hidden rounded-lg border bg-slate-100 active:cursor-grabbing"
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        >
            <div className="absolute left-1/2 top-1/2 h-[320px] w-[600px] -translate-x-1/2 -translate-y-1/2 select-none">
                {map.tiles.map((tile) => (
                    <img
                        key={tile.key}
                        src={tile.src}
                        alt=""
                        draggable={false}
                        className="absolute max-w-none select-none"
                        style={{ width: tileSize, height: tileSize, left: tile.left + pan.x, top: tile.top + pan.y }}
                    />
                ))}
                <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full">
                    {map.route.length > 1 && (
                        <>
                            <polyline points={line} fill="none" stroke="#00468B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                            <polyline points={line} fill="none" stroke="white" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </>
                    )}
                    {map.markers.map((point, index) => (
                        <g key={point.id ?? `${point.lat}-${point.lng}`}>
                            <circle cx={point.x + pan.x} cy={point.y + pan.y} r="11" fill={point.scanned ? '#16a34a' : '#00468B'} />
                            <circle cx={point.x + pan.x} cy={point.y + pan.y} r="5" fill="white" />
                            <text x={point.x + pan.x + 13} y={point.y + pan.y - 10} fontSize="12" fontWeight="700" fill="#0f172a" paintOrder="stroke" stroke="white" strokeWidth="3">
                                {index + 1}. {point.name}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
            <div className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
                Geser map · OpenStreetMap · Zoom {map.zoom}
            </div>
        </div>
    );
}
