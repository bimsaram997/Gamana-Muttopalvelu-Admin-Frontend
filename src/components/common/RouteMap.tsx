import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { RouteResultDto } from "../../types/booking";

interface Props {
  routeResult: RouteResultDto;
  height?: number;
}

export default function RouteMap({ routeResult, height = 380 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Initialize the map
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [23.7871, 61.4978], // Tampere center fallback
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      map.resize();
      renderRoute(map, routeResult);
    });

    // 2. Cleanup when component unmounts
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [routeResult]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        position: "relative",
      }}
    />
  );
}

// ============================================================
// Route Rendering Logic (Ported from your Angular component)
// ============================================================

function renderRoute(map: maplibregl.Map, routeResult: RouteResultDto) {
  // Parse polyline coordinates
  let rawCoordinates: [number, number][] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any = routeResult.encodedPolyline;
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    if (parsed && Array.isArray(parsed.coordinates)) {
      rawCoordinates = parsed.coordinates;
    }
  } catch (e) {
    console.error("Error parsing polyline:", e);
  }

  let routeCoordinates: [number, number][] = rawCoordinates.map((c) => [
    Number(c[0]),
    Number(c[1]),
  ]);

  const waypoints = routeResult.optimizedWaypoints ?? [];

  // Fallback to waypoints if polyline is missing
  if (routeCoordinates.length < 2 && waypoints.length >= 2) {
    routeCoordinates = waypoints.map((wp) => [wp.longitude, wp.latitude]);
  }

  if (routeCoordinates.length < 2) return;

  // --- 1. Add Custom Markers ---
  const totalWaypoints = waypoints.length;
  let pickupCounter = 1;

  waypoints.forEach((wp, idx) => {
    if (wp.latitude == null || wp.longitude == null) return;

    const el = document.createElement("div");
    el.style.display = "flex";
    el.style.flexDirection = "column";
    el.style.alignItems = "center";
    el.style.cursor = "pointer";

    if (idx === 0) {
      // Office (Start)
      el.innerHTML = `
        <div style="background-color:#198754;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:12px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid #fff;margin-bottom:2px;display:flex;align-items:center;gap:4px;">
          <span>🏢</span><span>Office</span>
        </div>
        <div style="background-color:#198754;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.4);"></div>
      `;
    } else if (idx === totalWaypoints - 1) {
      // Delivery (End)
      el.innerHTML = `
        <div style="background-color:#D2232A;width:22px;height:22px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;">🏁</div>
      `;
    } else {
      // Numbered Pickups
      const n = pickupCounter++;
      el.innerHTML = `
        <div style="background-color:#0d6efd;color:#fff;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;">${n}</div>
      `;
    }

    new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([wp.longitude, wp.latitude])
      .addTo(map);
  });

  // --- 2. Draw the Polyline using SVG ---
  const canvasContainer = map.getCanvasContainer();
  let svg = canvasContainer.querySelector("#map-route-svg") as SVGSVGElement | null;

  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "map-route-svg";
    Object.assign(svg.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "1",
    });
    canvasContainer.appendChild(svg);
  }

  svg.innerHTML = `
    <path id="svg-route-casing" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
    <path id="svg-route-line" fill="none" stroke="#0b86be" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" />
    <g id="svg-route-arrows"></g>
  `;

  const casingPath = svg.querySelector("#svg-route-casing") as SVGPathElement;
  const linePath = svg.querySelector("#svg-route-line") as SVGPathElement;
  const arrowsGroup = svg.querySelector("#svg-route-arrows") as SVGGElement;

  const updateSvgPath = () => {
    const screenPoints = routeCoordinates.map((coord) => map.project(coord));

    const pathData = screenPoints
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(" ");

    casingPath?.setAttribute("d", pathData);
    linePath?.setAttribute("d", pathData);

    if (arrowsGroup) {
      let arrowHtml = "";
      const stepInterval = 120;
      let accumulated = 0;

      for (let i = 0; i < screenPoints.length - 1; i++) {
        const p1 = screenPoints[i];
        const p2 = screenPoints[i + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const segmentDist = Math.hypot(dx, dy);

        accumulated += segmentDist;

        if (accumulated >= stepInterval && segmentDist > 10) {
          accumulated = 0;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          arrowHtml += `
            <path d="M ${midX - 4} ${midY - 4} L ${midX + 4} ${midY} L ${midX - 4} ${midY + 4} Z"
                  fill="#FFFFFF"
                  transform="rotate(${angle}, ${midX}, ${midY})" />
          `;
        }
      }
      arrowsGroup.innerHTML = arrowHtml;
    }
  };

  map.on("render", updateSvgPath);
  map.on("move", updateSvgPath);
  map.on("zoom", updateSvgPath);
  updateSvgPath();

  // --- 3. Fit Bounds ---
  const bounds = routeCoordinates.reduce(
    (b, coord) => b.extend(coord),
    new maplibregl.LngLatBounds(routeCoordinates[0], routeCoordinates[0])
  );
  map.fitBounds(bounds, { padding: 70 });
}