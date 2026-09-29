import { supabase } from './supabase';
import type { GpsPoint } from '../types/gpsPoint';

export type RouteSummary = {
  id: string;
  name: string;
};

type CustomerRow = {
  id: string;
  name: string;
  note: string | null;
  latitude: number;
  longitude: number;
  route_order: number;
};

export const fetchRoutes = async (): Promise<RouteSummary[]> => {
  const { data, error } = await supabase.from('routes').select('id, name').order('name');
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as RouteSummary[];
};

export const fetchCustomers = async (routeId: string): Promise<GpsPoint[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, note, latitude, longitude, route_order')
    .eq('route_id', routeId)
    .eq('is_active', true)
    .order('route_order');

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CustomerRow[]).map((row) => ({
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    title: row.name,
    note: row.note ?? undefined,
    order: row.route_order,
  }));
};