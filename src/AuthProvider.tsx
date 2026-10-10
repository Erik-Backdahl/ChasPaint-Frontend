import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, logout as logoutRequest } from "./api/UserService";

type User = {
  email: string;
};

type AuthContextValue = {
  user: User | null; //null if not logged in
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const defaultAuthContext: AuthContextValue = {
  user: null,
  refreshUser: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function refreshUser() {
    setUser(await getCurrentUser());
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
