import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { TicketCard } from '@/components/TicketCard';
import { MapView } from '@/components/MapView';
import { TicketDetailDrawer } from '@/components/TicketDetailDrawer';
import { Leaderboard } from '@/components/Leaderboard';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  Trophy, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Recycle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Ticket, VolunteerStats, dummyLeaderboard, dummyTickets } from '@/data/dummyTickets';

type Tab = 'tickets' | 'insights' | 'leaderboard';

interface DashboardProps {
  userName: string;
  onSignOut: () => void;
}

const STORAGE_KEY = 'streetsweep_tickets';

function getStoredTickets(): Ticket[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyTickets));
  return dummyTickets;
}

function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export function Dashboard({ userName, onSignOut }: DashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('tickets');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [leaderboard] = useState<VolunteerStats[]>(dummyLeaderboard);

  useEffect(() => {
    const loaded = getStoredTickets();
    setTickets(loaded);
    setIsLoading(false);
  }, []);

  const refreshTickets = useCallback(() => {
    const loaded = getStoredTickets();
    setTickets(loaded);
    if (selectedTicket) {
      const updated = loaded.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [selectedTicket]);

  const claimTicket = useCallback((id: string) => {
    const updated = tickets.map(t => 
      t.id === id ? { ...t, state: 'CLAIMED' as const, claimedBy: userName, claimedAt: new Date().toISOString() } : t
    );
    saveTickets(updated);
    setTickets(updated);
    const found = updated.find(t => t.id === id);
    if (found) setSelectedTicket(found);
  }, [tickets, userName]);

  const unclaimTicket = useCallback((id: string) => {
    const updated = tickets.map(t => 
      t.id === id ? { ...t, state: 'OPEN' as const, claimedBy: undefined, claimedAt: undefined } : t
    );
    saveTickets(updated);
    setTickets(updated);
    const found = updated.find(t => t.id === id);
    if (found) setSelectedTicket(found);
  }, [tickets]);

  const completeTicket = useCallback((id: string, afterImageUrl: string) => {
    const updated = tickets.map(t => 
      t.id === id ? { ...t, state: 'COMPLETED' as const, afterImageUrl, completedAt: new Date().toISOString() } : t
    );
    saveTickets(updated);
    setTickets(updated);
    const found = updated.find(t => t.id === id);
    if (found) setSelectedTicket(found);
  }, [tickets]);

  const stats = {
    totalOpen: tickets.filter(t => t.state === 'OPEN').length,
    totalClaimed: tickets.filter(t => t.state === 'CLAIMED').length,
    totalCompleted: tickets.filter(t => t.state === 'COMPLETED').length,
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'tickets', label: 'Tickets', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Leaders', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header userName={userName} onSignOut={onSignOut} />

      <div className="flex-1 flex relative">
        {/* Left Panel */}
        <motion.aside
          initial={false}
          animate={{ 
            width: leftPanelCollapsed ? 0 : 420,
            opacity: leftPanelCollapsed ? 0 : 1,
          }}
          transition={{ duration: 0.3 }}
          className={cn(
            "h-[calc(100vh-4rem)] border-r border-border bg-card flex-shrink-0 overflow-hidden",
            leftPanelCollapsed && "border-r-0"
          )}
        >
          <div className="w-[420px] h-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-border p-2 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <AlertCircle className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                        <p className="text-lg font-bold">{stats.totalOpen}</p>
                        <p className="text-xs text-muted-foreground">Open</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <Recycle className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-lg font-bold">{stats.totalClaimed}</p>
                        <p className="text-xs text-muted-foreground">Claimed</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-500" />
                        <p className="text-lg font-bold">{stats.totalCompleted}</p>
                        <p className="text-xs text-muted-foreground">Done</p>
                      </div>
                    </div>
                    
                    {isLoading ? (
                      <div className="py-12 flex flex-col items-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p>Loading tickets...</p>
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No tickets found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
                        </p>
                        {tickets.map((ticket, index) => (
                          <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <TicketCard
                              ticket={ticket}
                              isSelected={selectedTicket?.id === ticket.id}
                              onClick={() => setSelectedTicket(ticket)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Insights Tab */}
                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-lg font-bold">{stats.totalOpen}</p>
                        <p className="text-xs text-muted-foreground">Open</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-lg font-bold">{stats.totalClaimed}</p>
                        <p className="text-xs text-muted-foreground">Claimed</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-lg font-bold">{stats.totalCompleted}</p>
                        <p className="text-xs text-muted-foreground">Done</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Charts coming soon...
                    </p>
                  </div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <Trophy className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-foreground">Volunteer Leaderboard</h2>
                    </div>
                    <Leaderboard leaderboard={leaderboard} />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </motion.aside>

        {/* Panel toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 rounded-l-none border-l-0 bg-card h-16"
          style={{ left: leftPanelCollapsed ? 0 : 420 }}
        >
          {leftPanelCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>

        {/* Map */}
        <main className="flex-1 h-[calc(100vh-4rem)] p-4">
          <MapView 
            tickets={tickets}
            selectedTicket={selectedTicket}
            onSelectTicket={setSelectedTicket}
            showHeatmap={showHeatmap} 
            onToggleHeatmap={() => setShowHeatmap(!showHeatmap)} 
          />
        </main>

        {/* Ticket Detail Drawer */}
        {selectedTicket && (
          <TicketDetailDrawer 
            userName={userName}
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onClaim={() => claimTicket(selectedTicket.id)}
            onUnclaim={() => unclaimTicket(selectedTicket.id)}
            onComplete={(afterImageUrl) => completeTicket(selectedTicket.id, afterImageUrl)}
          />
        )}
      </div>
    </div>
  );
}