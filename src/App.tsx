import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import CustomerPicker from './components/CustomerPicker';
import ImportScreen from './components/ImportScreen';
import LoginScreen from './components/LoginScreen';
import RouteView from './components/RouteView';
import { supabase } from './lib/supabase';
import type { ParsedRoute } from './utils/parseRouteText';
import { loadRoute, saveRoute } from './utils/routeStorage';
import type { StoredRoute } from './utils/routeStorage';

type Screen = 'picker' | 'import' | 'route';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [route, setRoute] = useState<StoredRoute | null>(() => loadRoute());
  const [screen, setScreen] = useState<Screen>(() => (route ? 'route' : 'picker'));

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setIsAuthLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const startRoute = useCallback((newRoute: StoredRoute) => {
    if (!saveRoute(newRoute)) {
      window.alert('Trasu se nepodařilo uložit do telefonu. Zůstane načtená jen do zavření aplikace.');
    }
    setRoute(newRoute);
    setScreen('route');
  }, []);

  const handleImport = useCallback(
    (parsed: ParsedRoute) => {
      startRoute({ name: parsed.name, stops: parsed.stops, importedAt: new Date().toISOString() });
    },
    [startRoute],
  );

  const showPicker = useCallback(() => setScreen('picker'), []);
  const showImport = useCallback(() => setScreen('import'), []);
  const showRoute = useCallback(() => setScreen('route'), []);

  if (isAuthLoading) {
    return (
      <div className="login-screen">
        <p>Načítám…</p>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (screen === 'import') {
    return <ImportScreen onImport={handleImport} onCancel={showPicker} />;
  }

  if (screen === 'route' && route) {
    return <RouteView key={route.importedAt} route={route} onChangeRoute={showPicker} />;
  }

  return <CustomerPicker onStart={startRoute} onImportText={showImport} onBack={route ? showRoute : undefined} />;
}

export default App;