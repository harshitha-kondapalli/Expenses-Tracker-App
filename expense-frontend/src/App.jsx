import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Recoveries from './components/Recoveries';
import Debts from './components/Debts';
import Savings from './components/Savings';
import AddTransactionModal from './components/AddTransactionModal';

function App() {
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [activeModal, setActiveModal] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // App Data
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_in: 0, total_out: 0, net: 0 });
  const [analytics, setAnalytics] = useState({ categories: [], payment_modes: [] });

  // Time Travel Filters
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const user = { name: "Adityamunna19" };

  const fetchData = async () => {
    try {
      // Transactions (Always fetch all for Ledger, Debts, and Recoveries)
      const transRes = await fetch('http://localhost:8000/transactions');
      setTransactions(await transRes.json());

      // Stats & Analytics (Filtered by Time Travel)
      const statsRes = await fetch(`http://localhost:8000/stats?month=${filterMonth}&year=${filterYear}`);
      setStats(await statsRes.json());

      const analyticsRes = await fetch(`http://localhost:8000/analytics?month=${filterMonth}&year=${filterYear}`);
      setAnalytics(await analyticsRes.json());
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Re-fetch data whenever the Month or Year changes!
  useEffect(() => { 
    fetchData(); 
  }, [filterMonth, filterYear]);

  const deleteTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      const res = await fetch(`http://localhost:8000/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const pendingRecoveries = transactions.filter(t => t.is_recovery && t.type === 'debit');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8eee4] to-[#e2e6eb] p-4 md:p-10 pb-20 font-sans text-slate-800">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} user={user} />

      <main className="max-w-7xl mx-auto">
        {currentTab === 'Dashboard' && (
          <Dashboard 
            recentTransactions={transactions} 
            pendingRecoveries={pendingRecoveries}
            stats={stats}
            analytics={analytics}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            onAddExpense={() => setActiveModal('debit')}
            onAddCredit={() => setActiveModal('credit')}
            onViewLedger={() => setCurrentTab('Transactions')}
          />
        )}
        
        {currentTab === 'Transactions' && (
          <Transactions 
            transactions={transactions} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onDelete={deleteTransaction} 
            onEdit={(tx) => { setEditingTransaction(tx); setActiveModal(tx.type); }} 
          />
        )}
        
        {currentTab === 'Debts' && <Debts transactions={transactions} />}
        {currentTab === 'Recoveries' && <Recoveries transactions={transactions} onSuccess={fetchData} />}
        {currentTab === 'Savings' && <Savings />}
      </main>

      {activeModal && (
        <AddTransactionModal 
          type={activeModal} 
          editData={editingTransaction} 
          onClose={() => { setActiveModal(null); setEditingTransaction(null); }} 
          onSuccess={fetchData} 
        />
      )}
    </div>
  );
}

export default App;