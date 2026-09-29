import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GpsPoint } from '../types/gpsPoint';
import { fetchCustomers, fetchRoutes } from '../lib/customers';
import type { RouteSummary } from '../lib/customers';
import { supabase } from '../lib/supabase';
import type { StoredRoute } from '../utils/routeStorage';

type CustomerPickerProps = {
  onStart: (route: StoredRoute) => void;
  onImportText: () => void;
  onBack?: () => void;
};

// Hledání bez ohledu na diakritiku, aby "koristka" našlo "Kořistka"
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

function CustomerPicker({ onStart, onImportText, onBack }: CustomerPickerProps) {
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [routeId, setRouteId] = useState('');
  const [customers, setCustomers] = useState<GpsPoint[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    fetchRoutes()
      .then((loadedRoutes) => {
        if (!isActive) {
          return;
        }
        setRoutes(loadedRoutes);
        setRouteId(loadedRoutes[0]?.id ?? '');
        if (loadedRoutes.length === 0) {
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setErrorMessage('Nepodařilo se načíst trasy. Zkontroluj připojení.');
          setIsLoading(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!routeId) {
      return;
    }
    let isActive = true;
    fetchCustomers(routeId)
      .then((loadedCustomers) => {
        if (isActive) {
          setCustomers(loadedCustomers);
          setSelectedIds(new Set());
        }
      })
      .catch(() => {
        if (isActive) {
          setErrorMessage('Nepodařilo se načíst zákazníky. Zkontroluj připojení.');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, [routeId]);

  const filteredCustomers = useMemo(() => {
    const query = normalize(search.trim());
    if (!query) {
      return customers;
    }
    return customers.filter((customer) => normalize(customer.title ?? '').includes(query));
  }, [customers, search]);

  const handleRouteChange = (newRouteId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setRouteId(newRouteId);
  };

  const toggleCustomer = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleStart = () => {
    const selectedRoute = routes.find((route) => route.id === routeId);
    const stops = customers.filter((customer) => selectedIds.has(customer.id));
    if (!selectedRoute || stops.length === 0) {
      return;
    }
    onStart({ name: selectedRoute.name, stops, importedAt: new Date().toISOString() });
  };

  return (
    <div className="picker-screen">
      <header className="picker-header">
        {routes.length > 1 ? (
          <select className="text-input" value={routeId} onChange={(event) => handleRouteChange(event.target.value)}>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        ) : (
          <h1>{routes[0]?.name ?? 'Zákazníci'}</h1>
        )}
        {onBack && (
          <button className="header-button" type="button" onClick={onBack}>
            Zpět
          </button>
        )}
      </header>

      <input
        className="text-input"
        type="search"
        placeholder="Hledat zákazníka…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {errorMessage && <p className="login-error">{errorMessage}</p>}

      {isLoading ? (
        <p>Načítám zákazníky…</p>
      ) : (
        <ul className="customer-list">
          {filteredCustomers.length === 0 && <li className="customer-empty">Nic nenalezeno.</li>}
          {filteredCustomers.map((customer) => {
            const isSelected = selectedIds.has(customer.id);
            return (
              <li key={customer.id}>
                <label className={isSelected ? 'customer-item customer-item-selected' : 'customer-item'}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleCustomer(customer.id)} />
                  <span className="customer-order">{customer.order}</span>
                  <span>{customer.title}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <div className="picker-footer">
        <button className="primary-button" type="button" disabled={selectedIds.size === 0} onClick={handleStart}>
          Sestavit trasu ({selectedIds.size})
        </button>
        <div className="picker-secondary">
          <button className="secondary-button" type="button" onClick={onImportText}>
            Vložit z textu
          </button>
          <button className="secondary-button" type="button" onClick={() => void supabase.auth.signOut()}>
            Odhlásit
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerPicker;