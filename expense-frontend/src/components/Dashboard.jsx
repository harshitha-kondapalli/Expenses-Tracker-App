import { Minus, Plus, ArrowRight } from 'lucide-react';

export default function Dashboard({ 
  recentTransactions, 
  pendingRecoveries, 
  stats, // Received from App.jsx
  onAddExpense, 
  onAddCredit, 
  onViewLedger 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-7 space-y-8">
        <div>
          <p className="text-xs font-bold text-amber-600 tracking-widest mb-2 uppercase">Overview</p>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            {stats.net >= 0 ? "You are still cash-positive." : "You've spent more than you earned."}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all">
            <p className="text-xs text-slate-500 font-black uppercase mb-4 opacity-60">Net Flow</p>
            <p className={`text-xl font-black ${stats.net >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              ₹{stats.net?.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all">
            <p className="text-xs text-slate-500 font-black uppercase mb-4 opacity-60">Payment rail</p>
            <p className="text-xl font-black text-slate-900">UPI / Cash</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all border-l-amber-200">
            <p className="text-xs text-slate-500 font-black uppercase mb-4 opacity-60">Recoveries</p>
            <p className="text-xl font-black text-amber-600">{pendingRecoveries.length} Pending</p>
          </div>
        </div>

        <div className="pt-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
            <button onClick={onViewLedger} className="text-sm font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
              View Ledger <ArrowRight size={16} />
            </button>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-4 border border-white shadow-sm space-y-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-white rounded-[2rem] transition-all border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{tx.title}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{tx.category} • {new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-black text-xl ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    ₹{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="p-10 text-center text-slate-400 font-bold">No transactions found yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-5">
        <div className="bg-[#1e293b] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Total Monthly Debits</p>
          <h3 className="text-6xl font-black mb-6 tracking-tighter">
            ₹{stats.total_out?.toLocaleString() || "0"}
          </h3>
          <p className="text-xs text-slate-400 font-medium">Auto-calculated based on all confirmed expenses.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Money in</p>
            <h3 className="text-4xl font-black text-slate-900">
              ₹{stats.total_in?.toLocaleString() || "0"}
            </h3>
          </div>
          <div className="text-right">
             <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live Feed</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6">
          <button onClick={onAddExpense} className="bg-[#1e293b] hover:bg-slate-800 text-white p-8 rounded-[2.5rem] font-black flex flex-col items-center gap-4 transition-all shadow-xl active:scale-95 group">
            <Minus className="bg-white/10 group-hover:bg-white/20 rounded-full p-3 transition-colors shadow-inner" size={44} />
            Record Expense
          </button>
          <button onClick={onAddCredit} className="bg-white hover:bg-slate-50 text-slate-900 p-8 rounded-[2.5rem] font-black border-2 border-slate-100 flex flex-col items-center gap-4 transition-all shadow-md active:scale-95 group">
            <Plus className="bg-emerald-50 text-emerald-600 rounded-full p-3 transition-colors" size={44} />
            Record Credit
          </button>
        </div>
      </div>
    </div>
  );
}