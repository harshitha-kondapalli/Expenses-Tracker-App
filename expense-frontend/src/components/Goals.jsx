import { useState, useEffect } from 'react';
import { Target, Sparkles, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Goals({ darkMode, API_BASE, headers }) {
  const [goals, setGoals] = useState([]); // Initialized as empty array
  const [loading, setLoading] = useState(true);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        if (!API_BASE) return;
        const response = await fetch(`${API_BASE}/goals`, { headers });
        const data = await response.json();
        setGoals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Goals fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [API_BASE, headers]);

  // If loading, show a fallback so the screen isn't blank
  if (loading) return <div className="p-20 text-center font-bold opacity-50">Loading Vision Board...</div>;

  return (
    <div className="space-y-10 pb-20">
      {/* 1. RESEARCH MODAL (Only shows if triggered) */}
      {showConfirmModal && aiResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
           <div className={`w-full max-w-sm rounded-[3rem] overflow-hidden ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
              <img src={aiResult.image_url} className="w-full aspect-square object-cover" alt="" />
              <div className="p-8 text-center">
                <h3 className="text-2xl font-black">{aiResult.title}</h3>
                <p className="text-xl font-bold text-indigo-500 mb-6">₹{aiResult.target_amount?.toLocaleString()}</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl">Cancel</button>
                  <button onClick={async () => {
                     // Confirm Logic
                     try {
                        await fetch(`${API_BASE}/goals`, {
                          method: 'POST',
                          headers,
                          body: JSON.stringify({...aiResult, current_amount: 0, user_id: headers['X-User-ID']})
                        });
                        setShowConfirmModal(false);
                        window.location.reload(); // Hard refresh to ensure data sync
                     } catch (e) { toast.error("Save failed"); }
                  }} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl">Confirm</button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* 2. INPUT SECTION */}
      <div className={`p-8 rounded-[3rem] shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-black mb-6 uppercase tracking-tight italic">Goal Cockpit</h2>
        <div className="relative">
          <input 
            className="w-full p-5 rounded-2xl bg-slate-100 dark:bg-slate-700 outline-none font-bold"
            placeholder="Search a product..."
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
          />
          <button 
            onClick={async () => {
              setIsResearching(true);
              try {
                const res = await fetch(`${API_BASE}/goals/research?query=${newGoalTitle}`, { headers });
                const data = await res.json();
                setAiResult({
                  title: data.title || newGoalTitle,
                  target_amount: data.price || data.target_amount || 0,
                  image_url: data.image_url || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
                });
                setShowConfirmModal(true);
              } catch (e) { toast.error("Research failed"); }
              finally { setIsResearching(false); }
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl"
          >
            {isResearching ? <Loader2 className="animate-spin"/> : <Sparkles/>}
          </button>
        </div>
      </div>

      {/* 3. GRID SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {goals.length > 0 ? goals.map(goal => (
          <div key={goal.id} className={`rounded-[3rem] overflow-hidden shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <img src={goal.image_url} className="w-full aspect-video object-cover" alt="" />
            <div className="p-6">
              <h3 className="font-black text-xl truncate">{goal.title}</h3>
              <p className="text-indigo-500 font-bold">Target: ₹{goal.target_amount?.toLocaleString()}</p>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-10 opacity-30 font-bold italic uppercase">No Goals Found</div>
        )}
      </div>
    </div>
  );
}