import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/components/Header';
import { TicketCard } from '@/components/TicketCard';
import { MapView } from '@/components/MapView';
import { TicketDetailDrawer } from '@/components/TicketDetailDrawer';
import { Leaderboard } from '@/components/Leaderboard';
import { CreateTicketDialog } from '@/components/CreateTicketDialog';
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
  AlertCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import type { Ticket, TicketPriority, TicketState, Squad, User, LeaderboardEntry } from '@/types/api';
import { getTickets, resolveTicket, getLeaderboard } from '@/services/api';

type Tab = 'tickets' | 'insights' | 'leaderboard';
type MobileView = 'list' | 'map';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

export function Dashboard({ user, onSignOut }: DashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('tickets');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardTotal, setLeaderboardTotal] = useState(0);
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  
  // Filter state - default: only OPEN selected, all priorities
  const [selectedStates, setSelectedStates] = useState<Set<TicketState>>(new Set(['OPEN']));
  const [selectedPriorities, setSelectedPriorities] = useState<Set<TicketPriority>>(new Set(['LOW', 'MEDIUM', 'HIGH']));

  const userName = user.name;

  const toggleState = (state: TicketState) => {
    setSelectedStates(prev => {
      const next = new Set(prev);
      if (next.has(state)) {
        next.delete(state);
      } else {
        next.add(state);
      }
      return next;
    });
  };

  const togglePriority = (priority: TicketPriority) => {
    setSelectedPriorities(prev => {
      const next = new Set(prev);
      if (next.has(priority)) {
        next.delete(priority);
      } else {
        next.add(priority);
      }
      return next;
    });
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const stateMatch = selectedStates.size === 0 || selectedStates.has(ticket.state);
      const priorityMatch = selectedPriorities.size === 0 || selectedPriorities.has(ticket.priority);
      return stateMatch && priorityMatch;
    });
  }, [tickets, selectedStates, selectedPriorities]);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await getTickets();
      setTickets(data);
      if (selectedTicket) {
        const updated = data.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tickets',
        variant: 'destructive',
      });
    }
  }, [selectedTicket]);

  const fetchLeaderboard = useCallback(async (page: number = 1) => {
    try {
      const data = await getLeaderboard(page, 10);
      setLeaderboard(data.entries);
      setLeaderboardTotal(data.total);
      setLeaderboardPage(page);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTickets(), fetchLeaderboard()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTickets, fetchLeaderboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTickets(), fetchLeaderboard(leaderboardPage)]);
    setIsRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Data updated successfully',
    });
  };

  const claimTicket = useCallback((id: string, squad?: Squad) => {
    // Note: The current API doesn't have a claim endpoint, so we simulate locally
    // In production, you'd call an API endpoint here
    const updated = tickets.map(t => 
      t.id === id ? { 
        ...t, 
        state: 'CLAIMED' as const, 
        claimedBy: squad ? squad.name : userName, 
        claimedAt: new Date().toISOString(),
        squad: squad 
      } : t
    );
    setTickets(updated);
    const found = updated.find(t => t.id === id);
    if (found) setSelectedTicket(found);
    
    toast({
      title: 'Ticket Claimed!',
      description: `You've claimed this ticket. Head to the location to clean it up!`,
    });
  }, [tickets, userName]);

  const unclaimTicket = useCallback((id: string) => {
    // Note: The current API doesn't have an unclaim endpoint, so we simulate locally
    const updated = tickets.map(t => 
      t.id === id ? { ...t, state: 'OPEN' as const, claimedBy: undefined, claimedAt: undefined, squad: undefined } : t
    );
    setTickets(updated);
    const found = updated.find(t => t.id === id);
    if (found) setSelectedTicket(found);
    
    toast({
      title: 'Ticket Released',
      description: 'The ticket is now available for others.',
    });
  }, [tickets]);

  const completeTicket = useCallback(async (id: string, afterImageUrl: string) => {
    try {
      await resolveTicket({ ticket_id: id, user_id: user._id });
      
      const updated = tickets.map(t => 
        t.id === id ? { ...t, state: 'COMPLETED' as const, afterImageUrl, completedAt: new Date().toISOString() } : t
      );
      setTickets(updated);
      const found = updated.find(t => t.id === id);
      if (found) setSelectedTicket(found);
      
      toast({
        title: '🎉 Cleanup Complete!',
        description: 'Amazing work! Thank you for helping clean up the community.',
      });
      
      // Refresh leaderboard after completion
      fetchLeaderboard(leaderboardPage);
    } catch (error) {
      console.error('Failed to complete ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark ticket as complete',
        variant: 'destructive',
      });
    }
  }, [tickets, user._id, fetchLeaderboard, leaderboardPage]);

  const handleTicketCreated = useCallback((newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
    toast({
      title: 'Ticket Created!',
      description: 'Your litter report has been submitted.',
    });
  }, []);

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

  // Mobile Layout
  if (isMobile) {
    return (
      <>
        <div className="min-h-screen bg-background flex flex-col">
          <Header userName={userName} onSignOut={onSignOut} onRefresh={handleRefresh} isRefreshing={isRefreshing} />

          {/* Mobile View Toggle */}
          <div className="flex border-b border-border bg-card">
            <button
              onClick={() => setMobileView('list')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                mobileView === 'list'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                mobileView === 'map'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Map className="w-4 h-4" />
              Map
            </button>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-hidden">
            {mobileView === 'list' ? (
              <div className="h-full flex flex-col">
                {/* Mobile Tabs */}
                <div className="flex border-b border-border p-2 gap-1 bg-card">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors",
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-3">
                    {/* Tickets Tab */}
                    {activeTab === 'tickets' && (
                      <div className="space-y-3">
                        <CreateTicketDialog onTicketCreated={handleTicketCreated} />
                        
                        {/* Compact Filters for Mobile */}
                        <div className="space-y-2 p-2 bg-muted/50 rounded-lg border border-border">
                          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                            <Filter className="w-3 h-3" />
                            Filters
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {(['OPEN', 'CLAIMED', 'COMPLETED'] as TicketState[]).map(state => (
                              <button
                                key={state}
                                onClick={() => toggleState(state)}
                                className={cn(
                                  "px-2 py-1 text-xs font-medium rounded-full border transition-colors",
                                  selectedStates.has(state)
                                    ? state === 'OPEN' 
                                      ? "bg-orange-500/20 border-orange-500 text-orange-500"
                                      : state === 'CLAIMED'
                                      ? "bg-blue-500/20 border-blue-500 text-blue-500"
                                      : "bg-green-500/20 border-green-500 text-green-500"
                                    : "bg-background border-border text-muted-foreground"
                                )}
                              >
                                {state === 'OPEN' ? 'Open' : state === 'CLAIMED' ? 'Claimed' : 'Done'}
                              </button>
                            ))}
                            {(['HIGH', 'MEDIUM', 'LOW'] as TicketPriority[]).map(priority => (
                              <button
                                key={priority}
                                onClick={() => togglePriority(priority)}
                                className={cn(
                                  "px-2 py-1 text-xs font-medium rounded-full border transition-colors",
                                  selectedPriorities.has(priority)
                                    ? priority === 'HIGH'
                                      ? "bg-destructive/20 border-destructive text-destructive"
                                      : priority === 'MEDIUM'
                                      ? "bg-warning/20 border-warning text-warning"
                                      : "bg-primary/20 border-primary text-primary"
                                    : "bg-background border-border text-muted-foreground"
                                )}
                              >
                                {priority === 'HIGH' ? 'High' : priority === 'MEDIUM' ? 'Med' : 'Low'}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 bg-muted rounded-lg text-center">
                            <AlertCircle className="w-4 h-4 mx-auto mb-0.5 text-orange-500" />
                            <p className="text-sm font-bold">{stats.totalOpen}</p>
                            <p className="text-[10px] text-muted-foreground">Open</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg text-center">
                            <Recycle className="w-4 h-4 mx-auto mb-0.5 text-blue-500" />
                            <p className="text-sm font-bold">{stats.totalClaimed}</p>
                            <p className="text-[10px] text-muted-foreground">Claimed</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg text-center">
                            <CheckCircle2 className="w-4 h-4 mx-auto mb-0.5 text-green-500" />
                            <p className="text-sm font-bold">{stats.totalCompleted}</p>
                            <p className="text-[10px] text-muted-foreground">Done</p>
                          </div>
                        </div>
                        
                        {isLoading ? (
                          <div className="py-8 flex flex-col items-center text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin mb-2" />
                            <p className="text-sm">Loading...</p>
                          </div>
                        ) : filteredTickets.length === 0 ? (
                          <div className="py-8 text-center text-muted-foreground">
                            <Map className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No tickets match filters</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
                            </p>
                            {filteredTickets.map((ticket) => (
                              <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                isSelected={selectedTicket?.id === ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Insights Tab */}
                    {activeTab === 'insights' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 bg-muted rounded-lg text-center">
                            <p className="text-lg font-bold">{stats.totalOpen}</p>
                            <p className="text-xs text-muted-foreground">Open</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg text-center">
                            <p className="text-lg font-bold">{stats.totalClaimed}</p>
                            <p className="text-xs text-muted-foreground">Claimed</p>
                          </div>
                          <div className="p-2 bg-muted rounded-lg text-center">
                            <p className="text-lg font-bold">{stats.totalCompleted}</p>
                            <p className="text-xs text-muted-foreground">Done</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground text-center py-6">
                          Charts coming soon...
                        </p>
                      </div>
                    )}

                    {/* Leaderboard Tab */}
                    {activeTab === 'leaderboard' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <Trophy className="w-4 h-4 text-primary" />
                          <h2 className="font-semibold text-foreground text-sm">Leaderboard</h2>
                        </div>
                        <Leaderboard 
                          entries={leaderboard} 
                          currentPage={leaderboardPage}
                          totalPages={Math.ceil(leaderboardTotal / 10)}
                          onPageChange={fetchLeaderboard}
                        />
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="h-[calc(100vh-8rem)] p-2">
                <MapView 
                  tickets={tickets}
                  selectedTicket={selectedTicket}
                  onSelectTicket={setSelectedTicket}
                  showHeatmap={showHeatmap} 
                  onToggleHeatmap={() => setShowHeatmap(!showHeatmap)} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Ticket Detail Drawer */}
        {selectedTicket && (
          <TicketDetailDrawer 
            userName={userName}
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onClaim={(squad) => claimTicket(selectedTicket.id, squad)}
            onUnclaim={() => unclaimTicket(selectedTicket.id)}
            onComplete={(afterImageUrl) => completeTicket(selectedTicket.id, afterImageUrl)}
          />
        )}
      </>
    );
  }

  // Desktop Layout
  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <Header userName={userName} onSignOut={onSignOut} onRefresh={handleRefresh} isRefreshing={isRefreshing} />

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
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  {/* Tickets Tab */}
                  {activeTab === 'tickets' && (
                    <div className="space-y-4">
                      {/* Create Ticket Button */}
                      <CreateTicketDialog onTicketCreated={handleTicketCreated} />
                      
                      {/* Filters */}
                      <div className="space-y-3 p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Filter className="w-4 h-4" />
                          Filters
                        </div>
                        
                        {/* State Filters */}
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground">Status</p>
                          <div className="flex gap-2">
                            {(['OPEN', 'CLAIMED', 'COMPLETED'] as TicketState[]).map(state => (
                              <button
                                key={state}
                                onClick={() => toggleState(state)}
                                className={cn(
                                  "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                                  selectedStates.has(state)
                                    ? state === 'OPEN' 
                                      ? "bg-orange-500/20 border-orange-500 text-orange-500"
                                      : state === 'CLAIMED'
                                      ? "bg-blue-500/20 border-blue-500 text-blue-500"
                                      : "bg-green-500/20 border-green-500 text-green-500"
                                    : "bg-background border-border text-muted-foreground hover:border-primary/50"
                                )}
                              >
                                {state === 'OPEN' ? 'Open' : state === 'CLAIMED' ? 'Claimed' : 'Completed'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Priority Filters */}
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground">Priority</p>
                          <div className="flex gap-2">
                            {(['HIGH', 'MEDIUM', 'LOW'] as TicketPriority[]).map(priority => (
                              <button
                                key={priority}
                                onClick={() => togglePriority(priority)}
                                className={cn(
                                  "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                                  selectedPriorities.has(priority)
                                    ? priority === 'HIGH'
                                      ? "bg-destructive/20 border-destructive text-destructive"
                                      : priority === 'MEDIUM'
                                      ? "bg-warning/20 border-warning text-warning"
                                      : "bg-primary/20 border-primary text-primary"
                                    : "bg-background border-border text-muted-foreground hover:border-primary/50"
                                )}
                              >
                                {priority === 'HIGH' ? 'High' : priority === 'MEDIUM' ? 'Medium' : 'Low'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
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
                      ) : filteredTickets.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                          <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>No tickets match filters</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
                          </p>
                          {filteredTickets.map((ticket, index) => (
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
                      <Leaderboard 
                        entries={leaderboard}
                        currentPage={leaderboardPage}
                        totalPages={Math.ceil(leaderboardTotal / 10)}
                        onPageChange={fetchLeaderboard}
                      />
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

          {/* Map - add isolation to prevent z-index conflicts */}
          <main className="flex-1 h-[calc(100vh-4rem)] p-4 isolate" style={{ zIndex: 1 }}>
            <MapView 
              tickets={tickets}
              selectedTicket={selectedTicket}
              onSelectTicket={setSelectedTicket}
              showHeatmap={showHeatmap} 
              onToggleHeatmap={() => setShowHeatmap(!showHeatmap)} 
            />
          </main>
        </div>
      </div>

      {/* Ticket Detail Drawer - OUTSIDE main container to avoid stacking context issues */}
      {selectedTicket && (
        <TicketDetailDrawer 
          userName={userName}
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onClaim={(squad) => claimTicket(selectedTicket.id, squad)}
          onUnclaim={() => unclaimTicket(selectedTicket.id)}
          onComplete={(afterImageUrl) => completeTicket(selectedTicket.id, afterImageUrl)}
        />
      )}
    </>
  );
}
