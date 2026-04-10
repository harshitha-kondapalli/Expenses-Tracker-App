import { 
  LayoutDashboard, 
  ReceiptText, 
  Landmark, 
  Undo2, 
  PiggyBank, 
  Target, // Added for Goals
  Vault   // Optional: feels more like a 'Savings Vault'
} from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab, user }) {
  // --- UPDATED TABS ARRAY ---
  // Ensure these names match your state logic in App.jsx
  const tabs = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Transactions', icon: <ReceiptText size={20} /> },
    { name: 'Debts', icon: <Landmark size={20} /> },
    { name: 'Recoveries', icon: <Undo2 size={20} /> },
    { name: 'Goals', icon: <Target size={20} /> },    // NEW: AI Research & Vision
    { name: 'Savings', icon: <Vault size={20} /> }    // UPDATED: Vault/Execution
  ];

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Brand / Logo Section */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-xl tracking-tighter">MC</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Money Cockpit</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pilot: {user?.name || 'Guest'}</p>
        </div>
      </div>

      {/* Navigation Tabs - Now with 6 items */}
      <div className="flex flex-wrap justify-center gap-2 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white shadow-sm overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setCurrentTab(tab.name)}
            className={`flex items-center gap-2 px-5 py-3 rounded-[1.5rem] font-black text-xs md:text-sm transition-all duration-300 whitespace-nowrap ${
              currentTab === tab.name
                ? 'bg-slate-900 text-white shadow-xl scale-105'
                : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Profile/Quick Status */}
      <div className="hidden lg:flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
          <Vault size={18} />
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase">Vault Status</p>
          <p className="text-xs font-black text-emerald-600">Online</p>
        </div>
      </div>
    </nav>
  );
}