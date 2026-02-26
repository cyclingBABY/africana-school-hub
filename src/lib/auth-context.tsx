import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { LibraryUser, UserRole } from "./types";
import { mockUsers } from "./mock-data";

interface AuthContextType {
  user: LibraryUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isMember: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CREDENTIALS: Record<string, { password: string; userId: string }> = {
  "admin@library.ug": { password: "admin123", userId: "admin-1" },
  "member@library.ug": { password: "member123", userId: "member-1" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LibraryUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("lms_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("lms_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));

    const cred = CREDENTIALS[email.toLowerCase()];
    if (!cred || cred.password !== password) {
      return { success: false, error: "Invalid email or password" };
    }

    const foundUser = mockUsers.find((u) => u.id === cred.userId);
    if (!foundUser) {
      return { success: false, error: "User account not found" };
    }

    setUser(foundUser);
    localStorage.setItem("lms_user", JSON.stringify(foundUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lms_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin: user?.role === "admin",
        isMember: user?.role === "member",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
