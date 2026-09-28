import { memo, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GpsPoint } from '../types/gpsPoint';
import { getGoogleMapsUrl, getWazeUrl } from '../utils/navigationLinks';


type StopsMapProps = {
  points: GpsPoint[];
};

const defaultCenter: LatLngTuple = [50.0755, 14.4378];

const createStopIcon = (label: string) =>
  L.divIcon({
    className: 'stop-marker',
    html: `<span>${label}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

function StopsMap({ points }: StopsMapProps) {
  const positions = useMemo(
    () => points.map((point): LatLngTuple => [point.latitude, point.longitude]),
    [points],
  );

  const icons = useMemo(
    () => points.map((point, index) => createStopIcon(String(point.order ?? index + 1))),
    [points],
  );

  const hasPoints = positions.length > 0;

  return (
    <MapContainer
      className="stops-map"
      bounds={hasPoints ? positions : undefined}
      boundsOptions={{ padding: [48, 48] }}
      center={hasPoints ? undefined : defaultCenter}
      zoom={hasPoints ? undefined : 12}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point, index) => (
        <Marker key={point.id} position={positions[index]} icon={icons[index]}>
                    <Popup>
            <div className="stop-popup">
              <strong>{point.title ?? 'Zastávka'}</strong>
                            {point.note && <p className="stop-note">{point.note}</p>}
              <a className="nav-button" href={getGoogleMapsUrl(point)} target="_blank" rel="noopener noreferrer">
                Google Maps
              </a>
              <a className="nav-button nav-button-waze" href={getWazeUrl(point)} target="_blank" rel="noopener noreferrer">
                Waze
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default memo(StopsMap);
