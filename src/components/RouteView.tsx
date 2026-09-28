import { useCallback, useMemo, useState } from 'react';
import CurrentStopPanel from './CurrentStopPanel';
import StopsMap from './StopsMap';
import type { GpsPoint } from '../types/gpsPoint';
import { loadProgress, saveProgress } from '../utils/routeStorage';
import type { StoredRoute } from '../utils/routeStorage';

type RouteViewProps = {
  route: StoredRoute;
  onChangeRoute: () => void;
};

// Hledá od zadané pozice dál a pak od začátku, aby se našly i dříve přeskočené zastávky
const findNextUndelivered = (stops: GpsPoint[], delivered: ReadonlySet<string>, fromIndex: number) => {
  for (let offset = 0; offset < stops.length; offset += 1) {
    const index = (fromIndex + offset) % stops.length;
    if (!delivered.has(stops[index].id)) {
      return index;
    }
  }
  return -1;
};

function RouteView({ route, onChangeRoute }: RouteViewProps) {
  const { name, stops, importedAt } = route;
  const [deliveredIds, setDeliveredIds] = useState<string[]>(() => loadProgress(importedAt));
  const deliveredSet = useMemo(() => new Set(deliveredIds), [deliveredIds]);
  const [currentIndex, setCurrentIndex] = useState(() => Math.max(findNextUndelivered(stops, deliveredSet, 0), 0));

  const currentStop: GpsPoint | undefined = stops[currentIndex];

  const handleSelect = useCallback((index: number) => setCurrentIndex(index), []);

  const handlePrevious = useCallback(
    () => setCurrentIndex((index) => (index - 1 + stops.length) % stops.length),
    [stops.length],
  );

  const handleNext = useCallback(() => setCurrentIndex((index) => (index + 1) % stops.length), [stops.length]);

  const handleToggleDelivered = useCallback(() => {
    if (!currentStop) {
      return;
    }

    const wasDelivered = deliveredSet.has(currentStop.id);
    const nextDeliveredIds = wasDelivered
      ? deliveredIds.filter((id) => id !== currentStop.id)
      : [...deliveredIds, currentStop.id];

    setDeliveredIds(nextDeliveredIds);
    saveProgress(importedAt, nextDeliveredIds);

    if (!wasDelivered) {
      const nextIndex = findNextUndelivered(stops, new Set(nextDeliveredIds), currentIndex + 1);
      if (nextIndex !== -1) {
        setCurrentIndex(nextIndex);
      }
    }
  }, [currentStop, currentIndex, deliveredIds, deliveredSet, importedAt, stops]);

  return (
    <div className="app">
      <header className="app-header">
        <span>{name}</span>
        <button className="header-button" type="button" onClick={onChangeRoute}>
          Změnit trasu
        </button>
      </header>
      <StopsMap points={stops} currentId={currentStop?.id} deliveredIds={deliveredSet} onSelect={handleSelect} />
      {currentStop ? (
        <CurrentStopPanel
          stop={currentStop}
          position={currentIndex + 1}
          total={stops.length}
          deliveredCount={deliveredIds.length}
          isDelivered={deliveredSet.has(currentStop.id)}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToggleDelivered={handleToggleDelivered}
        />
      ) : (
        <section className="stop-panel">Trasa neobsahuje žádné zastávky.</section>
      )}
    </div>
  );
}

export default RouteView;