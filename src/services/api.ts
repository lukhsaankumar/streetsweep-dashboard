import type {
  User,
  CreateUserRequest,
  CreateUserResponse,
  LoginRequest,
  LoginResponse,
  ApiTicket,
  Ticket,
  CreateTicketRequest,
  CreateTicketResponse,
  ResolveTicketRequest,
  ClassifyResponse,
  LeaderboardEntry,
  TicketPriority,
  TicketState,
} from '@/types/api';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

// Token management
const TOKEN_KEY = 'streetsweep_token';
const USER_KEY = 'streetsweep_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Helper for authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
}

// ==================== AUTH ENDPOINTS ====================

export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
  const res = await fetch(`${API_BASE_URL}/create-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  const json = await res.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return json;
}

export async function login(data: LoginRequest): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.detail || 'Invalid credentials');
  }
  
  const loginRes: LoginResponse = await res.json();
  setStoredToken(loginRes.access_token);
  
  // Fetch user details (we need to get user by email or from /users)
  // For now, create a minimal user object
  const user: User = {
    _id: '',
    name: data.email.split('@')[0], // Temporary
    email: data.email,
  };
  
  return { token: loginRes.access_token, user };
}

export async function logout(): Promise<void> {
  clearStoredToken();
}

// ==================== USER ENDPOINTS ====================

export async function getAllUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/users`);
  const json = await res.json();
  
  if (json.error) {
    throw new Error(json.error);
  }
  
  return json.users || [];
}

export async function getUserById(userId: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`);
  const json = await res.json();
  
  if (json.error) {
    throw new Error(json.error);
  }
  
  return json;
}

// Get leaderboard - sorted users by points
export async function getLeaderboard(page: number = 1, pageSize: number = 10): Promise<{ entries: LeaderboardEntry[]; total: number }> {
  const users = await getAllUsers();
  
  // Sort by points descending
  const sorted = [...users].sort((a, b) => (b.points || 0) - (a.points || 0));
  
  // Add rank
  const withRank = sorted.map((user, index) => ({
    _id: user._id,
    name: user.name,
    points: user.points || 0,
    badges: user.badges || [],
    rank: index + 1,
  }));
  
  // Paginate
  const start = (page - 1) * pageSize;
  const entries = withRank.slice(start, start + pageSize);
  
  return { entries, total: users.length };
}

// ==================== TICKET ENDPOINTS ====================

// Transform API ticket to frontend Ticket format
function transformTicket(apiTicket: ApiTicket): Ticket {
  const severity = apiTicket.severity;
  let priority: TicketPriority = 'LOW';
  if (severity >= 7) priority = 'HIGH';
  else if (severity >= 4) priority = 'MEDIUM';
  
  let state: TicketState = 'OPEN';
  if (apiTicket.resolved) state = 'COMPLETED';
  else if (apiTicket.claimed) state = 'CLAIMED';
  
  // Generate a readable title from description
  const title = apiTicket.description.length > 50 
    ? apiTicket.description.substring(0, 47) + '...'
    : apiTicket.description || 'Litter Report';
  
  return {
    id: apiTicket._id,
    title,
    description: apiTicket.description,
    priority,
    lat: apiTicket.location.lat,
    lng: apiTicket.location.lon,
    createdAt: apiTicket.created_at || new Date().toISOString(),
    state,
    cameraId: 'user-report',
    cameraName: `${apiTicket.location.lat.toFixed(4)}, ${apiTicket.location.lon.toFixed(4)}`,
    severityScore: severity * 10, // Convert 1-10 to percentage
    beforeImageUrl: apiTicket.image_url,
    afterImageUrl: apiTicket.resolved ? apiTicket.image_url : undefined,
    claimedBy: apiTicket.claimed_by || undefined,
    completedAt: apiTicket.resolved_at || undefined,
    numDetections: Math.floor(severity * 3), // Estimate based on severity
    totalAreaRatio: severity / 100, // Estimate
  };
}

export async function getTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API_BASE_URL}/tickets`);
  const json = await res.json();
  
  if (json.error) {
    throw new Error(json.error);
  }
  
  const apiTickets: ApiTicket[] = json.tickets || [];
  return apiTickets.map(transformTicket);
}

export async function getTicketById(ticketId: string): Promise<Ticket> {
  const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}`);
  const json = await res.json();
  
  if (json.error) {
    throw new Error(json.error);
  }
  
  return transformTicket(json);
}

export async function createTicket(data: CreateTicketRequest): Promise<CreateTicketResponse> {
  const res = await fetchWithAuth('/create-ticket', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  const json = await res.json();
  
  if (json.error) {
    throw new Error(json.error);
  }
  
  if (json.detail) {
    throw new Error(json.detail);
  }
  
  return json;
}

export async function resolveTicket(data: ResolveTicketRequest): Promise<{ message: string; ticket_id: string; resolved: boolean }> {
  const res = await fetchWithAuth('/resolve-ticket', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  const json = await res.json();
  
  if (json.error) {
    throw new Error(json.error);
  }
  
  return json;
}

export async function classifyImage(imageFile: File): Promise<ClassifyResponse> {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const res = await fetch(`${API_BASE_URL}/classify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const json = await res.json();
  
  if (json.error) {
    throw new Error(json.error);
  }
  
  return json;
}

// ==================== HEALTH CHECK ====================

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const json = await res.json();
    return json.status === 'ok';
  } catch {
    return false;
  }
}
