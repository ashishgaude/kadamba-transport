import { Loader2, Bus, MapPin, Navigation } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl animate-pulse duration-1000"></div>

      <div className="flex flex-col items-center z-10 p-8 max-w-sm w-full">
        {/* Animated Icon Container */}
        <div className="relative mb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/40 flex items-center justify-center relative animate-bounce duration-1000">
                <Bus className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            {/* Spinning Ring */}
            <div className="absolute -inset-4 border-2 border-blue-200 border-dashed rounded-full animate-[spin_10s_linear_infinite]"></div>
            
            {/* Pulsing Dots */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-ping"></div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Kadamba Transport</h2>
            <p className="text-slate-500 font-medium">Initializing Route Visualizer...</p>
        </div>

        {/* Progress Info */}
        <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1.5 block">Loading GTFS Assets</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={12} />
                    <span className="text-[10px] font-semibold">STOPS</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <Navigation size={12} />
                    <span className="text-[10px] font-semibold">TRIPS</span>
                </div>
            </div>
        </div>

        <div className="mt-12">
            <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em] font-bold">Made with ❤️ by Ashish, Goa</p>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
