import type { Route } from '../lib/gtfs';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  routes: Route[];
  onSelectRoute: (route: Route) => void;
  selectedRouteId?: string;
  routeStopIndex: Record<string, string>;
}

export default function Sidebar({ routes, onSelectRoute, selectedRouteId, routeStopIndex }: SidebarProps) {
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
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80 shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Kadamba Routes</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredRoutes.map(route => (
          <button
            key={route.route_id}
            onClick={() => onSelectRoute(route)}
            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              selectedRouteId === route.route_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="font-semibold text-gray-900">{route.route_short_name}</div>
            <div className="text-sm text-gray-500 truncate">{route.route_long_name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
