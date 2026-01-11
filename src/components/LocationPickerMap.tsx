import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Locate, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon for selected location
const selectedMarkerIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 36px;
      height: 36px;
      background: hsl(var(--primary));
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

interface LocationPickerMapProps {
  value: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number }) => void;
  className?: string;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function LocateButton({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    setIsLocating(true);
    map.locate({ setView: true, maxZoom: 16 });
    
    map.once('locationfound', (e) => {
      onLocate(e.latlng.lat, e.latlng.lng);
      setIsLocating(false);
    });
    
    map.once('locationerror', () => {
      setIsLocating(false);
    });
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px' }}>
      <div className="leaflet-control">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleLocate}
          disabled={isLocating}
          className="bg-card border-border hover:bg-muted gap-2"
        >
          <Locate className={cn("w-4 h-4", isLocating && "animate-pulse")} />
          {isLocating ? 'Locating...' : 'My Location'}
        </Button>
      </div>
    </div>
  );
}

function FlyToLocation({ location }: { location: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 16, { duration: 0.5 });
    }
  }, [location, map]);
  
  return null;
}

export function LocationPickerMap({ value, onChange, className }: LocationPickerMapProps) {
  // Default to NYC
  const defaultCenter: [number, number] = [40.7128, -74.0060];
  const center: [number, number] = value ? [value.lat, value.lng] : defaultCenter;

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    onChange({ lat, lng });
  }, [onChange]);

  return (
    <div className={cn("relative rounded-lg overflow-hidden border border-border", className)}>
      <div className="absolute top-2 left-2 z-[1000] px-2 py-1 bg-card/90 backdrop-blur rounded text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Click on map to select location
      </div>
      
      <MapContainer
        center={center}
        zoom={value ? 16 : 12}
        className="h-full w-full"
        style={{ minHeight: '250px' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onLocationSelect={handleLocationSelect} />
        <LocateButton onLocate={handleLocationSelect} />
        <FlyToLocation location={value} />
        
        {value && (
          <Marker 
            position={[value.lat, value.lng]} 
            icon={selectedMarkerIcon}
          />
        )}
      </MapContainer>
      
      {value && (
        <div className="absolute bottom-2 left-2 z-[1000] px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-mono">
          {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
