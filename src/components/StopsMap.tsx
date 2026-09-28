import { memo, useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GpsPoint } from '../types/gpsPoint';

type StopStatus = 'current' | 'delivered' | 'pending';

type StopsMapProps = {
  points: GpsPoint[];
  currentId?: string;
  deliveredIds: ReadonlySet<string>;
  onSelect: (index: number) => void;
};

const defaultCenter: LatLngTuple = [50.0755, 14.4378];
const focusZoom = 17;

const createStopIcon = (label: string, status: StopStatus) => {
  const size = status === 'current' ? 44 : 36;
  return L.divIcon({
    className: `stop-marker stop-marker-${status}`,
    html: `<span>${label}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

function FocusOnPosition({ position }: { position?: LatLngTuple }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, Math.max(map.getZoom(), focusZoom));
    }
  }, [map, position]);

  return null;
}

function StopsMap({ points, currentId, deliveredIds, onSelect }: StopsMapProps) {
  const positions = useMemo(
    () => points.map((point): LatLngTuple => [point.latitude, point.longitude]),
    [points],
  );

  const icons = useMemo(
    () =>
      points.map((point, index) => {
        let status: StopStatus = 'pending';
        if (point.id === currentId) {
          status = 'current';
        } else if (deliveredIds.has(point.id)) {
          status = 'delivered';
        }
        return createStopIcon(String(point.order ?? index + 1), status);
      }),
    [points, currentId, deliveredIds],
  );

  const currentIndex = points.findIndex((point) => point.id === currentId);
  const currentPosition = currentIndex >= 0 ? positions[currentIndex] : undefined;
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
        <Marker
          key={point.id}
          position={positions[index]}
          icon={icons[index]}
          zIndexOffset={point.id === currentId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(index) }}
        />
      ))}
      <FocusOnPosition position={currentPosition} />
    </MapContainer>
  );
}

export default memo(StopsMap);