// API Types matching backend responses

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketState = 'OPEN' | 'CLAIMED' | 'COMPLETED';

export interface Squad {
  name: string;
  members: string[];
}

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  points?: number;
  badges?: string[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserResponse {
  user_id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Ticket types from API
export interface ApiTicket {
  _id: string;
  image_url: string;
  location: {
    lat: number;
    lon: number;
  };
  severity: number;
  description: string;
  claimed: boolean;
  resolved: boolean;
  created_at?: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
  claimed_by?: string | null;
}

// Frontend Ticket type (transformed from API)
export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  lat: number;
  lng: number;
  createdAt: string;
  state: TicketState;
  cameraId: string;
  cameraName: string;
  severityScore: number;
  beforeImageUrl: string;
  afterImageUrl?: string;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  numDetections: number;
  totalAreaRatio: number;
  squad?: Squad;
}

export interface CreateTicketRequest {
  image_url?: string;
  image_base64?: string | null;
  location: {
    lat: number;
    lon: number;
  };
  severity: number;
  description: string;
  claimed?: boolean;
}

export interface CreateTicketResponse {
  ticket_id: string;
  image_url: string;
  severity: number;
  description: string;
  claimed: boolean;
  resolved: boolean;
}

export interface ResolveTicketRequest {
  ticket_id: string;
  user_id: string;
}

export interface ClassifyResponse {
  severity: number | null;
  image_base64: string;
}

// Leaderboard entry derived from User
export interface LeaderboardEntry {
  _id: string;
  name: string;
  points: number;
  badges: string[];
  rank: number;
}
