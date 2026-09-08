"use client";

import { useEffect, useMemo } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

function RecenterMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude]);
  }, [latitude, longitude, map]);

  return null;
}

type GpsLocationPickerProps = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  onChange: (latitude: number, longitude: number) => void;
};

const markerIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({
  onChange,
}: {
  onChange: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onChange(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

export function GpsLocationPicker({
  latitude,
  longitude,
  radiusMeters,
  onChange,
}: GpsLocationPickerProps) {
  const position = useMemo(
    () => [latitude, longitude] as [number, number],
    [latitude, longitude]
  );

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <MapContainer
        center={position}
        zoom={16}
        className="h-[400px] w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={position}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend(event) {
              const marker = event.target;
              const newPosition = marker.getLatLng();

              onChange(
                newPosition.lat,
                newPosition.lng
              );
            },
          }}
        />

        <Circle
          center={position}
          radius={radiusMeters}
        />

        <MapClickHandler onChange={onChange} />
      </MapContainer>
    </div>
  );
}