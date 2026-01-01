import type { Route } from '../lib/gtfs';
import { Search, Map as MapIcon, ChevronRight, PanelLeftClose, Instagram, Linkedin, Download, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  routes: Route[];
  onSelectRoute: (route: Route) => void;
  selectedRouteId?: string;
  routeStopIndex: Record<string, string>;
  onToggleCollapse?: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export default function Sidebar({ routes, onSelectRoute, selectedRouteId, routeStopIndex, onToggleCollapse, isDarkMode, toggleDarkMode }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

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
    <div className={`flex flex-col h-full border-r w-full shadow-2xl transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      {/* Header Section */}
      <div className={`p-6 text-white shrink-0 relative transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-r from-slate-800 to-slate-900' : 'bg-gradient-to-r from-blue-700 to-indigo-800'}`}>
        
        {/* Controls: Collapse & Dark Mode */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
            {toggleDarkMode && (
                <button 
                    onClick={toggleDarkMode}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm text-blue-100 transition-colors"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            )}
            <button 
                onClick={onToggleCollapse}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm text-blue-100 transition-colors hidden md:block"
                title="Collapse Sidebar"
            >
                <PanelLeftClose size={18} />
            </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <MapIcon className="w-6 h-6 text-blue-100" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight">Kadamba Transport</h1>
                    {deferredPrompt && (
                        <button 
                            onClick={handleInstallClick}
                            className="bg-white/20 hover:bg-white/30 text-white p-1 rounded-md transition-colors animate-pulse"
                            title="Install App"
                        >
                            <Download size={14} />
                        </button>
                    )}
                </div>
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
            className={`w-full pl-11 pr-4 py-3 border rounded-xl text-white placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all backdrop-blur-md shadow-sm
                ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-white/10 border-white/20'}
            `}
          />
          <Search className="absolute left-3.5 top-3.5 text-blue-200/70 w-5 h-5 group-focus-within:text-white transition-colors" />
        </div>
      </div>
      
      {/* Route List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
        {filteredRoutes.length === 0 ? (
            <div className={`text-center py-10 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
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
                        ? (isDarkMode ? 'bg-slate-800 border-blue-500/50 shadow-md ring-1 ring-blue-500/20' : 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20')
                        : (isDarkMode ? 'bg-slate-800/50 border-slate-700 shadow-sm hover:border-slate-600 hover:bg-slate-800' : 'bg-white border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md')
                    }`}
                >
                    {/* Active Indicator Strip */}
                    {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                    )}

                    <div className="flex justify-between items-start mb-2 pl-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${
                            isSelected 
                                ? (isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700')
                                : (isDarkMode ? 'bg-slate-700 text-slate-300 group-hover:bg-blue-900/30 group-hover:text-blue-300' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600')
                        }`}>
                            {route.route_short_name}
                        </span>
                        {isSelected && <ChevronRight className="w-4 h-4 text-blue-500" />}
                    </div>
                    
                    <div className="pl-2">
                        <h3 className={`font-semibold text-sm leading-snug ${
                            isSelected 
                                ? (isDarkMode ? 'text-blue-200' : 'text-blue-900')
                                : (isDarkMode ? 'text-slate-300 group-hover:text-blue-300' : 'text-slate-700 group-hover:text-blue-800')
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
      <div className={`p-4 border-t flex flex-col items-center gap-1 shrink-0 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>Made with</span>
            <span className="text-red-500 animate-pulse text-sm">❤️</span>
            <span>by Ashish</span>
            <span className={`mx-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>|</span>
            <div className="flex items-center gap-2">
                <a 
                    href="https://www.linkedin.com/in/ashishgaude/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                    title="LinkedIn"
                >
                    <Linkedin size={14} />
                </a>
                <a 
                    href="https://www.instagram.com/ashishgaude.ig/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`transition-colors ${isDarkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-800'}`}
                    title="Instagram"
                >
                    <Instagram size={14} />
                </a>
            </div>
            <span className={`mx-0.5 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>,</span>
            <span>Goa</span>
        </div>
        <div className={`text-[10px] uppercase tracking-widest font-bold ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>
            {filteredRoutes.length} Routes Available
        </div>
      </div>
    </div>
  );
}
