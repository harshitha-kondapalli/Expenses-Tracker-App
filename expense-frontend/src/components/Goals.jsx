import { useState, useEffect } from 'react';
import { Target, Sparkles, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Goals({ darkMode, API_BASE, headers }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isResearching, setIsResearching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_BASE}/goals`, { headers });
      const data = await response.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Vision sync failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchGoals(); 
  }, [API_BASE]);

  const handleResearch = async () => {
    if (!newGoalTitle) return toast.error("Enter a product name first!");
    setIsResearching(true);
    const loadingToast = toast.loading("Azure AI Researching...");
    
    try {
      const response = await fetch(`${API_BASE}/goals/research?query=${newGoalTitle}`, { headers });
      const data = await response.json();

      setAiResult({
        title: data.title || newGoalTitle,
        target_amount: data.price || data.target_amount || 0,
        image_url: data.image_url || `https://source.unsplash.com/featured/400x400?tech,${newGoalTitle.replace(' ', ',')}`
      });
      
      setShowConfirmModal(true);
      toast.success("Vision Verified!", { id: loadingToast });
    } catch (err) {
      toast.error("AI Research timed out", { id: loadingToast });
    } finally {
      setIsResearching(false);
    }
  };

  const confirmAiGoal = async () => {
    try {
      const response = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          ...aiResult,
          current_amount: 0.0,
          user_id: headers['X-User-ID']
        })
      });

      if (response.ok) {
        toast.success("Added to Vision Board");
        setNewGoalTitle('');
        setShowConfirmModal(false);
        fetchGoals();
      }
    } catch (err) {
      toast.error("Failed to save vision");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      const response = await fetch(`${API_BASE}/goals/${id}`, { 
        method: 'DELETE', 
        headers 
      });
      
      if (response.ok) {
        toast.success("Vision Removed");
        fetchGoals();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  if (loading) return (
    <div className="py-20 text-center animate-pulse">
      <Target className="mx-auto text-indigo-600 mb-4 opacity-20" size={64} />
      <p className="font-black opacity-20 text-2xl uppercase italic tracking-widest">Syncing Vision Board...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-10 pb-20">
      
      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && aiResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-sm overflow-hidden rounded-[3.5rem] shadow-2xl animate-in zoom-in duration-300 ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <img src={aiResult.image_url} className="aspect-square w-full object-cover" alt="" />
            <div className="p-8 text-center -mt-12 relative bg-inherit rounded-t-[3rem] border-t-8 border-indigo-600/10">
              <h3 className="text-2xl font-black mb-1 tracking-tight">{aiResult.title}</h3>
              <p className="text-3xl font-black text-indigo-600 mb-6">₹{aiResult.target_amount.toLocaleString()}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">Cancel</button>
                <button onClick={confirmAiGoal} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/30">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- INPUT BAR --- */}
      <div className={`p-10 rounded-[3.5rem] shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex items-center gap-5 mb-8">
          <div className="p-5 bg-indigo-600 text-white rounded-[1.8rem] shadow-lg shadow-indigo-500/20"><Target size={32} /></div>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">Goal Cockpit</h2>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">Azure AI Vision System</p>
          </div>
        </div>
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search a product or vision..." 
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
            className={`w-full px-8 py-6 pr-20 rounded-[2.5rem] font-bold outline-none border-4 transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-600' : 'bg-slate-50 border-transparent focus:border-indigo-600 focus:bg-white'}`}
          />
          <button 
            onClick={handleResearch} 
            disabled={isResearching} 
            className="absolute right-3 top-1/2 -translate-y-1/2 p-4 rounded-3xl bg-indigo-600 text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/40 disabled:opacity-50"
          >
            {isResearching ? <Loader2 className="animate-spin" size={24}/> : <Sparkles size={24} />}
          </button>
        </div>
      </div>

      {/* --- GOALS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-2">
        {goals.map(goal => (
          <div key={goal.id} className={`group relative overflow-hidden rounded-[3.5rem] shadow-xl border-4 transition-all duration-500 hover:-translate-y-2 ${darkMode ? 'bg-slate-800 border-transparent' : 'bg-white border-transparent'}`}>
            
            {/* FIXED: Delete button is now permanently visible in the top right corner */}
            <button 
              onClick={() => handleDelete(goal.id)} 
              className="absolute top-5 right-5 z-20 p-3.5 bg-rose-500/90 backdrop-blur-md text-white rounded-2xl shadow-lg hover:bg-rose-600 active:scale-95 transition-all"
              title="Delete Goal"
            >
              <Trash2 size={18} />
            </button>

            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img src={goal.image_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-8 right-8">
                <h3 className="text-2xl font-black text-white truncate mb-1 tracking-tight">{goal.title}</h3>
                <p className="text-indigo-400 font-black text-xl tracking-tighter">₹{goal.target_amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        
        {goals.length === 0 && !loading && (
           <div className="col-span-full py-16 text-center font-black opacity-30 text-xl uppercase italic tracking-widest border-4 border-dashed rounded-[3rem]">
              No visions added yet
           </div>
        )}
      </div>
    </div>
  );
}