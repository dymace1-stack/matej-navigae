import StopsMap from './components/StopsMap';
import { testPoints } from './data/testPoints';

function App() {
  return (
    <div className="app">
      <header className="app-header">Matěj – rozvoz</header>
      <StopsMap points={testPoints} />
    </div>
  );
}

export default App;
