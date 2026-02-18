"use client";
// Leaflet Map Component for Bus Tracking

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom bus icon
const busIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

interface BusLocation {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: number;
  busId: string;
  plateNumber: string;
  routeName: string;
}

interface MapProps {
  locations: Record<string, BusLocation>;
}

export default function TrackingMap({ locations }: MapProps) {
  // Default center (Kigali)
  const defaultCenter: [number, number] = [-1.9441, 30.0619];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {Object.entries(locations).map(([busId, location]) => {
        return (
          <Marker
            key={busId}
            position={[location.latitude, location.longitude]}
            icon={busIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-1">
                  {location.plateNumber}
                </h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-semibold">Route:</span>{" "}
                    {location.routeName}
                  </p>
                  <p>
                    <span className="font-semibold">Speed:</span>{" "}
                    {location.speed.toFixed(1)} km/h
                  </p>
                  <p>
                    <span className="font-semibold">Updated:</span>{" "}
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
