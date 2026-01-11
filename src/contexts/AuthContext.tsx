import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User } from '@/types/api';
import { 
  getStoredToken, 
  getStoredUser, 
  setStoredUser, 
  clearStoredToken,
  login as apiLogin,
  createUser as apiCreateUser,
  getAllUsers
} from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin({ email, password });
    setToken(result.token);
    
    // Try to find full user data from users list
    try {
      const users = await getAllUsers();
      const fullUser = users.find(u => u.email === email);
      if (fullUser) {
        setUser(fullUser);
        setStoredUser(fullUser);
      } else {
        setUser(result.user);
        setStoredUser(result.user);
      }
    } catch {
      setUser(result.user);
      setStoredUser(result.user);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    // Create user first
    const created = await apiCreateUser({ name, email, password });
    
    // Then login to get token
    const loginResult = await apiLogin({ email, password });
    setToken(loginResult.token);
    
    const newUser: User = {
      _id: created.user_id,
      name: created.name,
      email: created.email,
      points: 0,
      badges: [],
    };
    
    setUser(newUser);
    setStoredUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        signup,
        logout,
      }}
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
