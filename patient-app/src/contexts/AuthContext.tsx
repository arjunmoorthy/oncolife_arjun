import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  patientId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedPatientId = localStorage.getItem('patientId');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (storedPatientId) setPatientId(storedPatientId);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('patientId');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{
      token: string;
      refreshToken: string;
      user: AuthUser & { phone?: string; createdAt: string; updatedAt: string };
    }>('/auth/login', { email, password });

    // Store token first so subsequent API calls are authenticated
    localStorage.setItem('token', res.token);
    setToken(res.token);

    const authUser: AuthUser = {
      id: res.user.id,
      email: res.user.email,
      firstName: res.user.firstName,
      lastName: res.user.lastName,
      role: res.user.role,
    };
    setUser(authUser);
    localStorage.setItem('user', JSON.stringify(authUser));

    // Fetch /auth/me to get patientId
    const me = await api.get<{
      patient?: { id: string };
      clinician?: { id: string };
    }>('/auth/me');
    if (me.patient) {
      setPatientId(me.patient.id);
      localStorage.setItem('patientId', me.patient.id);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPatientId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('patientId');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, patientId, login, logout, isAuthenticated: !!token, isLoading }}
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

