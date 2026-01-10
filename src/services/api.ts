import { Ticket, TicketState, TicketPriority, dummyTickets, Squad } from '@/data/dummyTickets';

const STORAGE_KEY = 'streetsweep_tickets';
const SUBSCRIPTIONS_KEY = 'streetsweep_subscriptions';
const SQUADS_KEY = 'streetsweep_squads';

// Initialize localStorage with dummy data
function initializeStore(): Ticket[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyTickets));
  return dummyTickets;
}

function saveStore(tickets: Ticket[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface TicketFilters {
  state?: TicketState;
  priority?: TicketPriority;
  search?: string;
  sortBy?: 'severity' | 'newest' | 'oldest';
}

// GET /api/tickets
export async function getTickets(filters?: TicketFilters): Promise<Ticket[]> {
  await delay(200);
  let tickets = initializeStore();
  
  if (filters?.state) {
    tickets = tickets.filter(t => t.state === filters.state);
  }
  
  if (filters?.priority) {
    tickets = tickets.filter(t => t.priority === filters.priority);
  }
  
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    tickets = tickets.filter(t => 
      t.title.toLowerCase().includes(search) || 
      t.cameraName.toLowerCase().includes(search) ||
      t.description.toLowerCase().includes(search)
    );
  }
  
  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'severity':
        tickets = [...tickets].sort((a, b) => b.severityScore - a.severityScore);
        break;
      case 'newest':
        tickets = [...tickets].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        tickets = [...tickets].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
    }
  }
  
  return tickets;
}

// GET /api/tickets/:id
export async function getTicketById(id: string): Promise<Ticket | null> {
  await delay(100);
  const tickets = initializeStore();
  return tickets.find(t => t.id === id) || null;
}

// POST /api/tickets/:id/claim
export async function claimTicket(id: string, userName: string, squad?: Squad): Promise<Ticket | null> {
  await delay(300);
  const tickets = initializeStore();
  const ticketIndex = tickets.findIndex(t => t.id === id);
  
  if (ticketIndex === -1) return null;
  
  const ticket = tickets[ticketIndex];
  if (ticket.state !== 'OPEN') return null;
  
  const updatedTicket: Ticket = {
    ...ticket,
    state: 'CLAIMED',
    claimedBy: userName,
    claimedAt: new Date().toISOString(),
    squad,
  };
  
  tickets[ticketIndex] = updatedTicket;
  saveStore(tickets);
  
  return updatedTicket;
}

// POST /api/tickets/:id/unclaim
export async function unclaimTicket(id: string, userName: string): Promise<Ticket | null> {
  await delay(300);
  const tickets = initializeStore();
  const ticketIndex = tickets.findIndex(t => t.id === id);
  
  if (ticketIndex === -1) return null;
  
  const ticket = tickets[ticketIndex];
  if (ticket.state !== 'CLAIMED' || ticket.claimedBy !== userName) return null;
  
  const updatedTicket: Ticket = {
    ...ticket,
    state: 'OPEN',
    claimedBy: undefined,
    claimedAt: undefined,
    squad: undefined,
  };
  
  tickets[ticketIndex] = updatedTicket;
  saveStore(tickets);
  
  return updatedTicket;
}

// POST /api/tickets/:id/complete
export async function completeTicket(
  id: string, 
  userName: string, 
  afterImageUrl: string
): Promise<Ticket | null> {
  await delay(300);
  const tickets = initializeStore();
  const ticketIndex = tickets.findIndex(t => t.id === id);
  
  if (ticketIndex === -1) return null;
  
  const ticket = tickets[ticketIndex];
  if (ticket.state !== 'CLAIMED' || ticket.claimedBy !== userName) return null;
  
  const updatedTicket: Ticket = {
    ...ticket,
    state: 'COMPLETED',
    afterImageUrl,
    completedAt: new Date().toISOString(),
  };
  
  tickets[ticketIndex] = updatedTicket;
  saveStore(tickets);
  
  return updatedTicket;
}

// Subscriptions (Adopt-a-block)
export interface Subscription {
  id: string;
  lat: number;
  lng: number;
  radius: number; // in meters
  name: string;
  createdAt: string;
}

export function getSubscriptions(): Subscription[] {
  const stored = localStorage.getItem(SUBSCRIPTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addSubscription(subscription: Omit<Subscription, 'id' | 'createdAt'>): Subscription {
  const subscriptions = getSubscriptions();
  const newSub: Subscription = {
    ...subscription,
    id: `sub-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  subscriptions.push(newSub);
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  return newSub;
}

export function removeSubscription(id: string): void {
  const subscriptions = getSubscriptions().filter(s => s.id !== id);
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
}

// Squads
export function getSquads(): Squad[] {
  const stored = localStorage.getItem(SQUADS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveSquad(squad: Squad): void {
  const squads = getSquads();
  const existingIndex = squads.findIndex(s => s.name === squad.name);
  if (existingIndex >= 0) {
    squads[existingIndex] = squad;
  } else {
    squads.push(squad);
  }
  localStorage.setItem(SQUADS_KEY, JSON.stringify(squads));
}

export function deleteSquad(name: string): void {
  const squads = getSquads().filter(s => s.name !== name);
  localStorage.setItem(SQUADS_KEY, JSON.stringify(squads));
}

// Stats
export interface DashboardStats {
  totalOpen: number;
  totalClaimed: number;
  totalCompleted: number;
  estimatedItemsRemoved: number;
  ticketsByHour: { hour: string; count: number }[];
  topCameras: { name: string; count: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(100);
  const tickets = initializeStore();
  
  const totalOpen = tickets.filter(t => t.state === 'OPEN').length;
  const totalClaimed = tickets.filter(t => t.state === 'CLAIMED').length;
  const totalCompleted = tickets.filter(t => t.state === 'COMPLETED').length;
  
  const estimatedItemsRemoved = tickets
    .filter(t => t.state === 'COMPLETED')
    .reduce((sum, t) => sum + t.numDetections, 0);
  
  // Group by hour
  const hourCounts = new Map<string, number>();
  tickets.forEach(ticket => {
    const date = new Date(ticket.createdAt);
    const hour = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });
  
  const ticketsByHour = Array.from(hourCounts.entries())
    .map(([hour, count]) => ({ hour, count }))
    .slice(-12);
  
  // Top cameras
  const cameraCounts = new Map<string, number>();
  tickets.forEach(ticket => {
    cameraCounts.set(ticket.cameraName, (cameraCounts.get(ticket.cameraName) || 0) + 1);
  });
  
  const topCameras = Array.from(cameraCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    totalOpen,
    totalClaimed,
    totalCompleted,
    estimatedItemsRemoved,
    ticketsByHour,
    topCameras,
  };
}
