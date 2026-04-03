export type AppSection =
  | "dashboard"
  | "transactions"
  | "credits"
  | "recoveries"
  | "savings"
  | "payment-history"
  | "due-payments";

interface AppHeaderProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  onOpenComposer: () => void;
  userName: string;
  userEmail: string;
  onLogout: () => void | Promise<void>;
}

const sections: Array<{ id: AppSection; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "transactions", label: "Transactions" },
  { id: "credits", label: "Credits" },
  { id: "recoveries", label: "Recoveries" },
  { id: "savings", label: "Savings" },
  { id: "payment-history", label: "Payment History" },
  { id: "due-payments", label: "Due Payments" }
];

export const AppHeader = ({
  activeSection,
  onNavigate,
  onOpenComposer,
  userName,
  userEmail,
  onLogout
}: AppHeaderProps) => (
  <header className="app-topbar">
    <div className="brand-lockup">
      <p className="eyebrow">Expense tracker</p>
      <strong>Money cockpit</strong>
    </div>

    <div className="topbar-actions">
      <nav className="top-nav" aria-label="Primary">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={section.id === activeSection ? "nav-chip nav-chip-active" : "nav-chip"}
            onClick={() => onNavigate(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <button type="button" className="primary-cta" onClick={onOpenComposer}>
        Add Expense
      </button>

      <div className="user-chip">
        <div>
          <strong>{userName}</strong>
          <p>{userEmail}</p>
        </div>
        <button type="button" className="ghost-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  </header>
);
