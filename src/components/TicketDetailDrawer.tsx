import { useState, useRef } from 'react';
import type { Ticket, TicketPriority, Squad } from '@/types/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Camera, 
  Clock, 
  AlertTriangle, 
  User, 
  Check,
  Upload,
  ChevronRight,
  Users,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  HIGH: { label: 'High Priority', className: 'priority-high' },
  MEDIUM: { label: 'Medium Priority', className: 'priority-medium' },
  LOW: { label: 'Low Priority', className: 'priority-low' },
};

const afterImages = [
  '/dummy_images/litter-1-after.jpg',
  '/dummy_images/litter-2-after.jpg',
  '/dummy_images/litter-3-after.jpg',
  '/dummy_images/litter-4-after.jpg',
];

interface TicketDetailDrawerProps {
  userName: string;
  ticket: Ticket;
  onClose: () => void;
  onClaim: (squad?: Squad) => void;
  onUnclaim: () => void;
  onComplete: (afterImageUrl: string) => void;
}

export function TicketDetailDrawer({ userName, ticket, onClose, onClaim, onUnclaim, onComplete }: TicketDetailDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAfterImageSelect, setShowAfterImageSelect] = useState(false);
  const [showSquadForm, setShowSquadForm] = useState(false);
  const [squadName, setSquadName] = useState('');
  const [squadMembers, setSquadMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const priority = priorityConfig[ticket.priority];
  const isClaimedByMe = ticket.claimedBy?.toLowerCase() === userName.toLowerCase();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddMember = () => {
    if (newMember.trim() && !squadMembers.includes(newMember.trim())) {
      setSquadMembers([...squadMembers, newMember.trim()]);
      setNewMember('');
    }
  };

  const handleRemoveMember = (member: string) => {
    setSquadMembers(squadMembers.filter(m => m !== member));
  };

  const handleClaim = (withSquad: boolean = false) => {
    setIsLoading(true);
    
    if (withSquad && squadName.trim()) {
      const squad: Squad = {
        name: squadName.trim(),
        members: [userName, ...squadMembers],
      };
      onClaim(squad);
      toast({
        title: 'Squad Claim!',
        description: `Squad "${squad.name}" has claimed this ticket!`,
      });
    } else {
      onClaim();
      toast({
        title: 'Ticket Claimed!',
        description: `You've claimed "${ticket.title}". Head to the location to clean it up!`,
      });
    }
    
    setShowSquadForm(false);
    setSquadName('');
    setSquadMembers([]);
    setIsLoading(false);
  };

  const handleUnclaim = () => {
    setIsLoading(true);
    onUnclaim();
    toast({
      title: 'Ticket Released',
      description: 'The ticket is now available for others.',
    });
    setIsLoading(false);
  };

  const handleComplete = (afterImageUrl: string) => {
    setIsLoading(true);
    onComplete(afterImageUrl);
    setShowAfterImageSelect(false);
    setIsLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleComplete(url);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-card border-l border-border shadow-2xl z-[101] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className={cn("px-3 py-1 rounded-full text-sm font-medium border", priority.className)}>
            {priority.label}
          </span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Before Image */}
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={ticket.beforeImageUrl}
              alt="Litter before cleanup"
              className="w-full h-48 object-cover"
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur rounded text-xs font-medium">
              Before
            </div>
          </div>

          {/* After Image (if completed) */}
          {ticket.state === 'COMPLETED' && ticket.afterImageUrl && (
            <div className="relative rounded-lg overflow-hidden border border-primary">
              <img
                src={ticket.afterImageUrl}
                alt="Area after cleanup"
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/80 backdrop-blur rounded text-xs font-medium text-primary-foreground">
                After ✓
              </div>
            </div>
          )}

          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">{ticket.title}</h2>
            <p className="text-muted-foreground">{ticket.description}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Camera className="w-4 h-4" />
                Location
              </div>
              <p className="font-medium text-foreground">{ticket.cameraName}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                Severity
              </div>
              <p className="font-mono font-bold text-primary">{ticket.severityScore}%</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="w-4 h-4" />
                Detected
              </div>
              <p className="font-medium text-foreground text-sm">{formatDate(ticket.createdAt)}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <MapPin className="w-4 h-4" />
                Coordinates
              </div>
              <a
                href={`https://www.google.com/maps?q=${ticket.lat},${ticket.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary text-xs hover:underline flex items-center gap-1"
              >
                {ticket.lat.toFixed(4)}, {ticket.lng.toFixed(4)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 bg-secondary/50 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">Detection Stats</h3>
            <div className="flex justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{ticket.numDetections}</p>
                <p className="text-xs text-muted-foreground">Items detected</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{(ticket.totalAreaRatio * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Area affected</p>
              </div>
            </div>
          </div>

          {/* Claimed Info */}
          {ticket.claimedBy && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  {ticket.squad ? (
                    <Users className="w-5 h-5 text-primary" />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {ticket.squad ? ticket.squad.name : ticket.claimedBy}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.state === 'COMPLETED' ? 'Completed' : 'Claimed'}{' '}
                    {formatDate(ticket.completedAt || ticket.claimedAt!)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* After Image Selection */}
          {showAfterImageSelect && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-muted rounded-lg space-y-3"
            >
              <h3 className="font-semibold text-foreground">Select after cleanup photo</h3>
              <div className="grid grid-cols-2 gap-2">
                {afterImages.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => handleComplete(img)}
                    disabled={isLoading}
                    className="relative rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                  >
                    <img src={img} alt={`After option ${i + 1}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">Or upload your own</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
            </motion.div>
          )}
        </div>

        {/* Squad Form */}
        {showSquadForm && ticket.state === 'OPEN' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-border bg-muted/50 space-y-4"
          >
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Create Cleanup Squad
            </h3>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Squad Name</label>
              <Input
                placeholder="e.g. Green Warriors"
                value={squadName}
                onChange={(e) => setSquadName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Team Members</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add member name"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                />
                <Button variant="outline" size="icon" onClick={handleAddMember}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Member list */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded text-sm">
                  <User className="w-3 h-3 text-primary" />
                  <span className="text-foreground">{userName}</span>
                  <span className="text-xs text-muted-foreground ml-auto">(you)</span>
                </div>
                {squadMembers.map((member) => (
                  <div key={member} className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-sm">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{member}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-5 h-5 ml-auto text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveMember(member)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSquadForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => handleClaim(true)} 
                disabled={!squadName.trim() || isLoading}
                className="flex-1 gap-2"
              >
                <Users className="w-4 h-4" />
                Claim as Squad
              </Button>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="p-4 border-t border-border bg-card">
          {ticket.state === 'OPEN' && !showSquadForm && (
            <div className="space-y-2">
              <Button onClick={() => handleClaim(false)} disabled={isLoading} className="w-full gap-2" size="lg">
                <ChevronRight className="w-5 h-5" />
                Claim This Ticket
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSquadForm(true)} 
                disabled={isLoading} 
                className="w-full gap-2"
              >
                <Users className="w-4 h-4" />
                Claim with Squad
              </Button>
            </div>
          )}

          {ticket.state === 'CLAIMED' && isClaimedByMe && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleUnclaim} disabled={isLoading} className="flex-1">
                Release
              </Button>
              <Button
                onClick={() => setShowAfterImageSelect(!showAfterImageSelect)}
                disabled={isLoading}
                className="flex-1 gap-2"
              >
                <Check className="w-5 h-5" />
                Mark Complete
              </Button>
            </div>
          )}

          {ticket.state === 'CLAIMED' && !isClaimedByMe && (
            <div className="text-center text-muted-foreground py-2">
              This ticket is claimed by {ticket.claimedBy}
            </div>
          )}

          {ticket.state === 'COMPLETED' && (
            <div className="text-center py-2">
              <span className="inline-flex items-center gap-2 text-primary font-medium">
                <Check className="w-5 h-5" />
                Cleanup Completed
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
