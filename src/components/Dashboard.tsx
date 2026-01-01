import type { Route, Stop, Trip } from '../lib/gtfs';
import { Bus, MapPin, Navigation } from 'lucide-react';

interface DashboardProps {
  routes: Route[];
  stops: Stop[];
  trips: Trip[];
}

export default function Dashboard({ routes, stops, trips }: DashboardProps) {
  
  // Calculate Stats
  const totalRoutes = routes.length;
  const totalStops = stops.length;
  const totalTrips = trips.length;

  return (
    <div className="absolute top-4 left-4 right-4 z-[500] pointer-events-none">
       {/* Container for Cards */}
       <div className="flex gap-4 mb-4 pointer-events-auto max-w-4xl">
         <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3 flex-1">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600"><Bus size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Total Routes</p>
              <p className="text-2xl font-bold">{totalRoutes}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3 flex-1">
            <div className="p-2 bg-green-100 rounded-full text-green-600"><MapPin size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Total Stops</p>
              <p className="text-2xl font-bold">{totalStops}</p>
            </div>
         </div>
         <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3 flex-1">
            <div className="p-2 bg-purple-100 rounded-full text-purple-600"><Navigation size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Total Trips</p>
              <p className="text-2xl font-bold">{totalTrips}</p>
            </div>
         </div>
       </div>

       {/* Charts only if we have space, maybe hidden on small screens or purely overlay */}
       {/* For now, keeping it simple with just stats cards overlaying the map. 
           Opening a full dashboard might be distracting from the main "Map" goal.
       */}
    </div>
  );
}
