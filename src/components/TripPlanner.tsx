import { useState, useMemo } from 'react';
import { Search, ArrowRight, Bus } from 'lucide-react';
import { type Route, type Stop, type StopTime, type Trip, interpolateStopTimes, formatToAmPm } from '../lib/gtfs';

interface TripPlannerProps {
  stops: Stop[];
  stopTimes: StopTime[];
  trips: Trip[];
  routes: Route[];
  onSelectTrip: (route: Route, tripId: string) => void;
  isDarkMode?: boolean;
}

export default function TripPlanner({ stops, stopTimes, trips, routes, onSelectTrip, isDarkMode }: TripPlannerProps) {
  const [startSearch, setStartSearch] = useState('');
  const [endSearch, setEndSearch] = useState('');
  const [startStop, setStartStop] = useState<Stop | null>(null);
  const [endStop, setEndStop] = useState<Stop | null>(null);
  const [results, setResults] = useState<{ route: Route, trip: Trip, startTime: string, endTime: string }[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Filter stops for autocomplete
  const filteredStartStops = useMemo(() => {
    if (!startSearch || startStop) return [];
    return stops.filter(s => s.stop_name.toLowerCase().includes(startSearch.toLowerCase())).slice(0, 5);
  }, [startSearch, stops, startStop]);

  const filteredEndStops = useMemo(() => {
    if (!endSearch || endStop) return [];
    return stops.filter(s => s.stop_name.toLowerCase().includes(endSearch.toLowerCase())).slice(0, 5);
  }, [endSearch, stops, endStop]);

  const handleSearch = () => {
    if (!startStop || !endStop) return;
    setIsSearching(true);

    // Give UI a moment to update
    setTimeout(() => {
      const foundTrips = findDirectTrips(startStop.stop_id, endStop.stop_id);
      setResults(foundTrips);
      setIsSearching(false);
    }, 10);
  };

  const findDirectTrips = (startId: string, endId: string) => {
    // Helper to find all stop IDs with the same name
    const startName = stops.find(s => s.stop_id === startId)?.stop_name.toLowerCase();
    const endName = stops.find(s => s.stop_id === endId)?.stop_name.toLowerCase();

    if (!startName || !endName) return [];

    const startIds = new Set(stops.filter(s => s.stop_name.toLowerCase() === startName).map(s => s.stop_id));
    const endIds = new Set(stops.filter(s => s.stop_name.toLowerCase() === endName).map(s => s.stop_id));

    // 1. Get all stop_times for ANY start stop ID
    const starts = stopTimes.filter(st => startIds.has(st.stop_id));
    // 2. We will look up ends on demand to save filtering full list

    const matches: { route: Route, trip: Trip, startTime: string, endTime: string }[] = [];
    const addedTrips = new Set<string>();

    // Iterate through all trips (via starts)
    for (const start of starts) {
        if (addedTrips.has(start.trip_id)) continue;

        // Find if this trip also visits an end stop AFTER the start stop
        // We need to look up the full sequence for this trip to check end stop and interpolate
        const tripStopTimes = stopTimes
            .filter(st => st.trip_id === start.trip_id)
            .sort((a, b) => a.stop_sequence - b.stop_sequence);

        const end = tripStopTimes.find(st => endIds.has(st.stop_id) && st.stop_sequence > start.stop_sequence);

        if (end) {
            // Found a valid path!
            // Interpolate times for this trip to get accurate start/end times
            const interpolatedTrip = interpolateStopTimes(tripStopTimes);
            
            // Re-find start and end in the interpolated list
            const finalStart = interpolatedTrip.find(st => st.stop_id === start.stop_id);
            const finalEnd = interpolatedTrip.find(st => st.stop_id === end.stop_id);

            const trip = trips.find(t => t.trip_id === start.trip_id);
            if (trip && finalStart && finalEnd) {
                const route = routes.find(r => r.route_id === trip.route_id);
                if (route) {
                    matches.push({
                        route,
                        trip,
                        startTime: finalStart.arrival_time || '00:00:00',
                        endTime: finalEnd.arrival_time || '00:00:00'
                    });
                    addedTrips.add(trip.trip_id);
                }
            }
        }
    }

    // Sort by start time
    return matches.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="flex flex-col h-full">
        {/* Search Inputs */}
        <div className="flex flex-col gap-4 p-1">
            
            {/* FROM Input */}
            <div className="relative z-20">
                <div className={`flex items-center border rounded-xl px-3 py-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-3 shrink-0"></div>
                    <input 
                        type="text" 
                        placeholder="From (Start Stop)"
                        className={`w-full bg-transparent outline-none text-sm ${isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
                        value={startSearch}
                        onChange={e => { setStartSearch(e.target.value); setStartStop(null); }}
                    />
                    {startStop && <button onClick={() => {setStartSearch(''); setStartStop(null);}} className="text-slate-400 hover:text-slate-600"><Search size={14}/></button>}
                </div>
                {/* Suggestions */}
                {filteredStartStops.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl border overflow-hidden z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                        {filteredStartStops.map(s => (
                            <button 
                                key={s.stop_id}
                                onClick={() => { setStartStop(s); setStartSearch(s.stop_name); }}
                                className={`w-full text-left px-4 py-3 text-sm border-b last:border-0 hover:bg-opacity-50 transition-colors ${isDarkMode ? 'border-slate-700 text-slate-200 hover:bg-slate-700' : 'border-slate-50 text-slate-700 hover:bg-slate-50'}`}
                            >
                                {s.stop_name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* TO Input */}
            <div className="relative z-10">
                <div className={`flex items-center border rounded-xl px-3 py-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-3 shrink-0"></div>
                    <input 
                        type="text" 
                        placeholder="To (End Stop)"
                        className={`w-full bg-transparent outline-none text-sm ${isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
                        value={endSearch}
                        onChange={e => { setEndSearch(e.target.value); setEndStop(null); }}
                    />
                </div>
                {/* Suggestions */}
                {filteredEndStops.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl border overflow-hidden z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                        {filteredEndStops.map(s => (
                            <button 
                                key={s.stop_id}
                                onClick={() => { setEndStop(s); setEndSearch(s.stop_name); }}
                                className={`w-full text-left px-4 py-3 text-sm border-b last:border-0 hover:bg-opacity-50 transition-colors ${isDarkMode ? 'border-slate-700 text-slate-200 hover:bg-slate-700' : 'border-slate-50 text-slate-700 hover:bg-slate-50'}`}
                            >
                                {s.stop_name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button 
                onClick={handleSearch}
                disabled={!startStop || !endStop || isSearching}
                className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
                    ${!startStop || !endStop 
                        ? (isDarkMode ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed')
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'}
                `}
            >
                {isSearching ? 'Searching...' : 'Find Buses'}
                {!isSearching && <ArrowRight size={18} />}
            </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-3 px-1 custom-scrollbar pb-20">
            {results && results.length === 0 && (
                <div className={`text-center py-8 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Bus size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No direct buses found.</p>
                </div>
            )}

            {results && results.map((res, idx) => (
                <div 
                    key={idx}
                    onClick={() => onSelectTrip(res.route, res.trip.trip_id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md active:scale-[0.98]
                        ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300'}
                    `}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                            {res.route.route_short_name}
                        </span>
                        <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span>{formatToAmPm(res.startTime)}</span>
                            <ArrowRight size={12} className="text-slate-400" />
                            <span>{formatToAmPm(res.endTime)}</span>
                        </div>
                    </div>
                    <div className={`text-sm truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {res.route.route_long_name}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}