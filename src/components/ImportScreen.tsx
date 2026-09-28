import { useMemo, useState } from 'react';
import { parseRouteText } from '../utils/parseRouteText';
import type { ParsedRoute } from '../utils/parseRouteText';

type ImportScreenProps = {
  onImport: (route: ParsedRoute) => void;
  onCancel?: () => void;
};

function ImportScreen({ onImport, onCancel }: ImportScreenProps) {
  const [text, setText] = useState('');
  const parsed = useMemo(() => parseRouteText(text), [text]);
  const stopCount = parsed.stops.length;

  return (
    <div className="import-screen">
      <h1>Import trasy</h1>
      <p>Vlož text trasy od stálého řidiče. Pod každým zákazníkem musí být souřadnice v závorce.</p>
      <textarea
        className="import-textarea"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={'Trasa 7\n\nZákazník - poznámka\n(50.1016643, 14.5055034)'}
      />
      {text.trim() && (
        <div className="import-summary">
          <strong>
            {parsed.name}: počet zastávek {stopCount}
          </strong>
          {parsed.warnings.length > 0 && (
            <ul className="import-warnings">
              {parsed.warnings.map((warning, index) => (
                <li key={`${index}-${warning}`}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button className="primary-button" type="button" disabled={stopCount === 0} onClick={() => onImport(parsed)}>
        Uložit trasu
      </button>
      {onCancel && (
        <button className="secondary-button" type="button" onClick={onCancel}>
          Zpět na mapu
        </button>
      )}
    </div>
  );
}

export default ImportScreen;