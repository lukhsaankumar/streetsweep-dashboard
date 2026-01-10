import { useAccessibility } from '@/hooks/useAccessibility';
import { useAuth } from '@/contexts/AuthContext';
import { Contrast, Type, LogOut, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export function Header() {
  const { highContrast, largeText, toggleHighContrast, toggleLargeText } = useAccessibility();
  const { user, signOut } = useAuth();

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

        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Accessibility toggles */}
          <div className="hidden md:flex items-center gap-4 pr-4 border-r border-border">
            <div className="flex items-center gap-2">
              <Contrast className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">High Contrast</span>
              <Switch 
                checked={highContrast} 
                onCheckedChange={toggleHighContrast}
                aria-label="Toggle high contrast mode"
              />
            </div>
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Large Text</span>
              <Switch 
                checked={largeText} 
                onCheckedChange={toggleLargeText}
                aria-label="Toggle large text mode"
              />
            </div>
          </div>

          {/* Mobile accessibility button */}
          <div className="flex md:hidden gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleHighContrast}
              className={cn(highContrast && "bg-primary text-primary-foreground")}
              aria-label="Toggle high contrast"
            >
              <Contrast className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLargeText}
              className={cn(largeText && "bg-primary text-primary-foreground")}
              aria-label="Toggle large text"
            >
              <Type className="w-4 h-4" />
            </Button>
          </div>

          {/* User */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">Volunteer</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
