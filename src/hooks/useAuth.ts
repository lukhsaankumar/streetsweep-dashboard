import { useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'streetsweep_user';

export interface User {
  name: string;
  signedInAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback((name: string) => {
    const newUser: User = {
      name: name.trim(),
      signedInAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isSignedIn: !!user,
    signIn,
    signOut,
  };
}
