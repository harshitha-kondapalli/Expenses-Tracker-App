import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

export default function FeatureAnnouncement({ darkMode }) {
  const [isOpen, setIsOpen] = useState(false);

  // The unique ID for this specific update. 
  // (Change this string in the future when you release a new feature!)
  const FEATURE_ID = 'seen_smart_add_update_v1'; 

  useEffect(() => {
    // Check if the browser remembers seeing this specific popup
    const hasSeen = localStorage.getItem(FEATURE_ID);
    
    if (!hasSeen) {
      // Add a slight 1-second delay so it pops up smoothly after the dashboard loads
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Save to the browser's memory so they NEVER see this specific popup again
    localStorage.setItem(FEATURE_ID, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-in fade-in duration-300">
      <div className={`w-full max-w-lg rounded-[2rem] p-8 shadow-2xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'} transform transition-all scale-100 animate-in zoom-in-95`}>
        
        <div className="flex justify-between items-start mb-6">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl">
            <Sparkles size={32} />
          </div>
          <button onClick={handleClose} className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>
            <X />
          </button>
        </div>

        <h2 className="text-2xl font-black mb-2">Meet the Smart Add Bar! 🚀</h2>
        <p className={`font-bold leading-relaxed mb-8 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Logging expenses just got 10x faster. Just type what you bought and how much it cost, and our new Smart Bar will automatically fill out the form for you.
        </p>

        <div className={`p-4 rounded-xl mb-8 font-mono text-sm font-bold ${darkMode ? 'bg-slate-900 text-indigo-400' : 'bg-slate-50 text-indigo-600'}`}>
          Try typing: "150 zomato lunch"
        </div>

        <button 
          onClick={handleClose} 
          className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Awesome, let me try it!
        </button>
      </div>
    </div>
  );
}