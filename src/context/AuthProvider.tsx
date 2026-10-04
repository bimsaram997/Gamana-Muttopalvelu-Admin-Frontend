import { useState } from "react";
import { AuthContext, type User } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    if (password.length < 4) {
      throw new Error("Password must be at least 4 characters (mock rule)");
    }
    const fakeUser: User = {
      id: 1,
      email,
      name: email.split("@")[0],
      role: "admin",
    };
    const fakeToken = "mock-jwt-token-" + Date.now();
    setUser(fakeUser);
    setToken(fakeToken);
    localStorage.setItem("token", fakeToken);
    localStorage.setItem("user", JSON.stringify(fakeUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}