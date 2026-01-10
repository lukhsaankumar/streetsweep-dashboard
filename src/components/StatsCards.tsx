import { useTickets } from '@/contexts/TicketsContext';
import { motion } from 'framer-motion';
import { Recycle, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  accentColor?: string;
}

function StatCard({ title, value, icon, description, accentColor = 'primary' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-muted-foreground text-sm">{title}</span>
        <div className={`p-2 rounded-lg bg-${accentColor}/10`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </motion.div>
  );
}

export function StatsCards() {
  const { stats } = useTickets();

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        title="Open Tickets"
        value={stats.totalOpen}
        icon={<AlertCircle className="w-5 h-5 text-warning" />}
        description="Awaiting volunteers"
      />
      <StatCard
        title="Completed"
        value={stats.totalCompleted}
        icon={<CheckCircle2 className="w-5 h-5 text-primary" />}
        description="Cleanups done"
      />
      <StatCard
        title="In Progress"
        value={stats.totalClaimed}
        icon={<Recycle className="w-5 h-5 text-accent" />}
        description="Being cleaned"
      />
      <StatCard
        title="Items Removed"
        value={stats.estimatedItemsRemoved}
        icon={<Trash2 className="w-5 h-5 text-primary" />}
        description="Estimated total"
      />
    </div>
  );
}
