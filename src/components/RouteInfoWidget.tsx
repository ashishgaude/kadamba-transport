import type { Route, Stop } from '../lib/gtfs';
import { Clock } from 'lucide-react';

interface RouteInfoWidgetProps {
  route: Route;
  stops: (Stop & { arrival_time?: string })[];
  selectedStop: (Stop & { arrival_time?: string }) | null;
  isDarkMode?: boolean;
}

export default function RouteInfoWidget({ route, stops, selectedStop, isDarkMode }: RouteInfoWidgetProps) {
  if (stops.length === 0) return null;

  const startStop = stops[0];
  const endStop = stops[stops.length - 1];

  return (
    <div className="absolute top-4 left-16 right-4 md:left-auto md:right-6 md:w-96 z-[1000] pointer-events-none flex flex-col gap-2">
      
      {/* Main Route Card */}
      <div className={`backdrop-blur-md p-4 rounded-2xl shadow-xl border pointer-events-auto transition-all animate-in slide-in-from-top-4
        ${isDarkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-white/50'}
      `}>
        
        {/* Route Name Header */}
        <div className={`mb-3 border-b pb-2 ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <h3 className={`font-bold text-sm md:text-base leading-tight ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                {route.route_short_name}
            </h3>
            <p className={`text-xs truncate mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{route.route_long_name}</p>
        </div>

        {/* Start / End Grid */}
        <div className="flex flex-col gap-3 relative">
            {/* Connecting Line */}
            <div className={`absolute left-[5px] top-2 bottom-2 w-0.5 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}></div>

            {/* Start */}
            <div className="flex items-start gap-3 relative">
                <div className={`w-3 h-3 rounded-full bg-green-500 border-2 shadow-sm shrink-0 mt-1 relative z-10 ${isDarkMode ? 'border-slate-800' : 'border-white'}`}></div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Start</span>
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-gray-800'}`}>{startStop.arrival_time || '--:--'}</span>
                    </div>
                    <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`} title={startStop.stop_name}>{startStop.stop_name}</p>
                </div>
            </div>

            {/* End */}
            <div className="flex items-start gap-3 relative">
                <div className={`w-3 h-3 rounded-full bg-red-500 border-2 shadow-sm shrink-0 mt-1 relative z-10 ${isDarkMode ? 'border-slate-800' : 'border-white'}`}></div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">End</span>
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-gray-50 text-gray-800'}`}>{endStop.arrival_time || '--:--'}</span>
                    </div>
                    <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`} title={endStop.stop_name}>{endStop.stop_name}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Selected Stop Highlight Widget */}
      {selectedStop && (
         <div className="bg-blue-600/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-blue-500/50 pointer-events-auto text-white animate-in slide-in-from-top-2 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg shrink-0">
                <Clock size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider">Selected Stop</span>
                    <span className="text-sm font-mono font-bold">{selectedStop.arrival_time}</span>
                </div>
                <p className="text-sm font-medium truncate leading-tight">{selectedStop.stop_name}</p>
            </div>
         </div>
      )}

    </div>
  );
}
