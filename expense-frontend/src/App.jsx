import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Recoveries from './components/Recoveries';
import Savings from './components/Savings';
import AddTransactionModal from './components/AddTransactionModal';

function App() {
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [activeModal, setActiveModal] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_in: 0, total_out: 0, net: 0 });

  const user = { name: "Adityamunna19" };

  const fetchData = async () => {
    try {
      const transRes = await fetch('http://localhost:8000/transactions');
      const transData = await transRes.json();
      setTransactions(transData);

      const statsRes = await fetch('http://localhost:8000/stats');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const deleteTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      const res = await fetch(`http://localhost:8000/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setActiveModal(tx.type); // Opens modal in 'debit' or 'credit' mode
  };

  const pendingRecoveries = transactions.filter(t => t.is_recovery && t.type === 'debit');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8eee4] to-[#e2e6eb] p-4 md:p-10 pb-20">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} user={user} />

      <main className="max-w-7xl mx-auto">
        {currentTab === 'Dashboard' && (
          <Dashboard 
            recentTransactions={transactions} 
            pendingRecoveries={pendingRecoveries}
            stats={stats}
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
            onEdit={handleEdit}
          />
        )}

        {currentTab === 'Recoveries' && <Recoveries pendingRecoveries={pendingRecoveries} />}
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