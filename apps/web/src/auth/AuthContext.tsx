import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ApiError, readAccessToken, writeAccessToken } from "../services/api";
import {
  getMeWithApi,
  loginWithApi,
  logoutWithApi,
  registerWithApi,
  type AuthSession
} from "../services/authApi";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface LoginInput {
  email: string;
  password: string;
}

type SignupInput = LoginInput;

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (input: LoginInput) => Promise<{ ok: boolean; error?: string }>;
  signup: (input: SignupInput) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const SESSION_STORAGE_KEY = "expenses-tracker-auth-session";

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredSession = (): AuthUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const writeStoredSession = (user: AuthUser | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
};

const normalizeAuthError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "That email or password was rejected by the server.";
    }
    if (error.status === 409) {
      return "An account already exists for that email.";
    }
    return "The server could not complete that auth request.";
  }

  if (error instanceof TypeError) {
    return "Unable to reach the backend. Check that the API is running.";
  }

  return "Something went wrong while contacting the auth service.";
};

const applySession = (session: AuthSession, setUser: (user: AuthUser | null) => void) => {
  setUser(session.user);
  writeStoredSession(session.user);
  writeAccessToken(session.accessToken);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedToken = readAccessToken();
    const storedUser = readStoredSession();

    if (!storedToken) {
      setUser(null);
      setIsAuthReady(true);
      return;
    }

    if (storedUser) {
      setUser(storedUser);
    }

    const hydrateSession = async () => {
      try {
        const nextUser = await getMeWithApi();
        setUser(nextUser);
        writeStoredSession(nextUser);
      } catch {
        writeAccessToken(null);
        writeStoredSession(null);
        setUser(null);
      } finally {
        setIsAuthReady(true);
      }
    };

    void hydrateSession();
  }, []);

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    try {
      const session = await loginWithApi({
        email: email.trim().toLowerCase(),
        password
      });
      applySession(session, setUser);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: normalizeAuthError(error)
      };
    }
  };

  const signup: AuthContextValue["signup"] = async ({ email, password }) => {
    try {
      const session = await registerWithApi({
        email: email.trim().toLowerCase(),
        password
      });
      applySession(session, setUser);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: normalizeAuthError(error)
      };
    }
  };

  const logout = async () => {
    try {
      await logoutWithApi();
    } catch {
      // Clear local auth state even if backend logout fails.
    } finally {
      writeAccessToken(null);
      writeStoredSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAuthReady,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
