import { createContext } from "react";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "user";
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);