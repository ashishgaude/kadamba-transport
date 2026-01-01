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
