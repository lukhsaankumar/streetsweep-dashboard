import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Loader2, Leaf, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Simple user list
const ALLOWED_USERS = ['lukhsaan', 'admin', 'test'];
const AUTH_KEY = 'streetsweep_user';

const Index = () => {
  const [user, setUser] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      setUser(stored);
    }
    setIsAuthLoading(false);
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim().toLowerCase();
    
    if (ALLOWED_USERS.includes(trimmedName)) {
      localStorage.setItem(AUTH_KEY, trimmedName);
      setUser(trimmedName);
      setError('');
    } else {
      setError('User not found. Try: lukhsaan');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary/20 flex items-center justify-center">
              <Leaf className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-center text-foreground mb-2">
              StreetSweep AI
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              Enter your name to continue
            </p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
                autoFocus
              />
              
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={!name.trim()}
                className="w-full h-12 gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard userName={user} onSignOut={handleSignOut} />;
};

export default Index;