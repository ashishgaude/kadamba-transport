import type { Route } from '../lib/gtfs';
import { Search, Map as MapIcon, ChevronRight, PanelLeftClose } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  routes: Route[];
  onSelectRoute: (route: Route) => void;
  selectedRouteId?: string;
  routeStopIndex: Record<string, string>;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ routes, onSelectRoute, selectedRouteId, routeStopIndex, onToggleCollapse }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoutes = routes.filter(route => {
    const searchLower = searchTerm.toLowerCase();
    const routeStops = routeStopIndex[route.route_id] || '';
    
    return (
      route.route_short_name.toLowerCase().includes(searchLower) ||
      route.route_long_name.toLowerCase().includes(searchLower) ||
      routeStops.includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-full shadow-2xl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white shrink-0 relative">
        {/* Desktop Collapse Button */}
        <button 
            onClick={onToggleCollapse}
            className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm text-blue-100 transition-colors hidden md:block"
            title="Collapse Sidebar"
        >
            <PanelLeftClose size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <MapIcon className="w-6 h-6 text-blue-100" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">Kadamba Transport</h1>
                <p className="text-blue-200 text-xs uppercase tracking-wider font-medium">Goa State Bus Network</p>
            </div>
        </div>

        {/* Search Input */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Search routes or stops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all backdrop-blur-md shadow-sm"
          />
          <Search className="absolute left-3.5 top-3.5 text-blue-200/70 w-5 h-5 group-focus-within:text-white transition-colors" />
        </div>
      </div>
      
      {/* Route List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filteredRoutes.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
                <p>No routes found.</p>
            </div>
        ) : (
            filteredRoutes.map(route => {
              const isSelected = selectedRouteId === route.route_id;
              return (
                <button
                    key={route.route_id}
                    onClick={() => onSelectRoute(route)}
                    className={`group w-full text-left p-4 rounded-xl border transition-all duration-200 ease-in-out relative overflow-hidden ${
                    isSelected 
                        ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20' 
                        : 'bg-white border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md'
                    }`}
                >
                    {/* Active Indicator Strip */}
                    {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                    )}

                    <div className="flex justify-between items-start mb-2 pl-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${
                            isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                        }`}>
                            {route.route_short_name}
                        </span>
                        {isSelected && <ChevronRight className="w-4 h-4 text-blue-500" />}
                    </div>
                    
                    <div className="pl-2">
                        <h3 className={`font-semibold text-sm leading-snug ${
                            isSelected ? 'text-blue-900' : 'text-slate-700 group-hover:text-blue-800'
                        }`}>
                            {route.route_long_name}
                        </h3>
                    </div>
                </button>
            )
            })
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
        {filteredRoutes.length} Routes Available
      </div>
    </div>
  );
}
