import type { GpsPoint } from '../types/gpsPoint';

const formatCoordinates = (point: GpsPoint) =>
  `${point.latitude.toFixed(7)},${point.longitude.toFixed(7)}`;

export const getGoogleMapsUrl = (point: GpsPoint) =>
  `https://www.google.com/maps/dir/?api=1&destination=${formatCoordinates(point)}&travelmode=driving`;

export const getWazeUrl = (point: GpsPoint) =>
  `https://waze.com/ul?ll=${formatCoordinates(point)}&navigate=yes`;
