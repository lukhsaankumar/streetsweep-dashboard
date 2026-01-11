import type { Ticket, TicketPriority } from '@/types/api';
import { motion } from 'framer-motion';
import { Clock, MapPin, Camera, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: Ticket;
  isSelected?: boolean;
  onClick?: () => void;
}

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  HIGH: { label: 'High', className: 'priority-high' },
  MEDIUM: { label: 'Medium', className: 'priority-medium' },
  LOW: { label: 'Low', className: 'priority-low' },
};

const stateConfig = {
  OPEN: { label: 'Open', className: 'state-open' },
  CLAIMED: { label: 'Claimed', className: 'state-claimed' },
  COMPLETED: { label: 'Completed', className: 'state-completed' },
};

export function TicketCard({ ticket, isSelected, onClick }: TicketCardProps) {
  const priority = priorityConfig[ticket.priority];
  const state = stateConfig[ticket.state];
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg bg-card border border-border transition-all duration-200",
        "hover:border-primary/50 hover:shadow-glow focus-ring",
        isSelected && "border-primary shadow-glow"
      )}
      aria-label={`Ticket: ${ticket.title}, Priority: ${priority.label}, Status: ${state.label}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        <h3 className="font-semibold text-foreground line-clamp-1 text-sm sm:text-base">{ticket.title}</h3>
        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          <span className={cn("px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border", priority.className)}>
            {priority.label}
          </span>
          <span className={cn("px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium", state.className)}>
            {state.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
        <div className="flex items-center gap-1">
          <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="truncate max-w-[80px] sm:max-w-[120px]">{ticket.cameraName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="text-[10px] sm:text-sm">{formatDate(ticket.createdAt)}</span>
        </div>
      </div>

      {/* Severity Score Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Severity
          </span>
          <span className="font-mono text-primary">{ticket.severityScore}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ticket.severityScore}%` }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn(
              "h-full rounded-full",
              ticket.severityScore >= 70 ? "bg-destructive" :
              ticket.severityScore >= 40 ? "bg-warning" : "bg-primary"
            )}
          />
        </div>
      </div>

      {ticket.claimedBy && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {ticket.state === 'COMPLETED' ? 'Completed by' : 'Claimed by'}{' '}
            <span className="text-foreground font-medium">{ticket.claimedBy}</span>
          </p>
        </div>
      )}
    </motion.button>
  );
}
