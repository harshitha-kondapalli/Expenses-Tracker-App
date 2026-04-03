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
  <header className="app-header">
    <div className="header-container">
      <div className="brand-section">
        <h1 className="brand-title">Money Cockpit</h1>
        <span className="brand-subtitle">Expense Tracker</span>
      </div>
      <br/>
      <nav className="main-navigation">
        <div className="nav-group">
          {sections.slice(0, 4).map((section) => (
            <button
              key={section.id}
              type="button"
              className={`nav-link ${section.id === activeSection ? "nav-link-active" : ""}`}
              onClick={() => onNavigate(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>
        <div className="nav-group">
          {sections.slice(4).map((section) => (
            <button
              key={section.id}
              type="button"
              className={`nav-link ${section.id === activeSection ? "nav-link-active" : ""}`}
              onClick={() => onNavigate(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="header-actions">
        <button type="button" className="btn-primary" onClick={onOpenComposer}>
          + Add Expense
        </button>

        <div className="user-menu">
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-email">{userEmail}</span>
          </div>
          <button type="button" className="btn-ghost" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
);
