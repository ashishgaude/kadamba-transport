import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import type { Stop, Shape } from '../lib/gtfs';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  stops: (Stop & { arrival_time?: string })[];
  selectedShape: Shape[] | null;
  selectedRouteName?: string;
}

const GoaCenter: [number, number] = [15.2993, 74.1240];

function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function Map({ stops, selectedShape, selectedRouteName }: MapProps) {
  
  // Use shape if available, otherwise fallback to connecting the stops
  const polylinePositions = (selectedShape && selectedShape.length > 0)
    ? selectedShape.map(s => [s.shape_pt_lat, s.shape_pt_lon] as [number, number])
    : stops.map(s => [s.stop_lat, s.stop_lon] as [number, number]);
  
  const bounds = polylinePositions.length > 0 
    ? L.latLngBounds(polylinePositions) 
    : null;

  return (
    <div className="h-full w-full">
      <MapContainer center={GoaCenter} zoom={10} scrollWheelZoom={true} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView bounds={bounds} />
        
        {stops.slice(0, (selectedShape || polylinePositions.length > 0) ? undefined : 500).map((stop, idx) => (
          <Marker key={`${stop.stop_id}-${idx}`} position={[stop.stop_lat, stop.stop_lon]}>
            <Popup className="custom-popup">
              <div className="flex flex-col min-w-[150px]">
                <div className="border-b border-gray-100 pb-2 mb-2">
                    <strong className="text-blue-700 text-sm block leading-tight">{stop.stop_name}</strong>
                    <span className="text-[10px] text-gray-400 font-mono tracking-wide">ID: {stop.stop_id}</span>
                </div>
                {stop.arrival_time && (
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="text-lg">🕒</span>
                    <div>
                        <span className="text-[10px] uppercase text-gray-500 font-bold block">Arrival</span>
                        <span className="text-sm font-semibold text-gray-800">{stop.arrival_time}</span>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {polylinePositions.length > 0 && (
             <>
                {/* Road Casing Effect: Thick dark outer line */}
                <Polyline positions={polylinePositions} color="#1e3a8a" weight={8} opacity={0.8} />
                {/* Inner bright line */}
                <Polyline positions={polylinePositions} color="#3b82f6" weight={5} opacity={1} />
             </>
        )}
        
      </MapContainer>
      {selectedRouteName && (
          <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded shadow-lg">
              <span className="font-bold text-blue-600">Route: {selectedRouteName}</span>
          </div>
      )}
    </div>
  );
}
