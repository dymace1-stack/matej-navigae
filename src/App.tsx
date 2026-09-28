import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import ImportScreen from './components/ImportScreen';
import LoginScreen from './components/LoginScreen';
import RouteView from './components/RouteView';
import { supabase } from './lib/supabase';
import type { ParsedRoute } from './utils/parseRouteText';
import { loadRoute, saveRoute } from './utils/routeStorage';
import type { StoredRoute } from './utils/routeStorage';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [route, setRoute] = useState<StoredRoute | null>(() => loadRoute());
  const [isImporting, setIsImporting] = useState(false);

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

  if (!route || isImporting) {
    return <ImportScreen onImport={handleImport} onCancel={route ? handleCancelImport : undefined} />;
  }

  return <RouteView key={route.importedAt} route={route} onChangeRoute={handleChangeRoute} />;
}

export default App;