import React from 'react';
import { Target, AlertTriangle } from 'lucide-react';

export default function BudgetGauges({ budgets = [], transactions = [], onSetBudget, darkMode }) {
  
  // Calculate progress for each budget based on actual live transactions
  const gauges = (budgets || []).map(budget => {
    
    // 1. DIRECT CALCULATION: Filter the transactions array and sum them up
    const categorySpend = (transactions || [])
      .filter(t => {
        // Only count debits (expenses), and ensure categories exist before comparing
        if (t.type !== 'debit' || !t.category || !budget.category) return false;
        
        // Case-insensitive match (e.g., "FOOD" matches "Food")
        return t.category.toLowerCase() === budget.category.toLowerCase();
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
    // 2. SAFE MATH: Prevent dividing by zero if limit is somehow 0
    const safeLimit = (budget?.monthly_limit && budget.monthly_limit > 0) ? budget.monthly_limit : 1;
    const rawPct = (categorySpend / safeLimit) * 100;
    const visualPct = Math.min(rawPct, 100); // Cap the visual bar at 100%
    
    // 3. COLOR LOGIC: Green -> Yellow -> Red
    let colorClass = "bg-emerald-500";
    if (rawPct >= 85) colorClass = "bg-rose-500";
    else if (rawPct >= 60) colorClass = "bg-amber-500";

    return { 
      ...budget, 
      spent: categorySpend, 
      rawPct, 
      visualPct, 
      colorClass,
      category: budget?.category || 'Unknown'
    };
  });

  return (
    <div className={`p-8 rounded-[3rem] shadow-xl transition-all duration-300 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <Target size={20} className="text-indigo-500" /> Budget Tracker
        </h3>
        <button 
          onClick={onSetBudget} 
          className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-500/20 active:scale-95 transition-all"
        >
          + Set Limit
        </button>
      </div>

      {/* GAUGES LIST */}
      <div className="space-y-6">
        {gauges.length === 0 ? (
          <div className="text-center py-6">
            <p className="font-bold opacity-30 italic text-sm">No limits engaged.</p>
            <p className="text-[10px] font-black uppercase opacity-40 mt-1 tracking-widest">Click Set Limit to begin</p>
          </div>
        ) : (
          gauges.map((gauge) => (
            <div key={gauge.id || Math.random()} className="group relative">
              
              {/* Labels & Numbers */}
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <p className="font-black text-sm">{gauge.category}</p>
                  {gauge.rawPct >= 100 && (
                    <AlertTriangle size={14} className="text-rose-500 animate-pulse" />
                  )}
                </div>
                <div className="text-right">
                  <p className="font-black">
                    ₹{gauge.spent.toLocaleString()}{' '}
                    <span className="opacity-40 text-xs">/ ₹{(gauge.monthly_limit || 0).toLocaleString()}</span>
                  </p>
                </div>
              </div>
              
              {/* The Visual Progress Bar */}
              <div className={`h-3 w-full rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <div 
                  className={`h-full ${gauge.colorClass} transition-all duration-1000 ease-out`} 
                  style={{ width: `${gauge.visualPct || 0}%` }} 
                />
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
}