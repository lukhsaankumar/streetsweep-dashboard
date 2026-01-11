import { LogOut, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userName: string;
  onSignOut: () => void;
}

export function Header({ userName, onSignOut }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full px-4 md:px-6 flex items-center justify-between max-w-[1800px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground glow-text">StreetSweep AI</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Volunteer Dashboard</p>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground capitalize">{userName}</p>
            <p className="text-xs text-muted-foreground">Volunteer</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSignOut}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
