import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthCtx {
  user: { username: string } | null;
  login: (u: string, p: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const DEMO_USER = "administrador";
const DEMO_PASS = "CanalEjecutivo";
const STORAGE_KEY = "sst_demo_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (u: string, p: string) => {
    if (u.trim().toLowerCase() === DEMO_USER && p === DEMO_PASS) {
      const usr = { username: u };
      setUser(usr);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usr));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth dentro de AuthProvider");
  return ctx;
};
