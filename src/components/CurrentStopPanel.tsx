import { memo } from 'react';
import type { GpsPoint } from '../types/gpsPoint';
import { getGoogleMapsUrl, getWazeUrl } from '../utils/navigationLinks';

type CurrentStopPanelProps = {
  stop: GpsPoint;
  position: number;
  total: number;
  deliveredCount: number;
  isDelivered: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggleDelivered: () => void;
};

function CurrentStopPanel({
  stop,
  position,
  total,
  deliveredCount,
  isDelivered,
  onPrevious,
  onNext,
  onToggleDelivered,
}: CurrentStopPanelProps) {
  const isRouteDone = total > 0 && deliveredCount >= total;

  return (
    <section className="stop-panel">
      <div className="stop-panel-status">
        <span>
          Zastávka {position} / {total}
        </span>
        <span>
          Doručeno {deliveredCount} / {total}
        </span>
      </div>
      {isRouteDone && <div className="route-done">Trasa je hotová 🎉</div>}
      <div className="stop-panel-heading">
        <button className="arrow-button" type="button" onClick={onPrevious} aria-label="Předchozí zastávka">
          ‹
        </button>
        <h2 className={isDelivered ? 'stop-title stop-title-delivered' : 'stop-title'}>{stop.title ?? 'Zastávka'}</h2>
        <button className="arrow-button" type="button" onClick={onNext} aria-label="Další zastávka">
          ›
        </button>
      </div>
      {stop.note && <p className="stop-panel-note">{stop.note}</p>}
      <div className="stop-panel-actions">
        <a className="nav-button" href={getGoogleMapsUrl(stop)} target="_blank" rel="noopener noreferrer">
          Google Maps
        </a>
        <a className="nav-button nav-button-waze" href={getWazeUrl(stop)} target="_blank" rel="noopener noreferrer">
          Waze
        </a>
      </div>
      <button
        className={isDelivered ? 'deliver-button deliver-button-undo' : 'deliver-button'}
        type="button"
        onClick={onToggleDelivered}
      >
        {isDelivered ? 'Vrátit: nedoručeno' : 'Doručeno ✓'}
      </button>
    </section>
  );
}

export default memo(CurrentStopPanel);