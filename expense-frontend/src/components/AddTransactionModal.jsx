import { X, Landmark, User, Wallet } from 'lucide-react';
import { useState } from 'react';

export default function AddTransactionModal({ type, onClose, onSuccess, editData }) {
  const isCredit = type === 'credit';
  const isEditing = !!editData;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      amount: parseFloat(formData.get('amount')),
      type: type,
      category: formData.get('category'),
      is_secret: formData.get('is_secret') === 'on',
      sender: formData.get('sender') || null,
      is_recovery: formData.get('is_recovery') === 'on'
    };

    try {
      const url = isEditing 
        ? `http://localhost:8000/transactions/${editData.id}` 
        : 'http://localhost:8000/transactions';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl border border-white animate-in zoom-in duration-200">
        <div className="flex justify-between items-center p-10 pb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isEditing ? 'Update Entry' : (isCredit ? 'Record Income' : 'Record Expense')}
            </h2>
            <p className="text-slate-500 font-bold mt-1">
              {isEditing ? 'Modify the details of this record' : 'Add a new record to your ledger'}
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-8">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              {isCredit ? <Landmark size={14} /> : <Wallet size={14} />}
              Source / Title
            </label>
            <input 
              name="title" 
              type="text" 
              defaultValue={editData?.title || ""} 
              className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-slate-100 font-bold text-xl" 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Amount (₹)</label>
              <input 
                name="amount" 
                type="number" 
                step="0.01" 
                defaultValue={editData?.amount || ""} 
                className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-slate-100 font-black text-2xl" 
                required 
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category</label>
              <select 
                name="category" 
                defaultValue={editData?.category || "Others"} 
                className="w-full px-8 py-5 bg-slate-50 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-slate-100 font-bold text-lg bg-white"
              >
                {isCredit ? (
                  <>
                    <option>Salary</option><option>Freelance</option><option>Gift/Refund</option>
                  </>
                ) : (
                  <>
                    <option>Food & Drinks</option><option>Health</option><option>Groceries</option><option>Family/Friends</option>
                  </>
                )}
                <option>Others</option>
              </select>
            </div>
          </div>

          {isCredit && (
            <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
               <label className="flex items-center gap-2 text-xs font-black text-emerald-700 uppercase mb-3"><User size={14} /> Sender</label>
               <input name="sender" type="text" defaultValue={editData?.sender || ""} className="w-full px-6 py-4 bg-white border border-emerald-200 rounded-xl font-bold" />
            </div>
          )}

          {!isCredit && (
             <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-center gap-3">
                <input name="is_recovery" type="checkbox" id="isRecovery" defaultChecked={editData?.is_recovery} className="w-6 h-6 accent-amber-600 rounded-lg" />
                <label htmlFor="isRecovery" className="text-sm font-black text-amber-800 cursor-pointer">Mark as Recovery</label>
             </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <div className="flex items-center gap-3 px-4 py-2 group">
              <input name="is_secret" type="checkbox" id="secret" defaultChecked={editData?.is_secret} className="w-5 h-5 accent-slate-900" />
              <label htmlFor="secret" className="text-sm font-black text-slate-500 group-hover:text-slate-800 cursor-pointer">Secret</label>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 w-full bg-[#1e293b] hover:bg-slate-800 text-white font-black py-6 rounded-[1.8rem] shadow-2xl transition-all active:scale-[0.98] text-xl disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isEditing ? 'Update Record' : 'Confirm Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}