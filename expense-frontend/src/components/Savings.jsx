import { useState, useEffect } from 'react';
import { Vault, TrendingUp, History, PieChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function Savings({ darkMode, API_BASE, headers }) {
  const [goals, setGoals] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState({});

  const fetchData = async () => {
    try {
      const [gRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/goals`, { headers }),
        fetch(`${API_BASE}/transactions`, { headers })
      ]);
      const gData = await gRes.json();
      const tData = await tRes.json();
      setGoals(gData);
      setHistory(tData.filter(t => t.category === "Savings"));
    } catch (err) {
      toast.error("Vault sync failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeposit = async (goal) => {
    const amount = parseFloat(fundAmount[goal.id]);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");

    try {
      // 1. Update Goal
      await fetch(`${API_BASE}/goals/${goal.id}/add`, {
        method: 'PUT', headers, body: JSON.stringify({ amount_to_add: amount })
      });
      // 2. Log Savings Transaction
      await fetch(`${API_BASE}/transactions`, {
        method: 'POST', headers, body: JSON.stringify({
          title: `To Vault: ${goal.title}`,
          amount, type: 'debit', category: 'Savings', user_id: headers['X-User-ID']
        })
      });
      toast.success("Funds Stashed!");
      setFundAmount({ ...fundAmount, [goal.id]: '' });
      fetchData();
    } catch (err) { toast.error("Transfer failed."); }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Top Stats & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`p-10 rounded-[3.5rem] shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} flex flex-col justify-center`}>
          <Vault className="text-indigo-600 mb-4" size={48} />
          <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Vault Value</p>
          <h2 className="text-4xl font-black text-indigo-600">₹{goals.reduce((a, b) => a + b.current_amount, 0).toLocaleString()}</h2>
        </div>
        <div className={`lg:col-span-2 p-10 rounded-[3.5rem] shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} h-64`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorSav" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip contentStyle={{borderRadius:'20px', border:'none'}} />
              <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fill="url(#colorSav)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Active Vaults */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black flex items-center gap-3"><PieChart className="text-indigo-600"/> Goal Progress</h3>
          {goals.map(goal => (
            <div key={goal.id} className={`p-8 rounded-[2.5rem] shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-black text-lg">{goal.title}</span>
                <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full">
                  {((goal.current_amount/goal.target_amount)*100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-indigo-600" style={{ width: `${(goal.current_amount/goal.target_amount)*100}%` }} />
              </div>
              <div className="flex gap-3">
                <input 
                  type="number" placeholder="Add ₹" value={fundAmount[goal.id] || ''}
                  onChange={(e) => setFundAmount({...fundAmount, [goal.id]: e.target.value})}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 outline-none border focus:border-indigo-500 font-bold"
                />
                <button onClick={() => handleDeposit(goal)} className="p-4 bg-slate-900 text-white dark:bg-indigo-600 rounded-xl hover:scale-105 transition-all"><TrendingUp size={20}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Ledger */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black flex items-center gap-3"><History className="text-indigo-600"/> Vault History</h3>
          <div className="space-y-4">
            {history.slice(-5).reverse().map(t => (
              <div key={t.id} className={`p-6 rounded-3xl flex justify-between items-center ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div>
                  <p className="font-black text-sm">{t.title}</p>
                  <p className="text-[10px] opacity-40 uppercase">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <p className="font-black text-emerald-500 text-lg">+₹{t.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}