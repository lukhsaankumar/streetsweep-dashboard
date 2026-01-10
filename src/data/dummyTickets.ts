export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketState = 'OPEN' | 'CLAIMED' | 'COMPLETED';

export interface Squad {
  name: string;
  members: string[];
}

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

export const dummyTickets: Ticket[] = [
  {
    id: 'ticket-001',
    title: 'Downtown Sidewalk Cleanup',
    description: 'Multiple plastic bottles and paper waste detected near the Main Street shopping area. High foot traffic zone requires immediate attention.',
    priority: 'HIGH',
    lat: 40.7128,
    lng: -74.0060,
    createdAt: '2025-01-10T08:30:00Z',
    state: 'OPEN',
    cameraId: 'cam-001',
    cameraName: 'Main St Camera #1',
    severityScore: 85,
    beforeImageUrl: '/dummy_images/litter-1-before.jpg',
    numDetections: 24,
    totalAreaRatio: 0.15,
  },
  {
    id: 'ticket-002',
    title: 'Central Park Pathway Litter',
    description: 'Scattered cups, bags, and food wrappers along the main walking path. Near the children\'s playground area.',
    priority: 'HIGH',
    lat: 40.7829,
    lng: -73.9654,
    createdAt: '2025-01-10T09:15:00Z',
    state: 'OPEN',
    cameraId: 'cam-002',
    cameraName: 'Park Entrance Cam',
    severityScore: 78,
    beforeImageUrl: '/dummy_images/litter-2-before.jpg',
    numDetections: 18,
    totalAreaRatio: 0.12,
  },
  {
    id: 'ticket-003',
    title: 'Alley Overflow Near Restaurant Row',
    description: 'Overflowing trash bins with garbage spilling onto the alley. Health hazard due to proximity to food establishments.',
    priority: 'HIGH',
    lat: 40.7589,
    lng: -73.9851,
    createdAt: '2025-01-09T14:20:00Z',
    state: 'CLAIMED',
    cameraId: 'cam-003',
    cameraName: 'Alley Cam #7',
    severityScore: 92,
    beforeImageUrl: '/dummy_images/litter-3-before.jpg',
    claimedBy: 'Alex Green',
    claimedAt: '2025-01-10T10:00:00Z',
    numDetections: 35,
    totalAreaRatio: 0.22,
  },
  {
    id: 'ticket-004',
    title: 'Bus Stop Debris Collection',
    description: 'Fast food containers, cigarette butts, and plastic bottles accumulated at the transit stop. Regular commuter area.',
    priority: 'MEDIUM',
    lat: 40.7484,
    lng: -73.9857,
    createdAt: '2025-01-09T16:45:00Z',
    state: 'COMPLETED',
    cameraId: 'cam-004',
    cameraName: '42nd St Bus Stop',
    severityScore: 65,
    beforeImageUrl: '/dummy_images/litter-4-before.jpg',
    afterImageUrl: '/dummy_images/litter-4-after.jpg',
    claimedBy: 'Maria Santos',
    claimedAt: '2025-01-09T18:00:00Z',
    completedAt: '2025-01-09T19:30:00Z',
    numDetections: 12,
    totalAreaRatio: 0.08,
  },
  {
    id: 'ticket-005',
    title: 'Riverside Walk Bottles',
    description: 'Glass and plastic bottles collected near riverfront benches. Popular evening hangout spot.',
    priority: 'MEDIUM',
    lat: 40.7614,
    lng: -73.9776,
    createdAt: '2025-01-10T07:00:00Z',
    state: 'OPEN',
    cameraId: 'cam-005',
    cameraName: 'River View Camera',
    severityScore: 55,
    beforeImageUrl: '/dummy_images/litter-1-before.jpg',
    numDetections: 8,
    totalAreaRatio: 0.05,
  },
  {
    id: 'ticket-006',
    title: 'School Zone Litter',
    description: 'Snack wrappers and drink containers near school entrance. Priority due to children\'s safety.',
    priority: 'HIGH',
    lat: 40.7282,
    lng: -73.9942,
    createdAt: '2025-01-10T06:30:00Z',
    state: 'OPEN',
    cameraId: 'cam-006',
    cameraName: 'PS 234 Entrance',
    severityScore: 72,
    beforeImageUrl: '/dummy_images/litter-2-before.jpg',
    numDetections: 15,
    totalAreaRatio: 0.10,
  },
  {
    id: 'ticket-007',
    title: 'Subway Station Exit',
    description: 'Paper cups and newspapers scattered at subway exit stairs. High pedestrian traffic area.',
    priority: 'LOW',
    lat: 40.7527,
    lng: -73.9772,
    createdAt: '2025-01-08T12:00:00Z',
    state: 'COMPLETED',
    cameraId: 'cam-007',
    cameraName: 'Grand Central Exit B',
    severityScore: 35,
    beforeImageUrl: '/dummy_images/litter-3-before.jpg',
    afterImageUrl: '/dummy_images/litter-3-after.jpg',
    claimedBy: 'Jordan Lee',
    claimedAt: '2025-01-08T14:00:00Z',
    completedAt: '2025-01-08T15:30:00Z',
    numDetections: 6,
    totalAreaRatio: 0.04,
  },
  {
    id: 'ticket-008',
    title: 'Parking Lot Corner',
    description: 'Miscellaneous litter accumulated in corner of public parking lot. Low visibility area.',
    priority: 'LOW',
    lat: 40.7425,
    lng: -73.9889,
    createdAt: '2025-01-10T05:00:00Z',
    state: 'OPEN',
    cameraId: 'cam-008',
    cameraName: 'Lot C Camera',
    severityScore: 28,
    beforeImageUrl: '/dummy_images/litter-4-before.jpg',
    numDetections: 5,
    totalAreaRatio: 0.03,
  },
];

export interface VolunteerStats {
  name: string;
  completedTickets: number;
  totalDetections: number;
  badge: string;
}

export function calculateLeaderboard(tickets: Ticket[]): VolunteerStats[] {
  const completedTickets = tickets.filter(t => t.state === 'COMPLETED' && t.claimedBy);
  
  const statsMap = new Map<string, { completed: number; detections: number }>();
  
  completedTickets.forEach(ticket => {
    const name = ticket.claimedBy!;
    const current = statsMap.get(name) || { completed: 0, detections: 0 };
    statsMap.set(name, {
      completed: current.completed + 1,
      detections: current.detections + ticket.numDetections,
    });
  });
  
  const getBadge = (completed: number): string => {
    if (completed >= 50) return 'Eco Legend';
    if (completed >= 25) return 'Cleanup Captain';
    if (completed >= 10) return 'Eco Hero';
    if (completed >= 5) return 'Green Champion';
    if (completed >= 2) return 'Earth Guardian';
    return 'Rookie Cleaner';
  };
  
  return Array.from(statsMap.entries())
    .map(([name, stats]) => ({
      name,
      completedTickets: stats.completed,
      totalDetections: stats.detections,
      badge: getBadge(stats.completed),
    }))
    .sort((a, b) => b.completedTickets - a.completedTickets);
}
