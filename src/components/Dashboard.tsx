import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from '@/components/Header';
import { TicketCard } from '@/components/TicketCard';
import { MapView } from '@/components/MapView';
import { TicketDetailDrawer } from '@/components/TicketDetailDrawer';
import { Leaderboard } from '@/components/Leaderboard';
import { RewardsPopup } from '@/components/RewardsPopup';
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
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import type { Ticket, TicketPriority, TicketState, Squad, User, LeaderboardEntry } from '@/types/api';
import { getTickets, resolveTicket, getLeaderboard, getInsight, claimTicket as claimTicketApi, compareImages, getAllUsers } from '@/services/api';

type Tab = 'tickets' | 'insights' | 'leaderboard';
type MobileView = 'list' | 'map';
type PrioritySort = 'high-to-low' | 'low-to-high';

interface DashboardProps {
  user: User;
  onSignOut: () => void;
}

// Points calculation based on priority
const POINTS_CONFIG = {
  HIGH: { full: 6, half: 3 },
  MEDIUM: { full: 4, half: 2 },
  LOW: { full: 2, half: 1 },
};

// Track tickets that had failed cleanup attempts (for remaining points calculation)
const failedCleanupAttempts = new Set<string>();

export function Dashboard({ user, onSignOut }: DashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const selectedTicketRef = useRef<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('tickets');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allUsers, setAllUsers] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [leaderboardTotal, setLeaderboardTotal] = useState(0);
  const [mobileView, setMobileView] = useState<MobileView>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [insight, setInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const isMobile = useIsMobile();
  
  // Filter state - default: only OPEN selected, all priorities
  const [selectedStates, setSelectedStates] = useState<Set<TicketState>>(new Set(['OPEN']));
  const [selectedPriorities, setSelectedPriorities] = useState<Set<TicketPriority>>(new Set(['LOW', 'MEDIUM', 'HIGH']));
  const [prioritySort, setPrioritySort] = useState<PrioritySort>('high-to-low');

  const userName = user.name;

  // Keep ref in sync with state
  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);

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

  const priorityOrder: Record<TicketPriority, number> = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const filteredTickets = useMemo(() => {
    const filtered = tickets.filter(ticket => {
      const stateMatch = selectedStates.size === 0 || selectedStates.has(ticket.state);
      const priorityMatch = selectedPriorities.size === 0 || selectedPriorities.has(ticket.priority);
      return stateMatch && priorityMatch;
    });
    
    // Sort by priority
    return filtered.sort((a, b) => {
      const aOrder = priorityOrder[a.priority];
      const bOrder = priorityOrder[b.priority];
      return prioritySort === 'high-to-low' ? bOrder - aOrder : aOrder - bOrder;
    });
  }, [tickets, selectedStates, selectedPriorities, prioritySort]);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await getTickets();
      setTickets(data);
      // Use ref to avoid dependency that causes infinite loop
      if (selectedTicketRef.current) {
        const updated = data.find(t => t.id === selectedTicketRef.current!.id);
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
  }, []); // No dependencies - uses ref instead

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

  const fetchAllUsers = useCallback(async () => {
    try {
      const users = await getAllUsers();
      // Convert to LeaderboardEntry format for validation
      const usersWithRank = users.map((u, i) => ({
        _id: u._id,
        name: u.name,
        points: u.points || 0,
        badges: u.badges || [],
        rank: i + 1,
      }));
      setAllUsers(usersWithRank);
    } catch (error) {
      console.error('Failed to fetch all users:', error);
    }
  }, []);

  const fetchInsight = useCallback(async () => {
    setIsLoadingInsight(true);
    try {
      const data = await getInsight();
      setInsight(data);
    } catch (error) {
      console.error('Failed to fetch insight:', error);
      toast({
        title: 'Error',
        description: 'Failed to load insights',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingInsight(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTickets(), fetchLeaderboard(), fetchInsight(), fetchAllUsers()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTickets, fetchLeaderboard, fetchInsight, fetchAllUsers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Only refresh leaderboard and insights, not tickets
    // Tickets are updated optimistically on local changes (claim/unclaim/create)
    // and fetched from backend only after completion
    await Promise.all([
      fetchLeaderboard(leaderboardPage),
      activeTab === 'insights' ? fetchInsight() : Promise.resolve()
    ]);
    setIsRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Data updated successfully',
    });
  };

  const claimTicket = useCallback(async (id: string, squad?: Squad) => {
    try {
      // Call backend API to claim ticket
      await claimTicketApi(id, user._id);
      
      // Fetch updated tickets from backend
      await fetchTickets();
      
      toast({
        title: 'Ticket Claimed!',
        description: `You've claimed this ticket. Head to the location to clean it up!`,
      });
    } catch (error) {
      console.error('Failed to claim ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim ticket',
        variant: 'destructive',
      });
    }
  }, [user._id, fetchTickets]);

  const unclaimTicket = useCallback(async (id: string) => {
    try {
      // Call backend API to unclaim ticket (same endpoint, toggles state)
      await claimTicketApi(id, user._id);
      
      // Fetch updated tickets from backend
      await fetchTickets();
      
      toast({
        title: 'Ticket Released',
        description: 'The ticket is now available for others.',
      });
    } catch (error) {
      console.error('Failed to unclaim ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to release ticket',
        variant: 'destructive',
      });
    }
  }, [user._id, fetchTickets]);

  const completeTicket = useCallback(async (id: string, afterImageFile: File): Promise<{ success: boolean; result?: any; pointsEarned?: number; halfPointsAwarded?: number }> => {
    try {
      const ticket = tickets.find(t => t.id === id);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Compare images and upload
      const result = await compareImages(ticket.beforeImageUrl, afterImageFile, id);
      
      const pointsConfig = POINTS_CONFIG[ticket.priority];
      const hadPreviousFailure = failedCleanupAttempts.has(id);
      
      // Check if comparison was successful (returns true) or if it's an object with details
      if (result === true || (typeof result === 'object' && result.same_location && result.cleanup_successful)) {
        // Perfect match - same location and cleanup successful
        await resolveTicket({ ticket_id: id, user_id: user._id });
        
        // Fetch updated tickets from backend after completion
        await fetchTickets();
        
        // Calculate points earned
        const pointsEarned = hadPreviousFailure ? pointsConfig.half : pointsConfig.full;
        const pointsMessage = hadPreviousFailure 
          ? `You earned ${pointsConfig.half} additional points (${pointsConfig.full} total for this ticket)!`
          : `You earned ${pointsConfig.full} points!`;
        
        // Remove from failed attempts tracking
        failedCleanupAttempts.delete(id);
        
        toast({
          title: '🎉 Cleanup Complete!',
          description: `Amazing work! ${pointsMessage}`,
        });
        
        // Refresh leaderboard after completion
        fetchLeaderboard(leaderboardPage);
        
        return { success: true, pointsEarned };
      } else {
        // Cleanup not successful - award half points
        const halfPoints = pointsConfig.half;
        
        // Track this failed attempt
        failedCleanupAttempts.add(id);
        
        // Fetch updated tickets from backend
        await fetchTickets();
        
        // Refresh leaderboard to show half points awarded
        fetchLeaderboard(leaderboardPage);
        
        toast({
          title: 'Partial Cleanup',
          description: `You earned ${halfPoints} points for your effort. Complete the remaining cleanup to earn ${halfPoints} more!`,
        });
        
        return { success: false, result, halfPointsAwarded: halfPoints };
      }
    } catch (error) {
      console.error('Failed to complete ticket:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark ticket as complete',
        variant: 'destructive',
      });
      return { success: false };
    }
  }, [tickets, user._id, fetchTickets, fetchLeaderboard, leaderboardPage]);

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
          <Header user={user} tickets={tickets} onSignOut={onSignOut} onRefresh={handleRefresh} isRefreshing={isRefreshing} />

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
                          
                          {/* Sort Option */}
                          <div className="pt-1.5 border-t border-border mt-1.5">
                            <button
                              onClick={() => setPrioritySort(prev => prev === 'high-to-low' ? 'low-to-high' : 'high-to-low')}
                              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-background border border-border text-muted-foreground hover:border-primary/50 transition-colors"
                            >
                              <ArrowUpDown className="w-3 h-3" />
                              {prioritySort === 'high-to-low' ? 'High → Low' : 'Low → High'}
                            </button>
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
                        
                        {/* AI Insights */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              AI-Generated Insights
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={fetchInsight}
                              disabled={isLoadingInsight}
                            >
                              {isLoadingInsight ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          
                          {isLoadingInsight ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          ) : insight ? (
                            <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">
                              {insight}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-6">
                              No insights available yet.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Leaderboard Tab */}
                    {activeTab === 'leaderboard' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <Trophy className="w-4 h-4 text-primary" />
                          <h2 className="font-semibold text-foreground text-sm">Leaderboard</h2>
                        </div>
                        <RewardsPopup topEntries={leaderboard} />
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
                  tickets={filteredTickets}
                  selectedTicket={selectedTicket}
                  onSelectTicket={setSelectedTicket}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Ticket Detail Drawer */}
        {selectedTicket && (
          <TicketDetailDrawer 
            userName={userName}
            userId={user._id}
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onClaim={(squad) => claimTicket(selectedTicket.id, squad)}
            onUnclaim={() => unclaimTicket(selectedTicket.id)}
            onComplete={(afterImageFile) => completeTicket(selectedTicket.id, afterImageFile)}
            allUsers={allUsers}
          />
        )}
      </>
    );
  }

  // Desktop Layout
  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <Header user={user} tickets={tickets} onSignOut={onSignOut} onRefresh={handleRefresh} isRefreshing={isRefreshing} />

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

                      {/* Sort Option */}
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">Sort by Priority</p>
                        <button
                          onClick={() => setPrioritySort(prev => prev === 'high-to-low' ? 'low-to-high' : 'high-to-low')}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-background border border-border text-muted-foreground hover:border-primary/50 transition-colors"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          {prioritySort === 'high-to-low' ? 'High → Low' : 'Low → High'}
                        </button>
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
                      
                      {/* AI Insights */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            AI-Generated Insights
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchInsight}
                            disabled={isLoadingInsight}
                          >
                            {isLoadingInsight ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        
                        {isLoadingInsight ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        ) : insight ? (
                          <div className="bg-muted/50 rounded-lg p-6 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                            {insight}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No insights available yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Leaderboard Tab */}
                  {activeTab === 'leaderboard' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border">
                        <Trophy className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-foreground">Volunteer Leaderboard</h2>
                      </div>
                      <RewardsPopup topEntries={leaderboard} />
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
              tickets={filteredTickets}
              selectedTicket={selectedTicket}
              onSelectTicket={setSelectedTicket}
            />
          </main>
        </div>
      </div>

      {/* Ticket Detail Drawer - OUTSIDE main container to avoid stacking context issues */}
      {selectedTicket && (
        <TicketDetailDrawer 
          userName={userName}
          userId={user._id}
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onClaim={(squad) => claimTicket(selectedTicket.id, squad)}
          onUnclaim={() => unclaimTicket(selectedTicket.id)}
          onComplete={(afterImageFile) => completeTicket(selectedTicket.id, afterImageFile)}
          allUsers={allUsers}
        />
      )}
    </>
  );
}
