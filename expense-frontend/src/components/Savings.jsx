import { Target, Plus, PiggyBank, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Savings() {
  const [goals, setGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [fundingGoal, setFundingGoal] = useState(null); // Holds the ID of the goal being funded
  const [error, setError] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await fetch('http://localhost:8000/goals');
      const data = await res.json();
      if (!res.ok) {
        setGoals([]);
        setError(data?.detail || 'Unable to load goals right now.');
        return;
      }
      if (!Array.isArray(data)) {
        setGoals([]);
        setError('Goals API returned an unexpected response.');
        return;
      }
      setError('');
      setGoals(data);
    } catch (err) {
      console.error(err);
      setGoals([]);
      setError('Unable to reach goals service.');
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    const data = {
      title: e.target.title.value,
      target_amount: parseFloat(e.target.target_amount.value)
    };
    const res = await fetch('http://localhost:8000/goals', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    if (!res.ok) {
      const responseData = await res.json().catch(() => ({}));
      setError(responseData?.detail || 'Failed to create goal.');
      return;
    }
    setShowGoalModal(false);
    setError('');
    fetchGoals();
  };

  const handleFundGoal = async (e) => {
    e.preventDefault();
    const data = { amount_to_add: parseFloat(e.target.amount.value) };
    const res = await fetch(`http://localhost:8000/goals/${fundingGoal}/add`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
    if (!res.ok) {
      const responseData = await res.json().catch(() => ({}));
      setError(responseData?.detail || 'Failed to add funds.');
      return;
    }
    setFundingGoal(null);
    setError('');
    fetchGoals();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 px-4 gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Future Funds</h2>
          <p className="text-slate-500 font-bold text-lg">Allocate cash flow to your financial goals.</p>
        </div>
        <button onClick={() => setShowGoalModal(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-8 rounded-2xl flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all">
          <Plus size={20} /> Create Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {error && (
          <div className="md:col-span-2 bg-rose-50 border border-rose-100 text-rose-700 font-bold p-4 rounded-2xl">
            {error}
          </div>
        )}

        {goals.length === 0 && !error && (
          <div className="md:col-span-2 bg-white/70 border border-white p-8 rounded-[2rem] text-center text-slate-500 font-bold">
            No savings goals yet. Create your first goal to get started.
          </div>
        )}

        {goals.map(goal => {
          const currentAmount = Number(goal.current_amount ?? 0);
          const targetAmount = Number(goal.target_amount ?? 0);
          const progress = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
          const isComplete = progress >= 100;

          return (
            <div key={goal.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              {isComplete && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10"></div>}
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-500'}`}>
                    {isComplete ? <Sparkles size={24} /> : <Target size={24} />}
                  </div>
                  <span className="text-xs font-black bg-slate-100 text-slate-500 px-4 py-2 rounded-full uppercase tracking-widest">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-1">{goal.title}</h3>
                <p className="text-slate-400 font-bold text-sm mb-8">₹{currentAmount.toLocaleString()} / ₹{targetAmount.toLocaleString()}</p>

                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-6">
                  <div className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-emerald-400' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                </div>

                {!isComplete && (
                  <button onClick={() => setFundingGoal(goal.id)} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-black py-4 rounded-xl flex justify-center items-center gap-2 transition-colors border border-slate-200">
                    <PiggyBank size={18} /> Add Funds
                  </button>
                )}
                {isComplete && <p className="text-center font-black text-emerald-600 uppercase tracking-widest text-sm pt-4">Goal Reached! 🎉</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODALS --- */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <form onSubmit={handleCreateGoal} className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-6">New Savings Goal</h3>
            <div className="space-y-4 mb-8">
              <input name="title" type="text" placeholder="Goal Name (e.g. Vacation)" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold" required />
              <input name="target_amount" type="number" placeholder="Target Amount (₹)" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold" required />
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowGoalModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl">Cancel</button>
              <button type="submit" className="flex-1 bg-[#1e293b] text-white font-bold py-4 rounded-xl">Create</button>
            </div>
          </form>
        </div>
      )}

      {fundingGoal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <form onSubmit={handleFundGoal} className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Add Funds</h3>
            <input name="amount" type="number" placeholder="Amount to add (₹)" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold mb-8" required />
            <div className="flex gap-4">
              <button type="button" onClick={() => setFundingGoal(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl">Cancel</button>
              <button type="submit" className="flex-1 bg-blue-500 text-white font-bold py-4 rounded-xl">Deposit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
