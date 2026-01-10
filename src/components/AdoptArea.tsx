import { useState } from 'react';
import { useTickets } from '@/contexts/TicketsContext';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export function AdoptArea() {
  const { subscriptions, addSubscriptionAction, removeSubscriptionAction } = useTickets();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('40.7128');
  const [lng, setLng] = useState('-74.006');
  const [radius, setRadius] = useState([500]);

  const handleAdd = () => {
    if (!name.trim()) return;
    
    addSubscriptionAction({
      name: name.trim(),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: radius[0],
    });
    
    setName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Subscribed Areas */}
      {subscriptions.length > 0 && (
        <div className="space-y-2">
          {subscriptions.map((sub) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <Circle className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{sub.name}</p>
                <p className="text-xs text-muted-foreground">
                  {sub.radius}m radius
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSubscriptionAction(sub.id)}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${sub.name} subscription`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add new area */}
      {isAdding ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-muted rounded-lg space-y-4"
        >
          <Input
            placeholder="Area name (e.g., My Block)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-card"
          />
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Latitude</label>
              <Input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="bg-card font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Longitude</label>
              <Input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="bg-card font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground flex items-center justify-between mb-2">
              <span>Radius</span>
              <span className="font-mono">{radius[0]}m</span>
            </label>
            <Slider
              value={radius}
              onValueChange={setRadius}
              min={100}
              max={2000}
              step={100}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!name.trim()} className="flex-1">
              Add Area
            </Button>
          </div>
        </motion.div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Adopt a Block
        </Button>
      )}

      {subscriptions.length === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground text-center">
          Subscribe to areas to get notified about new litter reports
        </p>
      )}
    </div>
  );
}
