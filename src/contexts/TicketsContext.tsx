import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Ticket, TicketState, TicketPriority, calculateLeaderboard, VolunteerStats, dummyLeaderboard } from '@/data/dummyTickets';
import { getTickets, TicketFilters, claimTicket, unclaimTicket, completeTicket, getDashboardStats, DashboardStats, Subscription, getSubscriptions, addSubscription, removeSubscription } from '@/services/api';

interface TicketsContextType {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  isLoading: boolean;
  filters: TicketFilters;
  stats: DashboardStats | null;
  leaderboard: VolunteerStats[];
  subscriptions: Subscription[];
  setFilters: (filters: TicketFilters) => void;
  selectTicket: (ticket: Ticket | null) => void;
  claimTicketAction: (id: string, userName: string) => Promise<boolean>;
  unclaimTicketAction: (id: string, userName: string) => Promise<boolean>;
  completeTicketAction: (id: string, userName: string, afterImageUrl: string) => Promise<boolean>;
  refreshTickets: () => Promise<void>;
  addSubscriptionAction: (sub: Omit<Subscription, 'id' | 'createdAt'>) => void;
  removeSubscriptionAction: (id: string) => void;
}

const TicketsContext = createContext<TicketsContextType | null>(null);

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TicketFilters>({ sortBy: 'severity' });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<VolunteerStats[]>(dummyLeaderboard);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const refreshTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([
        getTickets(filters),
        getDashboardStats(),
      ]);
      setTickets(ticketsData);
      setStats(statsData);
      
      // Calculate leaderboard from all tickets
      const allTickets = await getTickets();
      setLeaderboard(calculateLeaderboard(allTickets));
      
      // Update selected ticket if it exists
      if (selectedTicket) {
        const updated = ticketsData.find(t => t.id === selectedTicket.id);
        if (updated) {
          setSelectedTicket(updated);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, selectedTicket?.id]);

  useEffect(() => {
    refreshTickets();
    setSubscriptions(getSubscriptions());
  }, []);

  useEffect(() => {
    refreshTickets();
  }, [filters]);

  const selectTicket = useCallback((ticket: Ticket | null) => {
    setSelectedTicket(ticket);
  }, []);

  const claimTicketAction = useCallback(async (id: string, userName: string) => {
    const result = await claimTicket(id, userName);
    if (result) {
      await refreshTickets();
      return true;
    }
    return false;
  }, [refreshTickets]);

  const unclaimTicketAction = useCallback(async (id: string, userName: string) => {
    const result = await unclaimTicket(id, userName);
    if (result) {
      await refreshTickets();
      return true;
    }
    return false;
  }, [refreshTickets]);

  const completeTicketAction = useCallback(async (id: string, userName: string, afterImageUrl: string) => {
    const result = await completeTicket(id, userName, afterImageUrl);
    if (result) {
      await refreshTickets();
      return true;
    }
    return false;
  }, [refreshTickets]);

  const addSubscriptionAction = useCallback((sub: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSub = addSubscription(sub);
    setSubscriptions(prev => [...prev, newSub]);
  }, []);

  const removeSubscriptionAction = useCallback((id: string) => {
    removeSubscription(id);
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <TicketsContext.Provider value={{
      tickets,
      selectedTicket,
      isLoading,
      filters,
      stats,
      leaderboard,
      subscriptions,
      setFilters,
      selectTicket,
      claimTicketAction,
      unclaimTicketAction,
      completeTicketAction,
      refreshTickets,
      addSubscriptionAction,
      removeSubscriptionAction,
    }}>
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error('useTickets must be used within TicketsProvider');
  }
  return context;
}
