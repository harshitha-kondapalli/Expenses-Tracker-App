import { formatCurrency } from "@expenses/shared";
import { AppHeader } from "./components/AppHeader";
import { CategoryBreakdown } from "./components/CategoryBreakdown";
import { CreditForm } from "./components/CreditForm";
import { DuePaymentsBoard } from "./components/DuePaymentsBoard";
import { ExpenseForm } from "./components/ExpenseForm";
import { FiltersBar } from "./components/FiltersBar";
import { PaymentMethodBreakdown } from "./components/PaymentMethodBreakdown";
import { RecoveriesBoard } from "./components/RecoveriesBoard";
import { RecoveryReminderPopup } from "./components/RecoveryReminderPopup";
import { SummaryCard } from "./components/SummaryCard";
import { TransactionTable } from "./components/TransactionTable";
import { TrendChart } from "./components/TrendChart";
import { useExpenses } from "./hooks/useExpenses";
import { useState } from "react";

const buildTrendFromTransactions = (
  transactions: ReturnType<typeof useExpenses>["transactions"],
  key: "day" | "month"
) => {
  const totals = new Map<string, number>();
  const creditTransactions = transactions.filter(
    (transaction) => transaction.direction === "credit" && transaction.status === "completed"
  );

  creditTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const label =
      key === "day"
        ? date.toISOString().slice(0, 10)
        : `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;

    totals.set(label, (totals.get(label) ?? 0) + transaction.amount);
  });

  return [...totals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, total]) => ({ label, total }));
};

const App = () => {
  const [activeSection, setActiveSection] = useState<
    "dashboard" | "transactions" | "credits" | "recoveries" | "savings" | "payment-history" | "due-payments"
  >("dashboard");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [dismissedRecoveryIds, setDismissedRecoveryIds] = useState<string[]>([]);
  const {
    transactions,
    filteredTransactions,
    filters,
    setFilters,
    summary,
    apiStatus,
    apiMessage,
    addExpense,
    addCredit,
    updateExpense,
    markRecoveryReceived
  } = useExpenses();
  const totalCredited = filteredTransactions
    .filter((transaction) => transaction.direction === "credit" && transaction.status === "completed")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyCredited = filteredTransactions
    .filter((transaction) => {
      if (transaction.direction !== "credit" || transaction.status !== "completed") {
        return false;
      }

      const valueDate = new Date(transaction.date);
      const today = new Date();
      return valueDate.getMonth() === today.getMonth() && valueDate.getFullYear() === today.getFullYear();
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const netFlow = totalCredited - summary.totalSpent;
  const creditTransactions = filteredTransactions.filter((transaction) => transaction.direction === "credit");
  const creditDailyTrend = buildTrendFromTransactions(filteredTransactions, "day").slice(-7);
  const creditMonthlyTrend = buildTrendFromTransactions(filteredTransactions, "month");
  const savingsTransactions = filteredTransactions.filter(
    (transaction) =>
      transaction.direction === "debit" &&
      transaction.status === "completed" &&
      transaction.category === "Savings"
  );
  const totalSaved = savingsTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlySaved = savingsTransactions
    .filter((transaction) => {
      const valueDate = new Date(transaction.date);
      const today = new Date();
      return valueDate.getMonth() === today.getMonth() && valueDate.getFullYear() === today.getFullYear();
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const savingsDailyTrend = savingsTransactions
    .reduce<Map<string, number>>((totals, transaction) => {
      const key = new Date(transaction.date).toISOString().slice(0, 10);
      totals.set(key, (totals.get(key) ?? 0) + transaction.amount);
      return totals;
    }, new Map())
    .entries();
  const savingsMonthlyTrend = savingsTransactions
    .reduce<Map<string, number>>((totals, transaction) => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
      totals.set(key, (totals.get(key) ?? 0) + transaction.amount);
      return totals;
    }, new Map())
    .entries();
  const savingsTrendPoints = [...savingsDailyTrend]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, total]) => ({ label, total }))
    .slice(-7);
  const savingsMonthlyPoints = [...savingsMonthlyTrend]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, total]) => ({ label, total }));
  const savingsPaymentTotals = savingsTransactions.reduce(
    (accumulator, transaction) => ({
      ...accumulator,
      [transaction.paymentMethod]: accumulator[transaction.paymentMethod] + transaction.amount
    }),
    {
      UPI: 0,
      Card: 0,
      NetBanking: 0,
      Wallet: 0,
      Cash: 0,
      Other: 0
    }
  );
  const topCategoryEntry = Object.entries(summary.categoryTotals)
    .sort((left, right) => right[1] - left[1])
    .find(([, total]) => total > 0);
  const topPaymentMethodEntry = Object.entries(summary.paymentMethodTotals)
    .sort((left, right) => right[1] - left[1])
    .find(([, total]) => total > 0);
  const dueWatchCount = transactions.filter((transaction) =>
    ["Rent", "Bills", "Recharge", "Education"].includes(transaction.category)
  ).length;
  const recoveryTransactions = transactions.filter(
    (transaction) => transaction.recoveryReminder?.status === "open"
  );
  const dueRecoveries = recoveryTransactions.filter((transaction) => {
    const dueDate = transaction.recoveryReminder?.dueDate;
    return dueDate ? new Date(dueDate) <= new Date() : false;
  });
  const activeRecoveryPopup = dueRecoveries.find(
    (transaction) => !dismissedRecoveryIds.includes(transaction.id)
  );
  const navigateToSection = (
    section:
      | "dashboard"
      | "transactions"
      | "credits"
      | "recoveries"
      | "savings"
      | "payment-history"
      | "due-payments"
  ) => {
    setActiveSection(section);
    if (section === "savings") {
      setFilters({ ...filters, category: "Savings" });
    }
  };
  const openSavingsDashboard = () => {
    setActiveSection("savings");
    setFilters({ ...filters, category: "Savings" });
  };

  return (
    <main className="app-shell">
      <AppHeader
        activeSection={activeSection}
        onNavigate={navigateToSection}
        onOpenComposer={() => setIsComposerOpen(true)}
      />

      {activeSection === "dashboard" ? (
        <>
          <section className="hero dashboard-hero">
            <div className="dashboard-insight">
              <div className="section-heading">
                <p className="eyebrow">Overview</p>
                <h2>{netFlow >= 0 ? "You are still cash-positive in this view." : "Your outflow is ahead right now."}</h2>
              </div>
              <p className={`api-banner api-${apiStatus}`}>{apiMessage ?? "Connecting to backend..."}</p>

              <div className="insight-grid">
                <article className="insight-card">
                  <span>Top spending category</span>
                  <strong>{topCategoryEntry?.[0] ?? "No debits yet"}</strong>
                  <p>
                    {topCategoryEntry
                      ? formatCurrency(topCategoryEntry[1], "INR", "en-IN")
                      : "Add some expenses to see category dominance."}
                  </p>
                </article>

                <article className="insight-card">
                  <span>Most-used payment rail</span>
                  <strong>{topPaymentMethodEntry?.[0] ?? "No payment data yet"}</strong>
                  <p>
                    {topPaymentMethodEntry
                      ? formatCurrency(topPaymentMethodEntry[1], "INR", "en-IN")
                      : "Payment mix appears after recorded debit activity."}
                  </p>
                </article>

                <article className="insight-card">
                  <span>Recurring watchlist</span>
                  <strong>{dueWatchCount}</strong>
                  <p>
                    {dueWatchCount > 0
                      ? "Items currently flagged for due-payment attention."
                      : "No recurring-style items detected yet."}
                  </p>
                </article>

                <article className="insight-card">
                  <span>Money to collect back</span>
                  <strong>{recoveryTransactions.length}</strong>
                  <p>
                    {recoveryTransactions.length > 0
                      ? `${dueRecoveries.length} reminder${dueRecoveries.length === 1 ? "" : "s"} due now.`
                      : "No open recoveries right now."}
                  </p>
                </article>
              </div>

              <div className="action-band">
                <button type="button" className="primary-cta large-cta" onClick={() => setIsComposerOpen(true)}>
                  Add expense
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => navigateToSection("credits")}
                >
                  Add credit
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => navigateToSection("recoveries")}
                >
                  View recoveries
                </button>
              </div>
            </div>

            <div className="summary-grid">
              <SummaryCard
                label="Money out"
                value={formatCurrency(summary.totalSpent, "INR", "en-IN")}
                helper="Completed debit transactions"
                tone="accent"
              />
              <SummaryCard
                label="Money in"
                value={formatCurrency(totalCredited, "INR", "en-IN")}
                helper="Completed credit transactions"
              />
              <SummaryCard
                label="Net flow"
                value={formatCurrency(netFlow, "INR", "en-IN")}
                helper={netFlow >= 0 ? "Positive cash position" : "Outflow is ahead of inflow"}
              />
            </div>
          </section>

          <section className="dashboard-strip">
            <article className="dashboard-strip-card">
              <span>This month</span>
              <strong>{formatCurrency(summary.monthlySpent, "INR", "en-IN")}</strong>
              <p>Debit spending in the current month</p>
            </article>
            <article className="dashboard-strip-card">
              <span>Credits this month</span>
              <strong>{formatCurrency(monthlyCredited, "INR", "en-IN")}</strong>
              <p>Incoming money recorded in the current month</p>
            </article>
            <article className="dashboard-strip-card">
              <span>Ledger size</span>
              <strong>{transactions.length}</strong>
              <p>Total records available for review</p>
            </article>
          </section>

          <FiltersBar filters={filters} onChange={setFilters} />

          <section className="content-grid analytics-grid">
            <CategoryBreakdown
              totals={summary.categoryTotals}
              activeCategory={filters.category}
              onSelectCategory={(category) => {
                if (category === "Savings") {
                  openSavingsDashboard();
                  return;
                }

                setFilters({ ...filters, category });
              }}
            />
            <PaymentMethodBreakdown totals={summary.paymentMethodTotals} />
          </section>

          <section className="content-grid analytics-grid">
            <DuePaymentsBoard transactions={transactions} />
            <TrendChart
              title="Daily spending"
              subtitle="Short-range visibility so unusual spikes stand out quickly."
              points={summary.dailyTrend.slice(-7)}
            />
          </section>

          <section className="content-grid analytics-grid">
            <TrendChart
              title="Monthly spending"
              subtitle="A wider read on how your expense rhythm changes over time."
              points={summary.monthlyTrend}
            />
          </section>
        </>
      ) : null}

      {activeSection === "transactions" ? (
        <>
          <FiltersBar filters={filters} onChange={setFilters} />
          <TransactionTable transactions={filteredTransactions} onUpdate={updateExpense} />
        </>
      ) : null}

      {activeSection === "credits" ? (
        <>
          <section className="hero hero-compact">
            <div className="hero-copy-block">
              <p className="eyebrow">Credits</p>
              <h1>Track income and incoming transfers separately.</h1>
              <p className="hero-copy">
                This page is where salary, refunds, reimbursements, and incoming transfers should live so
                your dashboard can show a true net picture instead of only spending.
              </p>
            </div>

            <div className="summary-grid">
              <SummaryCard
                label="Total credited"
                value={formatCurrency(totalCredited, "INR", "en-IN")}
                helper="Incoming money in current filter"
                tone="accent"
              />
              <SummaryCard
                label="This month"
                value={formatCurrency(monthlyCredited, "INR", "en-IN")}
                helper="Current month credits"
              />
              <SummaryCard
                label="Credit records"
                value={String(creditTransactions.length)}
                helper="Credits visible in current filter"
              />
            </div>
          </section>

          <FiltersBar filters={filters} onChange={setFilters} />

          <section className="content-grid analytics-grid">
            <CreditForm onSubmit={addCredit} />
            <TrendChart
              title="Credit inflow by day"
              subtitle="A short-range view of the money coming in."
              points={creditDailyTrend}
            />
          </section>

          <section className="content-grid analytics-grid">
            <TrendChart
              title="Credit inflow by month"
              subtitle="A wider read on how income and transfers land over time."
              points={creditMonthlyTrend}
            />
            <PaymentMethodBreakdown
              totals={creditTransactions.reduce(
                (accumulator, transaction) => ({
                  ...accumulator,
                  [transaction.paymentMethod]:
                    accumulator[transaction.paymentMethod] + transaction.amount
                }),
                {
                  UPI: 0,
                  Card: 0,
                  NetBanking: 0,
                  Wallet: 0,
                  Cash: 0,
                  Other: 0
                }
              )}
            />
          </section>

          <TransactionTable transactions={creditTransactions} onUpdate={updateExpense} />
        </>
      ) : null}

      {activeSection === "recoveries" ? (
        <>
          <section className="hero hero-compact">
            <div className="hero-copy-block">
              <p className="eyebrow">Recoveries</p>
              <h1>Track money that should come back to you.</h1>
              <p className="hero-copy">
                Use this view for split payments, temporary transfers, and anything you expect to receive
                back later. When it comes in, mark it received and we will add it to credits.
              </p>
            </div>

            <div className="summary-grid">
              <SummaryCard
                label="Open recoveries"
                value={String(recoveryTransactions.length)}
                helper="Payments waiting to be collected"
                tone="accent"
              />
              <SummaryCard
                label="Due now"
                value={String(dueRecoveries.length)}
                helper="Recoveries whose reminder date has arrived"
              />
              <SummaryCard
                label="Expected back"
                value={formatCurrency(
                  recoveryTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
                  "INR",
                  "en-IN"
                )}
                helper="Total currently recoverable"
              />
            </div>
          </section>

          <RecoveriesBoard transactions={transactions} onMarkReceived={markRecoveryReceived} />
        </>
      ) : null}

      {activeSection === "savings" ? (
        <>
          <section className="hero hero-compact">
            <div className="hero-copy-block">
              <p className="eyebrow">Savings</p>
              <h1>Keep money set aside visible as its own story.</h1>
              <p className="hero-copy">
                This dashboard focuses only on transactions categorized as savings, so you can track how
                much you are intentionally moving away from day-to-day spending.
              </p>
            </div>

            <div className="summary-grid">
              <SummaryCard
                label="Total saved"
                value={formatCurrency(totalSaved, "INR", "en-IN")}
                helper="Savings-category debit transactions"
                tone="accent"
              />
              <SummaryCard
                label="This month"
                value={formatCurrency(monthlySaved, "INR", "en-IN")}
                helper="Savings recorded in the current month"
              />
              <SummaryCard
                label="Savings entries"
                value={String(savingsTransactions.length)}
                helper="Records visible in this focused view"
              />
            </div>
          </section>

          <FiltersBar
            filters={{ ...filters, category: "Savings" }}
            onChange={(nextFilters) => setFilters({ ...nextFilters, category: "Savings" })}
          />

          <section className="content-grid analytics-grid">
            <PaymentMethodBreakdown totals={savingsPaymentTotals} />
            <TrendChart
              title="Savings activity by day"
              subtitle="A short-range view of how frequently you move money into savings."
              points={savingsTrendPoints}
            />
          </section>

          <section className="content-grid analytics-grid">
            <TrendChart
              title="Savings activity by month"
              subtitle="A wider view of how consistently savings contributions are happening."
              points={savingsMonthlyPoints}
            />
            <CategoryBreakdown
              totals={{
                Food: 0,
                Transport: 0,
                Shopping: 0,
                Bills: 0,
                Health: 0,
                Entertainment: 0,
                Travel: 0,
                Groceries: 0,
                Recharge: 0,
                Education: 0,
                Rent: 0,
                Savings: totalSaved,
                Salary: 0,
                Transfer: 0,
                Other: 0
              }}
              activeCategory="Savings"
              onSelectCategory={() => openSavingsDashboard()}
            />
          </section>

          <TransactionTable transactions={savingsTransactions} onUpdate={updateExpense} />
        </>
      ) : null}

      {activeSection === "payment-history" ? (
        <>
          <section className="hero hero-compact">
            <div className="hero-copy-block">
              <p className="eyebrow">Payment history</p>
              <h1>See how spending moves across methods and time.</h1>
              <p className="hero-copy">
                Use this view to inspect the payment rails your money moves through, then jump back into
                transactions whenever something needs correction.
              </p>
            </div>

            <div className="summary-grid">
              <SummaryCard
                label="UPI share"
                value={formatCurrency(summary.paymentMethodTotals.UPI, "INR", "en-IN")}
                helper="Fastest-moving payment rail"
                tone="accent"
              />
              <SummaryCard
                label="Card share"
                value={formatCurrency(summary.paymentMethodTotals.Card, "INR", "en-IN")}
                helper="Card spending in current filter"
              />
              <SummaryCard
                label="Other methods"
                value={formatCurrency(
                  summary.totalSpent - summary.paymentMethodTotals.UPI - summary.paymentMethodTotals.Card,
                  "INR",
                  "en-IN"
                )}
                helper="Cash, wallet, net banking, and more"
              />
            </div>
          </section>

          <FiltersBar filters={filters} onChange={setFilters} />

          <section className="content-grid analytics-grid">
            <PaymentMethodBreakdown totals={summary.paymentMethodTotals} />
            <TrendChart
              title="Monthly payment history"
              subtitle="A compact read of how your outgoing payments evolve over time."
              points={summary.monthlyTrend}
            />
          </section>

          <TransactionTable transactions={filteredTransactions} onUpdate={updateExpense} />
        </>
      ) : null}

      {activeSection === "due-payments" ? (
        <>
          <section className="hero hero-compact">
            <div className="hero-copy-block">
              <p className="eyebrow">Due payments</p>
              <h1>Stay ahead of the payments that can surprise you later.</h1>
              <p className="hero-copy">
                This board watches recurring-style categories like rent, bills, recharge, and education so
                they stay visible even when the dashboard is focused on daily spending.
              </p>
            </div>
            <div className="summary-grid">
              <SummaryCard
                label="Recurring categories"
                value={String(
                  transactions.filter((transaction) =>
                    ["Rent", "Bills", "Recharge", "Education"].includes(transaction.category)
                  ).length
                )}
                helper="Recent items the system can watch"
                tone="accent"
              />
              <SummaryCard
                label="Bills + recharge"
                value={formatCurrency(
                  summary.categoryTotals.Bills + summary.categoryTotals.Recharge,
                  "INR",
                  "en-IN"
                )}
                helper="Current filtered total"
              />
              <SummaryCard
                label="Rent"
                value={formatCurrency(summary.categoryTotals.Rent, "INR", "en-IN")}
                helper="Current filtered total"
              />
            </div>
          </section>

          <DuePaymentsBoard transactions={transactions} />

          <CategoryBreakdown totals={summary.categoryTotals} />
        </>
      ) : null}

      {isComposerOpen ? (
        <div className="composer-overlay" role="dialog" aria-modal="true" aria-label="Add expense">
          <div className="composer-shell">
            <ExpenseForm
              transactions={transactions}
              onSubmit={addExpense}
              onCancel={() => setIsComposerOpen(false)}
              eyebrow="Add expense"
              title="Capture a transaction without leaving your workflow"
            />
          </div>
        </div>
      ) : null}

      {activeRecoveryPopup ? (
        <RecoveryReminderPopup
          transaction={activeRecoveryPopup}
          onMarkReceived={markRecoveryReceived}
          onDismiss={() =>
            setDismissedRecoveryIds((currentIds) => [...currentIds, activeRecoveryPopup.id])
          }
        />
      ) : null}
    </main>
  );
};

export default App;
