import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Recoveries from './components/Recoveries';
import Debts from './components/Debts';
import Savings from './components/Savings';
import Goals from './components/Goals';
import AddExpenseModal from './components/AddExpenseModal';
import AddIncomeModal from './components/AddIncomeModal';
import FeatureAnnouncement from './components/FeatureAnnouncement';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { Moon, Sun, LogOut } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://expenses-tracker-app-backend-main.onrender.com';

function MainApp() {
  const { user, signOut } = useAuth();
  
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'debit' or 'credit'
  const [searchQuery, setSearchQuery] = useState("");
  
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_in: 0, total_out: 0, net: 0 });
  const [analytics, setAnalytics] = useState({ categories: [] });

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // SAFE HEADERS: Prevents "undefined" UUID crashes
  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (user?.id) {
      headers['X-User-ID'] = user.id;
    }
    return headers;
  };

  const fetchData = async () => {
    if (!user?.id) return; // Stop fetching if user ID isn't ready
    
    try {
      const transRes = await fetch(`${API_BASE}/transactions`, { headers: getHeaders() });
      const transData = await transRes.json();
      setTransactions(Array.isArray(transData) ? transData : []);

      const statsRes = await fetch(`${API_BASE}/stats?month=${filterMonth}&year=${filterYear}`, { headers: getHeaders() });
      setStats(await statsRes.json());

      const analyticsRes = await fetch(`${API_BASE}/analytics?month=${filterMonth}&year=${filterYear}`, { headers: getHeaders() });
      setAnalytics(await analyticsRes.json());
    } catch (err) { 
      console.error("Data Fetch Error:", err); 
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMonth, filterYear, user]);

  // --- AUTOMATIC RECOVERY REMINDERS ---
  useEffect(() => {
    if (transactions.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const overdue = transactions.filter(t => 
      t.is_recovery && 
      !t.is_recovered && 
      t.expected_recovery_date && 
      t.expected_recovery_date < today
    );

    // Show persistent toast if money is owed past due date
    if (overdue.length > 0) {
      const totalOwed = overdue.reduce((sum, t) => sum + t.amount, 0);
      toast.error(
        `You have ₹${totalOwed.toLocaleString()} in overdue recoveries! Check the Recoveries tab.`, 
        { 
          duration: 8000, 
          icon: '🚨',
          style: { borderRadius: '16px', background: darkMode ? '#4c0519' : '#fff1f2', color: darkMode ? '#fda4af' : '#e11d48', fontWeight: 'bold' }
        }
      );
    }
  }, [transactions, darkMode]);

  const filteredTransactions = transactions.filter(tx => 
    tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRecoveries = transactions.filter(t => t.is_recovery && t.type === 'debit' && !t.is_recovered);

  return (
    <div className={`${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#f8eee4] text-slate-800'} min-h-screen transition-colors duration-500 p-4 md:p-10 pb-24 font-sans`}>
      
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <button onClick={signOut} className="p-4 bg-rose-500 text-white rounded-full shadow-2xl hover:bg-rose-600 active:scale-95 transition-all" title="Logout">
          <LogOut size={24} />
        </button>
        <button onClick={() => setDarkMode(!darkMode)} className={`p-4 rounded-full shadow-2xl transition-all ${darkMode ? 'bg-amber-400 text-slate-900' : 'bg-slate-900 text-white'}`}>
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        user={{ name: user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : (user.email?.split('@')[0] || 'Pilot') }} 
        darkMode={darkMode} 
      />

      <main className="max-w-7xl mx-auto mt-6">
        <FeatureAnnouncement darkMode={darkMode} />
        
        {currentTab === 'Dashboard' && (
          <Dashboard 
            recentTransactions={transactions.slice(0, 5)} 
            pendingRecoveries={pendingRecoveries} 
            stats={stats} analytics={analytics} 
            filterMonth={filterMonth} setFilterMonth={setFilterMonth} 
            filterYear={filterYear} setFilterYear={setFilterYear} 
            onAddExpense={() => setActiveModal('debit')} 
            onAddCredit={() => setActiveModal('credit')} 
            onViewLedger={() => setCurrentTab('Transactions')} 
            darkMode={darkMode} 
          />
        )}
        
        {currentTab === 'Transactions' && (
          <Transactions transactions={filteredTransactions} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onDelete={async (id) => { await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE', headers: getHeaders() }); fetchData(); }} darkMode={darkMode} />
        )}

        {currentTab === 'Debts' && <Debts transactions={transactions} darkMode={darkMode} />}
        {currentTab === 'Recoveries' && <Recoveries transactions={transactions} onSuccess={fetchData} darkMode={darkMode} API_BASE={API_BASE} headers={getHeaders()} />}
        {currentTab === 'Goals' && <Goals darkMode={darkMode} API_BASE={API_BASE} headers={getHeaders()} />}
        {currentTab === 'Savings' && <Savings darkMode={darkMode} API_BASE={API_BASE} headers={getHeaders()} />}
      </main>

      {/* MODAL ROUTING */}
      {activeModal === 'debit' && (
        <AddExpenseModal user={user} onClose={() => setActiveModal(null)} onSuccess={fetchData} darkMode={darkMode} API_BASE={API_BASE} />
      )}
      
      {activeModal === 'credit' && (
        <AddIncomeModal user={user} onClose={() => setActiveModal(null)} onSuccess={fetchData} darkMode={darkMode} API_BASE={API_BASE} />
      )}
    </div>
  );
}

function AuthWrapper() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8eee4]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div></div>;
  return user ? <MainApp /> : <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff', borderRadius: '16px', fontWeight: 'bold' } }} />
      <AuthWrapper />
    </AuthProvider>
  );
}