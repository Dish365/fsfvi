"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Dynamically import the map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);

// Ghana cocoa region data
export const ghanaCocoaRegions = [
  {
    id: "western",
    name: "Western Region",
    position: [5.7634, -2.0494],
    production: 60,
    vulnerabilityScore: 0.25,
    description: "Main cocoa-growing region, accounts for over 50% of Ghana's production",
  },
  {
    id: "eastern",
    name: "Eastern Region",
    position: [6.1152, -0.3066],
    production: 15,
    vulnerabilityScore: 0.32,
    description: "Historically significant cocoa region with aging farms",
  },
  {
    id: "ashanti",
    name: "Ashanti Region",
    position: [6.7470, -1.5209],
    production: 12,
    vulnerabilityScore: 0.28,
    description: "Central region with both small and large-scale cocoa farms",
  },
  {
    id: "central",
    name: "Central Region",
    position: [5.5557, -1.1468],
    production: 8,
    vulnerabilityScore: 0.35,
    description: "Coastal region with declining cocoa production",
  },
  {
    id: "brong_ahafo",
    name: "Brong-Ahafo Region",
    position: [7.7601, -1.6734],
    production: 5,
    vulnerabilityScore: 0.30,
    description: "Northern frontier of cocoa cultivation with expanding farms",
  },
];

interface GhanaCocoaMapProps {
  title: string;
  description?: string;
  height?: number;
  showVulnerability?: boolean;
}

export function GhanaCocoaMap({
  title,
  description,
  height = 500,
  showVulnerability = true,
}: GhanaCocoaMapProps) {
  // Center on Ghana
  const ghanaCenter = [7.9527, -1.0307];
  const zoom = 7;

  // Get marker color based on vulnerability
  const getMarkerColor = (score: number) => {
    if (score < 0.2) return "#22c55e"; // green-500
    if (score < 0.3) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  // Get marker size based on production
  const getMarkerSize = (production: number) => {
    return (production / 10) + 10; // Scale marker size based on production percentage
  };

  // Add leaflet CSS - using CSS import to avoid SSR issues
  React.useEffect(() => {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(linkElement);

    return () => {
      document.head.removeChild(linkElement);
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent style={{ height: height }}>
        {typeof window !== "undefined" && (
          <MapContainer
            {...{
              center: ghanaCenter as [number, number],
              zoom,
              style: { height: "100%", width: "100%" }
            } as any}
          >
            <TileLayer
              {...{
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              } as any}
            />
            {ghanaCocoaRegions.map((region) => (
              <CircleMarker
                key={region.id}
                {...{
                  center: region.position as [number, number],
                  radius: getMarkerSize(region.production),
                  pathOptions: {
                    fillColor: showVulnerability ? getMarkerColor(region.vulnerabilityScore) : "#3b82f6",
                    color: "#1e40af",
                    weight: 1,
                    fillOpacity: 0.7,
                  }
                } as any}
              >
                <Popup {...{} as any}>
                  <div className="p-2">
                    <h3 className="font-medium text-base">{region.name}</h3>
                    <p className="text-sm text-slate-600">{region.description}</p>
                    <div className="mt-2 text-sm">
                      <div><strong>Production:</strong> {region.production}% of Ghana's total</div>
                      {showVulnerability && (
                        <div><strong>Vulnerability:</strong> {(region.vulnerabilityScore * 100).toFixed(1)}%</div>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </CardContent>
    </Card>
  );
} 