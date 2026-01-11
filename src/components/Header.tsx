import { Leaf, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { cn } from '@/lib/utils';
import type { User, Ticket } from '@/types/api';

interface HeaderProps {
  user: User;
  tickets: Ticket[];
  onSignOut: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ user, tickets, onSignOut, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full px-3 sm:px-4 md:px-6 flex items-center justify-between max-w-[1800px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-foreground glow-text">StreetSweep AI</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Volunteer Dashboard</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-muted-foreground hover:text-foreground h-9 w-9 sm:h-10 sm:w-10"
              aria-label="Refresh data"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          )}
          
          <ProfileDropdown user={user} tickets={tickets} onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
}
