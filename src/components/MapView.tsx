import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Ticket, TicketPriority } from '@/types/api';
import { Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createPriorityIcon = (priority: TicketPriority, isSelected: boolean) => {
  const colors: Record<TicketPriority, string> = {
    HIGH: '#ef4444',
    MEDIUM: '#f59e0b',
    LOW: '#22c55e',
  };
  
  const color = colors[priority];
  const size = isSelected ? 40 : 32;
  const glow = isSelected ? `0 0 20px ${color}` : 'none';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: ${glow}, 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

function MapController({ selectedTicket }: { selectedTicket: Ticket | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedTicket) {
      map.flyTo([selectedTicket.lat, selectedTicket.lng], 15, {
        duration: 0.5,
      });
    }
  }, [selectedTicket, map]);

  return null;
}

function LocateButton() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    setIsLocating(true);
    map.locate({ setView: true, maxZoom: 14 });
    map.once('locationfound', () => setIsLocating(false));
    map.once('locationerror', () => setIsLocating(false));
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px' }}>
      <div className="leaflet-control">
        <Button
          size="sm"
          variant="outline"
          onClick={handleLocate}
          disabled={isLocating}
          className="bg-card border-border hover:bg-muted"
          aria-label="Locate me"
        >
          <Locate className={cn("w-4 h-4", isLocating && "animate-pulse")} />
        </Button>
      </div>
    </div>
  );
}

interface MapViewProps {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  onSelectTicket: (ticket: Ticket) => void;
}

export function MapView({ tickets, selectedTicket, onSelectTicket }: MapViewProps) {
  // Generate a key based on ticket IDs to force re-render when filters change
  const ticketsKey = useMemo(() => tickets.map(t => t.id).sort().join(','), [tickets]);
  
  // Center on Toronto by default - only calculate on initial render or when tickets change significantly
  const center: [number, number] = useMemo(() => {
    if (tickets.length === 0) return [43.6548, -79.3883];
    
    const avgLat = tickets.reduce((sum, t) => sum + t.lat, 0) / tickets.length;
    const avgLng = tickets.reduce((sum, t) => sum + t.lng, 0) / tickets.length;
    return [avgLat, avgLng];
  }, [ticketsKey]);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-border">

      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedTicket={selectedTicket} />
        <LocateButton />

        {/* Ticket markers */}
        {tickets.map((ticket) => (
          <Marker
            key={ticket.id}
            position={[ticket.lat, ticket.lng]}
            icon={createPriorityIcon(ticket.priority, selectedTicket?.id === ticket.id)}
            eventHandlers={{
              click: () => onSelectTicket(ticket),
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-semibold text-sm mb-1">{ticket.title}</h3>
                <p className="text-xs text-gray-600">{ticket.cameraName}</p>
                <p className="text-xs mt-1">
                  <span className={cn(
                    "font-medium",
                    ticket.priority === 'HIGH' ? "text-red-600" :
                    ticket.priority === 'MEDIUM' ? "text-amber-600" : "text-green-600"
                  )}>
                    {ticket.priority} Severity
                  </span>
                  {' · '}
                  Severity: {ticket.severityScore}%
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}