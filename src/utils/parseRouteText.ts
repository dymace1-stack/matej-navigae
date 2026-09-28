import type { GpsPoint } from '../types/gpsPoint';

export type ParsedRoute = {
  name: string;
  stops: GpsPoint[];
  warnings: string[];
};

const coordinatePattern = /\(\s*(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*\)/g;
const routeNamePattern = /^\s*trasa\b.*$/im;
const titleSeparatorPattern = /\s*[-–]\s+/;

const isValidCoordinate = (latitude: number, longitude: number) =>
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  Math.abs(latitude) <= 90 &&
  Math.abs(longitude) <= 180;

const splitTitleAndNote = (description: string) => {
  const lines = description
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const [firstLine = '', ...restLines] = lines;
  const separator = firstLine.match(titleSeparatorPattern);

  if (!separator || separator.index === undefined) {
    return { title: firstLine, note: restLines.join('\n') };
  }

  const title = firstLine.slice(0, separator.index).trim();
  const firstNoteLine = firstLine.slice(separator.index + separator[0].length).trim();
  const note = [firstNoteLine, ...restLines].filter(Boolean).join('\n');

  return { title, note };
};

export const parseRouteText = (input: string): ParsedRoute => {
  const text = input.replace(/\r\n/g, '\n');
  const nameMatch = text.match(routeNamePattern);
  const name = nameMatch ? nameMatch[0].trim() : 'Trasa';
  const body = nameMatch ? text.replace(nameMatch[0], '') : text;

  const stops: GpsPoint[] = [];
  const warnings: string[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(coordinatePattern)) {
    const matchIndex = match.index ?? 0;
    // Čárky a mezery mezi dvěma souřadnicemi znamenají druhou souřadnici téhož záznamu
    const description = body.slice(lastIndex, matchIndex).replace(/^[\s,]+|[\s,]+$/g, '');
    lastIndex = matchIndex + match[0].length;

    const latitude = Number(match[1]);
    const longitude = Number(match[2]);

    if (!isValidCoordinate(latitude, longitude)) {
      warnings.push(`Neplatné souřadnice ${match[0]} byly přeskočeny.`);
      continue;
    }

    if (!description) {
      const previousStop = stops.at(-1);
      if (previousStop) {
        warnings.push(`${previousStop.title}: záznam má více souřadnic, použita je první.`);
      }
      continue;
    }

    const { title, note } = splitTitleAndNote(description);
    stops.push({
      id: `stop-${stops.length + 1}`,
      latitude,
      longitude,
      title: title || `Zastávka ${stops.length + 1}`,
      note: note || undefined,
      order: stops.length + 1,
    });
  }

  const trailingText = body.slice(lastIndex).trim();
  if (trailingText) {
    warnings.push(`Text na konci nemá souřadnice a nebyl načten: „${trailingText.slice(0, 60)}“`);
  }

  return { name, stops, warnings };
};