import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  clinicianId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [clinicianId, setClinicianId] = useState<string | null>(() => localStorage.getItem('clinicianId'));

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; refreshToken: string; user: AuthUser }>('/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));

    // Fetch clinicianId from /auth/me
    const me = await api.get<{ clinician?: { id: string } }>('/auth/me');
    if (me.clinician) {
      setClinicianId(me.clinician.id);
      localStorage.setItem('clinicianId', me.clinician.id);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setClinicianId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('clinicianId');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, clinicianId, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

