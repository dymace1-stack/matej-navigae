import { useCallback, useState } from 'react';
import ImportScreen from './components/ImportScreen';
import RouteView from './components/RouteView';
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
  const handleChangeRoute = useCallback(() => setIsImporting(true), []);

  if (!route || isImporting) {
    return <ImportScreen onImport={handleImport} onCancel={route ? handleCancelImport : undefined} />;
  }

  return <RouteView key={route.importedAt} route={route} onChangeRoute={handleChangeRoute} />;
}

export default App;