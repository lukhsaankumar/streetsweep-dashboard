import { User, LogOut, Trophy, CheckCircle2, Recycle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User as UserType, Ticket } from '@/types/api';

interface ProfileDropdownProps {
  user: UserType;
  tickets: Ticket[];
  onSignOut: () => void;
}

export function ProfileDropdown({ user, tickets, onSignOut }: ProfileDropdownProps) {
  // Filter tickets claimed by this user
  const claimedTickets = tickets.filter(
    (t) => t.claimedBy === user._id && t.state === 'CLAIMED'
  );
  
  // Filter tickets resolved by this user (state is COMPLETED and was claimed by user)
  const resolvedTickets = tickets.filter(
    (t) => t.claimedBy === user._id && t.state === 'COMPLETED'
  );

  const points = user.points ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Open profile menu"
        >
          <User className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-card border-border"
        sideOffset={8}
      >
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-foreground capitalize">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-border" />
        
        {/* Stats */}
        <div className="px-2 py-3 space-y-3">
          <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-primary/10">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Points</span>
            </div>
            <span className="text-sm font-bold text-primary">{points}</span>
          </div>
          
          {/* Points Info */}
          <div className="px-2 py-2 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Info className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">How Points Work</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
              <div className="p-1 rounded bg-primary/10">
                <div className="font-bold text-primary">+2</div>
                <div className="text-muted-foreground">Low</div>
              </div>
              <div className="p-1 rounded bg-warning/10">
                <div className="font-bold text-warning">+4</div>
                <div className="text-muted-foreground">Med</div>
              </div>
              <div className="p-1 rounded bg-destructive/10">
                <div className="font-bold text-destructive">+6</div>
                <div className="text-muted-foreground">High</div>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
              Half points if cleanup unsuccessful
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted">
              <div className="flex items-center gap-1.5 mb-1">
                <Recycle className="w-3.5 h-3.5 text-info" />
                <span className="text-xs text-muted-foreground">Claimed</span>
              </div>
              <span className="text-lg font-bold text-foreground">{claimedTickets.length}</span>
            </div>
            
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span className="text-xs text-muted-foreground">Resolved</span>
              </div>
              <span className="text-lg font-bold text-foreground">{resolvedTickets.length}</span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator className="bg-border" />
        
        {/* Sign Out */}
        <DropdownMenuItem 
          onClick={onSignOut}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
