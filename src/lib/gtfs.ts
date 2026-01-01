import Papa from 'papaparse';

export interface Route {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: string;
  route_color?: string;
  route_text_color?: string;
}

export interface Stop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  location_type?: string;
}

export interface Trip {
  trip_id: string;
  route_id: string;
  service_id: string;
  trip_headsign: string;
  direction_id?: string;
  shape_id?: string;
}

export interface Shape {
  shape_id: string;
  shape_pt_lat: number;
  shape_pt_lon: number;
  shape_pt_sequence: number;
}

export interface StopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: number;
}

export interface GTFSData {
  routes: Route[];
  stops: Stop[];
  trips: Trip[];
  stopTimes: StopTime[];
  shapes: Record<string, Shape[]>; // Grouped by shape_id
}

const parseCSV = <T>(file: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    // Use Vite's BASE_URL to correctly resolve the path in any hosting environment
    // import.meta.env.BASE_URL is set in vite.config.ts (currently './')
    const baseUrl = import.meta.env.BASE_URL;
    // Ensure we don't have double slashes if base ends with / and we add gtfs/
    const path = `${baseUrl}gtfs/${file}`;
    
    Papa.parse(path, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const fetchGtfsData = async (): Promise<GTFSData> => {
  try {
    const [routes, stops, trips, stopTimes, shapesRaw] = await Promise.all([
      parseCSV<Route>('routes.txt'),
      parseCSV<Stop>('stops.txt'),
      parseCSV<Trip>('trips.txt'),
      parseCSV<StopTime>('stop_times.txt'),
      parseCSV<Shape>('shapes.txt'),
    ]);

    // Group shapes by shape_id for easier plotting
    const shapes: Record<string, Shape[]> = {};
    if (shapesRaw) {
        shapesRaw.forEach((s) => {
        if (!shapes[s.shape_id]) {
            shapes[s.shape_id] = [];
        }
        shapes[s.shape_id].push(s);
        });
        
        // Sort each shape by sequence
        Object.values(shapes).forEach(shapePoints => {
            shapePoints.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
        });
    }

    return { routes, stops, trips, stopTimes, shapes };
  } catch (error) {
    console.error("Error loading GTFS data:", error);
    throw error;
  }
};

// Helper to convert HH:MM:SS to seconds
export const timeToSeconds = (time: string): number => {
  const [h, m, s] = time.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};

// Helper to convert seconds to HH:MM:SS (GTFS format)
export const secondsToTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// Helper to convert HH:MM:SS to HH:MM AM/PM for display
export const formatToAmPm = (time: string): string => {
  if (!time) return '--:--';
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${ampm}`;
};

// Function to interpolate missing times
export const interpolateStopTimes = (stopTimes: StopTime[]): StopTime[] => {
  const filled = stopTimes.map(st => ({...st})); // Deep copy
  let lastKnownIndex = 0;

  for (let i = 0; i < filled.length; i++) {
    if (filled[i].arrival_time) {
      if (i > lastKnownIndex + 1) {
        // We found a gap between lastKnownIndex and i
        const startSec = timeToSeconds(filled[lastKnownIndex].arrival_time!);
        const endSec = timeToSeconds(filled[i].arrival_time!);
        const duration = endSec - startSec;
        const steps = i - lastKnownIndex;
        const stepSize = duration / steps;

        for (let j = 1; j < steps; j++) {
          const interpolatedSec = startSec + (stepSize * j);
          filled[lastKnownIndex + j].arrival_time = secondsToTime(interpolatedSec);
          filled[lastKnownIndex + j].departure_time = secondsToTime(interpolatedSec);
        }
      }
      lastKnownIndex = i;
    }
  }
  return filled;
};
