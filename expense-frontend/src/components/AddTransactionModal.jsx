import { X } from 'lucide-react';

export default function AddTransactionModal({ type, user, onClose, onSuccess, darkMode, API_BASE }) {
  const isCredit = type === 'credit';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // 1. Build the data payload
    const data = {
      title: formData.get('title'),
      amount: parseFloat(formData.get('amount')),
      type: type,
      category: formData.get('category'),
      payment_mode: formData.get('payment_mode'),
      is_secret: formData.get('is_secret') === 'on',
      sender: formData.get('sender') || null,
      is_recovery: formData.get('is_recovery') === 'on',
      is_debt_payment: formData.get('is_debt_payment') === 'on',
      user_id: user.id  // THE STAMP OF OWNERSHIP
    };

    try {
      // 2. Send to the Cloud Backend (Render)
      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': user.id // SECURITY PASS
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess(); // Triggers fetchData in App.jsx to refresh the dashboard
        onClose();   // Closes the modal
      } else {
        const errorData = await response.json();
        alert(`Failed to save: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (err) { 
      console.error(err);
      alert("Network error: Could not reach the backend.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black">{isCredit ? 'Income' : 'Expense'} Record</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input name="title" placeholder="Title (e.g., Grocery Shopping)" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-transparent focus:border-slate-200 outline-none" required />
          
          <div className="grid grid-cols-2 gap-4">
            <input name="amount" type="number" step="0.01" placeholder="Amount (₹)" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-slate-900 text-xl border border-transparent focus:border-slate-200 outline-none" required />
            <select name="category" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-transparent focus:border-slate-200 outline-none">
              <option>Food</option><option>Shopping</option><option>Salary</option><option>Rent</option><option>Travel</option><option>Others</option>
            </select>
          </div>

          <div className="flex gap-4">
            <select name="payment_mode" className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border border-transparent focus:border-slate-200 outline-none">
              <option>UPI</option><option>Cash</option><option>Card</option>
            </select>
            <div className="flex-1 flex items-center justify-center gap-2 bg-slate-50 rounded-2xl border border-transparent">
              <input type="checkbox" name="is_secret" id="secret" className="w-4 h-4" />
              <label htmlFor="secret" className="text-sm font-bold text-slate-400 cursor-pointer">Secret Transaction?</label>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl text-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95">
            Confirm Entry
          </button>
        </form>
      </div>
    </div>
  );
}