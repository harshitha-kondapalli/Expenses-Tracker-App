import { Undo2, CheckCircle2, PiggyBank } from 'lucide-react';

export default function Recoveries({ pendingRecoveries }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-4xl mx-auto">
      <div className="mb-12 text-center lg:text-left px-4">
        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Recoveries Center</h2>
        <p className="text-slate-500 font-bold text-lg">Managing funds currently in circulation.</p>
      </div>
      <div className="space-y-4 px-4">
        {pendingRecoveries.map((item) => (
          <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                <Undo2 size={36} />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">{item.note}</p>
                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">₹{item.amount.toLocaleString()}</h4>
                <p className="text-sm text-slate-400 font-black">{item.title} • {item.date}</p>
              </div>
            </div>
            <button className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 active:scale-95">
              <CheckCircle2 size={24} />
              Recover
            </button>
          </div>
        ))}
        {pendingRecoveries.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-[3rem] p-16 flex flex-col items-center justify-center text-slate-400">
            <PiggyBank size={64} className="mb-4 opacity-10" />
            <p className="font-bold text-xl">No pending recoveries</p>
          </div>
        )}
      </div>
    </div>
  );
}