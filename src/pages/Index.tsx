import { useAuth } from '@/contexts/AuthContext';
import { SignIn } from '@/components/SignIn';
import { Dashboard } from '@/components/Dashboard';
import { TicketsProvider } from '@/contexts/TicketsContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <SignIn />;
  }

  return (
    <TicketsProvider>
      <Dashboard />
    </TicketsProvider>
  );
};

export default Index;
