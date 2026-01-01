import { useState } from 'react';
import { Coffee, Copy, Check } from 'lucide-react';

export default function DonationWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bmc' | 'upi'>('bmc');
  const [copied, setCopied] = useState(false);

  const copyUPI = () => {
    navigator.clipboard.writeText('ashish.gaude4@okaxis');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAssetPath = (path: string) => {
    // Helper to get correct path for GitHub Pages or local dev
    return import.meta.env.BASE_URL + path;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[3000] flex flex-col items-end gap-4 font-sans">
      {/* Popup Content */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 w-72 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-200">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('bmc')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    activeTab === 'bmc' 
                    ? 'bg-yellow-400 text-black' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
            >
                ☕️ BMC
            </button>
            <button 
                onClick={() => setActiveTab('upi')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    activeTab === 'upi' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
            >
                🇮🇳 UPI
            </button>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col items-center">
            
            {activeTab === 'bmc' && (
                <div className="flex flex-col items-center w-full gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-inner border border-gray-100 w-40 h-40 flex items-center justify-center">
                        <img 
                            src={getAssetPath('bmc_qr.png')} 
                            alt="BMC QR" 
                            className="w-full h-full object-contain mix-blend-multiply"
                        />
                    </div>
                    <a 
                        href="https://www.buymeacoffee.com/ashishgaude" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-[#FFDD00] hover:bg-[#FFEA00] text-black font-bold rounded-xl text-center shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                    >
                        <Coffee size={18} />
                        Support on BMC
                    </a>
                </div>
            )}

            {activeTab === 'upi' && (
                <div className="flex flex-col items-center w-full gap-4">
                    <div className="bg-white p-2 rounded-xl shadow-inner border border-gray-100 w-40 h-40 flex items-center justify-center">
                        <img 
                            src={getAssetPath('upi.jpeg')} 
                            alt="UPI QR" 
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>
                    <button 
                        onClick={copyUPI}
                        className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 group relative"
                    >
                        <span className="text-xs font-mono">ashish.gaude4@okaxis</span>
                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-400 group-hover:text-gray-600" />}
                        
                        {copied && (
                            <span className="absolute -top-8 bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg">Copied!</span>
                        )}
                    </button>
                </div>
            )}

          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none"
      >
        <div className={`absolute inset-0 bg-yellow-400 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity ${isOpen ? 'opacity-0' : ''}`}></div>
        <img 
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
            alt="Buy Me A Coffee" 
            className="h-12 w-auto shadow-lg rounded-lg relative z-10"
        />
        {/* Close circle if open */}
        {isOpen && (
            <div className="absolute -top-2 -right-2 bg-white text-gray-500 rounded-full p-1 shadow-md border border-gray-100 z-20">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </div>
        )}
      </button>
    </div>
  );
}
