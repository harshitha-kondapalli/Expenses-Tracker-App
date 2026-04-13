import { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddExpenseModal({ user, onClose, onSuccess, darkMode, API_BASE }) {
  const [formData, setFormData] = useState({
    title: '', amount: '', category: 'Food', payment_method: 'UPI',
    date: new Date().toISOString().split('T')[0], note: '', is_secret: false, is_recovery: false, expected_recovery_date: '', type: 'debit'
  });

  const [smartInput, setSmartInput] = useState('');
  const [isSmartLoading, setIsSmartLoading] = useState(false);
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["Food", "Transport", "Bills", "Shopping", "Entertainment", "Savings", "Goals", "Other"];
  const paymentMethods = ["UPI", "Cash", "Card", "Bank Transfer"];

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_BASE}/goals`, { headers: { 'X-User-ID': user.id } });
        const data = await res.json();
        setGoals(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Error fetching goals:", err); }
    };
    fetchGoals();
  }, [API_BASE, user?.id]);

  // --- ⚡ ZERO-COST LOCAL PRE-PARSER ⚡ ---
  const localPreParse = (text, availableGoals) => {
    const t = text.toLowerCase().trim();
    
    // 1. Extract the number
    const amountMatch = t.match(/\d+(\.\d+)?/);
    if (!amountMatch) return null; // If no number, let AI figure it out
    const amount = parseFloat(amountMatch[0]);
    let cleanText = t.replace(amountMatch[0], '').trim(); // Remove the number

    // 2. Check for Specific Vision Goals (e.g. "500 for iphone")
    for (const goal of availableGoals) {
      if (cleanText.includes(goal.title.toLowerCase())) {
        return { title: `Saved for ${goal.title}`, amount, category: "Goals", linked_goal_id: goal.id };
      }
    }

    // 3. Check for General Savings (e.g. "1000 to vault")
    if (cleanText.includes("save") || cleanText.includes("vault") || cleanText.includes("savings")) {
      return { title: "General Savings", amount, category: "Savings", linked_goal_id: null };
    }

    // 4. Dictionary of your common habits
    const dictionary = {
      "Food": ["kfc", "swiggy", "zomato", "tea", "coffee", "dinner", "lunch", "starbucks", "grocery", "blinkit", "zepto"],
      "Transport": ["uber", "ola", "auto", "metro", "petrol", "bus", "train", "flight", "cab", "rapido"],
      "Bills": ["wifi", "electricity", "recharge", "airtel", "jio", "rent", "water", "bill"],
      "Shopping": ["amazon", "flipkart", "zara", "myntra", "clothes", "shoes", "mall"],
      "Entertainment": ["netflix", "movie", "spotify", "cinema", "prime", "game"],
      "Savings": ["sip", "stocks", "fixed deposit", "fd", "gold", "mutual fund", "mf"]
    };

    // Scan dictionary
    for (const [cat, keywords] of Object.entries(dictionary)) {
      const matchedWord = keywords.find(kw => cleanText.includes(kw));
      if (matchedWord) {
        // Clean up the title (Remove filler words like "for", "at")
        let title = cleanText.replace(/^(for|on|to|at)\s+/i, '').trim();
        if (title.length < 2) title = matchedWord; 
        title = title.charAt(0).toUpperCase() + title.slice(1); // Capitalize
        
        return { title, amount, category: cat, linked_goal_id: null };
      }
    }

    return null; // Local failed, pass to AI
  };

  const handleSmartAdd = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!smartInput) return;

      // --- STEP 1: TRY LOCAL FIRST ---
      const localResult = localPreParse(smartInput, goals);
      if (localResult) {
        setFormData(prev => ({
          ...prev, 
          title: localResult.title, 
          amount: localResult.amount, 
          category: localResult.category
        }));
        if (localResult.linked_goal_id) setSelectedGoalId(localResult.linked_goal_id);
        
        toast.success("Quick matched locally! ⚡", { icon: '⚡' });
        setSmartInput('');
        return; // STOP! No expensive API call made.
      }

      // --- STEP 2: FALLBACK TO AZURE AI ---
      setIsSmartLoading(true);
      const loadingToast = toast.loading("AI Parsing...");

      try {
        const response = await fetch(`${API_BASE}/smart-parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: smartInput, available_goals: goals.map(g => ({ id: g.id, title: g.title })) })
        });
        const parsed = await response.json();
        
        setFormData(prev => ({
          ...prev, title: parsed.title || prev.title, amount: parsed.amount || prev.amount, category: parsed.category || prev.category,
        }));

        if (parsed.category === "Goals" && parsed.linked_goal_id) setSelectedGoalId(parsed.linked_goal_id);

        toast.success("AI parsed details!", { id: loadingToast });
        setSmartInput('');
      } catch (err) { toast.error("Couldn't parse that.", { id: loadingToast }); } 
      finally { setIsSmartLoading(false); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return toast.error("Merchant and Amount are required");
    if (formData.category === "Goals" && !selectedGoalId) return toast.error("Select a specific goal for this contribution!");
    if (formData.is_recovery && !formData.expected_recovery_date) return toast.error("Set a return date for lending!");

    setIsSubmitting(true);
    try {
      const transRes = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-ID': user?.id },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount), user_id: user?.id, goal_id: formData.category === "Goals" ? selectedGoalId : null })
      });

      if (!transRes.ok) throw new Error("Failed to save transaction");

      if (formData.category === "Goals" && selectedGoalId) {
        await fetch(`${API_BASE}/goals/${selectedGoalId}/add`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-User-ID': user?.id },
          body: JSON.stringify({ amount_to_add: parseFloat(formData.amount) })
        });
      }

      toast.success(formData.is_recovery ? "Lending recorded" : "Transaction recorded");
      onSuccess();
      onClose();
    } catch (err) { toast.error("Failed to save"); }
    finally { setIsSubmitting(false); }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm font-medium ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-rose-500 text-white' : 'bg-white border-slate-200 focus:border-rose-500 text-slate-900'}`;
  const labelClass = `block text-sm font-bold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`w-full max-w-lg p-8 rounded-3xl shadow-2xl ${darkMode ? 'bg-slate-900' : 'bg-[#f4f6f8]'} overflow-y-auto max-h-[90vh]`}>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-rose-600">Expense Record</h2>
          <button onClick={onClose} className={`p-2 rounded-xl hover:bg-black/5 transition-colors ${darkMode && 'hover:bg-white/10'}`}><X size={20} /></button>
        </div>

        <div className={`flex items-center gap-2 px-4 py-3 mb-6 rounded-xl border border-rose-100 bg-rose-50/50 ${darkMode && 'bg-rose-900/20 border-rose-500/30'}`}>
          {isSmartLoading ? <Loader2 className="animate-spin text-rose-500" size={18} /> : <Zap className="text-rose-500" size={18} />}
          <input 
            placeholder="Smart Add: Type '100 for swiggy' & hit Enter..." value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)} onKeyDown={handleSmartAdd}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-rose-900 dark:text-rose-200 placeholder:text-rose-400/60"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Merchant / Title</label>
            <input type="text" placeholder="Swiggy, Amazon, Uber..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className={inputClass} />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={labelClass}>Amount</label>
              <input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={inputClass}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {formData.category === "Goals" && (
            <div className="animate-in slide-in-from-top-2">
              <label className={labelClass}>Link to Specific Goal</label>
              <select value={selectedGoalId} onChange={(e) => setSelectedGoalId(e.target.value)} className={inputClass}>
                <option value="">Select your vision...</option>
                {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1">
               {/* 🐛 FIX: Changed label(className) to labelClass */}
               <label className={labelClass}>Payment method</label>
               <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className={inputClass}>
                 {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
               </select>
            </div>
            <div className="flex-1">
               <label className={labelClass}>Date</label>
               <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Note</label>
            <textarea placeholder="Optional note" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className={`${inputClass} resize-none h-16`} />
          </div>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex justify-between items-center px-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.is_secret} onChange={(e) => setFormData({...formData, is_secret: e.target.checked})} className="w-5 h-5 accent-rose-600 rounded" />
                <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">Secret?</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.is_recovery} onChange={(e) => setFormData({...formData, is_recovery: e.target.checked})} className="w-5 h-5 accent-indigo-600 rounded" />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Lending / Recoverable?</span>
              </label>
            </div>

            {formData.is_recovery && (
              <div className="animate-in slide-in-from-top-2 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-500/30">
                <label className="text-[10px] font-black text-indigo-600 uppercase mb-2 block tracking-widest">Expected Return Date</label>
                <input 
                  type="date" value={formData.expected_recovery_date || ''}
                  onChange={(e) => setFormData({...formData, expected_recovery_date: e.target.value})} 
                  className={`w-full p-3 rounded-xl font-bold outline-none border transition-all ${darkMode ? 'bg-slate-800 text-indigo-400 border-slate-700' : 'bg-white text-indigo-600 border-indigo-100'}`} 
                />
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 active:scale-[0.98] transition-all flex justify-center">
            {isSubmitting ? <Loader2 className="animate-spin" /> : (formData.is_recovery ? 'Confirm Lending' : 'Confirm Transaction')}
          </button>
        </form>
      </div>
    </div>
  );
}