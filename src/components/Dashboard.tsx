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
    <div className="absolute top-4 left-4 right-4 z-[500] pointer-events-none mt-16 md:mt-0 flex justify-center">
       {/* Container for Cards */}
       <div className="flex flex-col md:flex-row gap-3 md:gap-6 mb-4 pointer-events-auto w-full max-w-5xl px-2 md:px-0">
         
         <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4 flex-1 transition-transform hover:scale-[1.02]">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <Bus size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Routes</p>
              <p className="text-3xl font-bold text-slate-800">{totalRoutes}</p>
            </div>
         </div>

         <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4 flex-1 transition-transform hover:scale-[1.02]">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-500/30">
                <MapPin size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bus Stops</p>
              <p className="text-3xl font-bold text-slate-800">{totalStops}</p>
            </div>
         </div>

         <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4 flex-1 transition-transform hover:scale-[1.02]">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl text-white shadow-lg shadow-violet-500/30">
                <Navigation size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Trips</p>
              <p className="text-3xl font-bold text-slate-800">{totalTrips}</p>
            </div>
         </div>

       </div>
    </div>
  );
}
