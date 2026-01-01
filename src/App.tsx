import { useState, useEffect, useMemo } from 'react';
import { fetchGtfsData, type GTFSData, type Route, type Shape, type Stop, type StopTime } from './lib/gtfs';
import LeafletMap from './components/Map';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DonationWidget from './components/DonationWidget';
import LoadingScreen from './components/LoadingScreen';
import RouteInfoWidget from './components/RouteInfoWidget';
import { Menu, X } from 'lucide-react';

// Helper to convert seconds to HH:MM:SS (GTFS format)
const secondsToTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// Helper to convert HH:MM:SS to HH:MM AM/PM for display
const formatToAmPm = (time: string): string => {
  if (!time) return '';
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${ampm}`;
};

// Function to interpolate missing times
const interpolateStopTimes = (stopTimes: StopTime[]): StopTime[] => {
  const filled = [...stopTimes];
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
        }
      }
      lastKnownIndex = i;
    }
  }
  return filled;
};

// Helper to convert HH:MM:SS to seconds
const timeToSeconds = (time: string): number => {
  const [h, m, s] = time.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};

function App() {
  const [data, setData] = useState<GTFSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedShape, setSelectedShape] = useState<Shape[] | null>(null);
  const [routeStops, setRouteStops] = useState<(Stop & { arrival_time?: string })[]>([]);
  const [selectedStop, setSelectedStop] = useState<(Stop & { arrival_time?: string }) | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  useEffect(() => {
    fetchGtfsData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Handle URL params on data load
  useEffect(() => {
      if (!data) return;
      const params = new URLSearchParams(window.location.search);
      const routeId = params.get('route');
      if (routeId) {
          const route = data.routes.find(r => r.route_id === routeId);
          if (route) setSelectedRoute(route);
      }
  }, [data]);

  // Update URL on route selection
  useEffect(() => {
      if (selectedRoute) {
          const url = new URL(window.location.href);
          if (url.searchParams.get('route') !== selectedRoute.route_id) {
             url.searchParams.set('route', selectedRoute.route_id);
             window.history.pushState({}, '', url);
          }
          // Close sidebar on mobile when route is selected
          setIsMobileSidebarOpen(false);
          // Reset selected stop
          setSelectedStop(null);
      }
  }, [selectedRoute]);

  // Build a search index for routes based on their stops
  const routeStopIndex = useMemo(() => {
    if (!data) return {};
    
    // 1. Map trip_id to route_id
    const tripToRoute = new Map<string, string>();
    data.trips.forEach(t => tripToRoute.set(t.trip_id, t.route_id));

    // 2. Map stop_id to stop_name
    const stopIdToName = new Map<string, string>();
    data.stops.forEach(s => stopIdToName.set(s.stop_id, s.stop_name.toLowerCase()));

    // 3. Accumulate stop names per route
    const index: Record<string, Set<string>> = {};
    
    // We iterate through stopTimes to find which stops belong to which route
    data.stopTimes.forEach(st => {
        const routeId = tripToRoute.get(st.trip_id);
        const stopName = stopIdToName.get(st.stop_id);
        
        if (routeId && stopName) {
            if (!index[routeId]) {
                index[routeId] = new Set();
            }
            index[routeId].add(stopName);
        }
    });

    // 4. Convert Sets to joined strings for easy searching
    const stringIndex: Record<string, string> = {};
    for (const [routeId, stopSet] of Object.entries(index)) {
        stringIndex[routeId] = Array.from(stopSet).join(' ');
    }
    
    return stringIndex;
  }, [data]);

  // When a route is selected, find a representative trip, its shape, and its stops
  useEffect(() => {
    if (!data || !selectedRoute) {
        setSelectedShape(null);
        setRouteStops([]);
        return;
    }

    // 1. Find a trip for this route
    const trip = data.trips.find(t => t.route_id === selectedRoute.route_id);
    
    if (trip) {
        // Set Shape
        if (trip.shape_id && data.shapes[trip.shape_id]) {
            setSelectedShape(data.shapes[trip.shape_id]);
        } else {
            setSelectedShape(null);
        }

        // Set Stops for this trip
        // Filter stop_times for this trip_id
        const currentTripStopTimes = data.stopTimes
            .filter(st => st.trip_id === trip.trip_id)
            .sort((a, b) => a.stop_sequence - b.stop_sequence);
        
        // Interpolate missing times
        const interpolatedStopTimes = interpolateStopTimes(currentTripStopTimes);

        // Map stop_times to actual stop objects to preserve order and include timing
        const stopsForRoute = interpolatedStopTimes
            .map(st => {
              const stop = data.stops.find(s => s.stop_id === st.stop_id);
              // Format time for display
              const displayTime = st.arrival_time ? formatToAmPm(st.arrival_time) : undefined;
              return stop ? { ...stop, arrival_time: displayTime } : null;
            })
            .filter((s): s is (Stop & { arrival_time: string }) => !!s);
            
        setRouteStops(stopsForRoute);

    } else {
      setSelectedShape(null);
      setRouteStops([]);
    }
  }, [selectedRoute, data]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!data) return <div className="text-center p-10 text-red-500">Failed to load data.</div>;

  return (
    <div className="flex h-screen w-screen overflow-hidden relative bg-slate-100 font-sans">
      
      {/* Sidebar Container
          Mobile: Fixed drawer
          Desktop: Relative column with transitionable width
      */}
      <div 
        className={`fixed inset-y-0 left-0 z-[4000] w-full sm:w-96 bg-slate-50 shadow-2xl md:shadow-xl
                    transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:translate-x-0
                    ${isDesktopSidebarOpen ? 'md:w-96' : 'md:w-0 md:overflow-hidden'}
        `}
      >
        <div className="h-full relative flex flex-col min-w-[24rem]">
            {/* Close Button on Mobile */}
            <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full md:hidden hover:bg-white text-slate-600 shadow-sm z-10 transition-colors"
            >
                <X size={20} />
            </button>
            <Sidebar 
                routes={data.routes} 
                onSelectRoute={setSelectedRoute} 
                selectedRouteId={selectedRoute?.route_id}
                routeStopIndex={routeStopIndex}
                onToggleCollapse={() => setIsDesktopSidebarOpen(false)}
            />
        </div>
      </div>

      {/* Overlay to close sidebar when clicking outside on mobile */}
      {isMobileSidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[3900] md:hidden transition-opacity duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex-1 relative h-full w-full">
        {/* Toggle Button (Visible on Mobile OR when Desktop Sidebar is closed) */}
        <button 
            onClick={() => {
                if (window.innerWidth >= 768) {
                    setIsDesktopSidebarOpen(true);
                } else {
                    setIsMobileSidebarOpen(true);
                }
            }}
            className={`absolute top-4 left-4 z-[1000] p-3 bg-white rounded-xl shadow-lg hover:bg-slate-50 text-blue-600 border border-slate-100 transition-all active:scale-95
                ${/* Hide on desktop if sidebar is open */ ''}
                ${isDesktopSidebarOpen ? 'md:hidden' : 'md:flex'}
            `}
        >
            <Menu size={24} />
        </button>

        <LeafletMap 
            stops={routeStops.length > 0 ? routeStops : data.stops} 
            selectedShape={selectedShape}
            onStopClick={setSelectedStop}
        />
        
        {/* Route Info Widget (Overlay) */}
        {selectedRoute && (
            <RouteInfoWidget 
                route={selectedRoute} 
                stops={routeStops} 
                selectedStop={selectedStop} 
            />
        )}

        {!selectedRoute && (
          <Dashboard routes={data.routes} stops={data.stops} trips={data.trips} />
        )}
        
        {/* Donation Widget */}
        <DonationWidget />
      </div>
    </div>
  );
}

export default App;
