import React, { useState } from 'react';
import { X, CreditCard, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SetLimitModal({ card, user, API_BASE, onClose, onSuccess, darkMode }) {
  const [limit, setLimit] = useState(card.credit_limit || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!limit || isNaN(limit) || Number(limit) < 0) {
      toast.error("Please enter a valid limit");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/accounts/${card.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id
        },
        body: JSON.stringify({
          credit_limit: Number(limit)
        })
      });

      if (res.ok) {
        toast.success("Card limit updated successfully!", { icon: '✅' });
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to update card limit");
      }
    } catch (err) {
      toast.error("Error updating card limit");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
        
        <div className={`p-8 bg-gradient-to-br ${card.colorTheme} text-white relative shrink-0`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h2 className="text-2xl font-black tracking-tighter">{card.name}</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mt-1">Set Credit Limit</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-black/20 hover:bg-black/40 transition-all backdrop-blur-sm">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Credit Limit (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">₹</span>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="Enter credit limit"
                  className={`w-full pl-10 pr-4 py-4 rounded-xl font-black text-lg outline-none border-2 transition-all ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
              </div>
              <p className={`text-[10px] mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Current limit: ₹{card.credit_limit || 0} | Outstanding: ₹{card.outstanding.toLocaleString()} | Available: ₹{card.available.toLocaleString()}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : <><Save size={20} /> Update Limit</>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
