import { useCallback, useState } from 'react';
import ImportScreen from './components/ImportScreen';
import StopsMap from './components/StopsMap';
import type { ParsedRoute } from './utils/parseRouteText';
import { loadRoute, saveRoute } from './utils/routeStorage';
import type { StoredRoute } from './utils/routeStorage';

function App() {
  const [route, setRoute] = useState<StoredRoute | null>(() => loadRoute());
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = useCallback((parsed: ParsedRoute) => {
    const newRoute: StoredRoute = {
      name: parsed.name,
      stops: parsed.stops,
      importedAt: new Date().toISOString(),
    };

    if (!saveRoute(newRoute)) {
      window.alert('Trasu se nepodařilo uložit do telefonu. Zůstane načtená jen do zavření aplikace.');
    }

    setRoute(newRoute);
    setIsImporting(false);
  }, []);

  const handleCancelImport = useCallback(() => setIsImporting(false), []);

  if (!route || isImporting) {
    return <ImportScreen onImport={handleImport} onCancel={route ? handleCancelImport : undefined} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <span>{route.name}</span>
        <button className="header-button" type="button" onClick={() => setIsImporting(true)}>
          Změnit trasu
        </button>
      </header>
      <StopsMap points={route.stops} />
    </div>
  );
}

export default App;