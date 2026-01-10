import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/components/Dashboard';
import { TicketsProvider } from '@/contexts/TicketsContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { isSignedIn, isLoading, signIn } = useAuth();

  // Auto sign-in for testing
  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      signIn('Test User');
    }
  }, [isLoading, isSignedIn, signIn]);

  if (isLoading || !isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TicketsProvider>
      <Dashboard />
    </TicketsProvider>
  );
};

export default Index;
