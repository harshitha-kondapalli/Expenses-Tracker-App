import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";

type AuthMode = "login" | "signup";

export const AuthScreen = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Fill in all required fields to continue.");
      return;
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    const result = isSignup
      ? await signup({
          email,
          password
        })
      : await login({
          email,
          password
        });

    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
    }

    setIsSubmitting(false);
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="auth-badge-row">
          <p className="eyebrow">Expense tracker</p>
          <span className="auth-badge">Private by account</span>
        </div>

        <div className="auth-copy">
          <h1>One clean home for expenses, credits, savings, and money you need back.</h1>
          <p>
            Track personal finances in a workspace that feels fast to use and easy to trust. Each account
            gets its own view, so one person’s updates do not leak into anyone else’s ledger.
          </p>
        </div>

        <div className="auth-snapshot">
          <article className="auth-stat-card auth-stat-card-strong">
            <span>Single-line capture</span>
            <strong>`100 vegetables`</strong>
            <p>Parse fast manual entries into amount, category, note, and payment method.</p>
          </article>
          <article className="auth-stat-card">
            <span>Focused dashboards</span>
            <strong>Debits, credits, savings</strong>
            <p>See what went out, what came in, and what is still expected back.</p>
          </article>
        </div>

        <div className="auth-story-grid">
          <article className="auth-story-card">
            <span>Why sign in</span>
            <strong>Your own ledger, not a shared feed</strong>
            <p>Authentication is the base layer for user-specific expenses, credits, reminders, and edits.</p>
          </article>
          <article className="auth-story-card">
            <span>What comes next</span>
            <strong>Ready for backend auth</strong>
            <p>This frontend shell is designed to plug into FastAPI login, `GET /me`, and user-scoped data.</p>
          </article>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-top">
          <div>
            <p className="eyebrow">{isSignup ? "Create account" : "Welcome back"}</p>
            <h2>{isSignup ? "Start your own ledger" : "Sign in to your workspace"}</h2>
            <p className="auth-panel-copy">
              {isSignup
                ? "Create a personal workspace to keep your transactions, reminders, and savings view separate."
                : "Pick up where you left off and jump straight into your private dashboard."}
            </p>
          </div>

          <div className="auth-mode-switch" role="tablist" aria-label="Authentication modes">
            <button
              type="button"
              className={mode === "login" ? "nav-chip nav-chip-active" : "nav-chip"}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === "signup" ? "nav-chip nav-chip-active" : "nav-chip"}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="munna@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="primary-cta auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isSignup ? "Create account" : "Login"}
          </button>
        </form>

        <div className="auth-footnote">
          <strong>Current phase</strong>
          <p>
            This screen is frontend-auth for now. Next we can connect it to FastAPI with real user
            accounts, sessions, and database-scoped records.
          </p>
        </div>
      </section>
    </main>
  );
};
