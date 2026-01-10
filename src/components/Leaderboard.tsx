import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Award, Leaf, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VolunteerStats } from '@/data/dummyTickets';

const badgeIcons: Record<string, React.ReactNode> = {
  'Eco Legend': <Trophy className="w-4 h-4 text-yellow-500" />,
  'Cleanup Captain': <Medal className="w-4 h-4 text-amber-500" />,
  'Eco Hero': <Star className="w-4 h-4 text-primary" />,
  'Green Champion': <Award className="w-4 h-4 text-green-500" />,
  'Earth Guardian': <Leaf className="w-4 h-4 text-emerald-500" />,
  'Rookie Cleaner': <Sprout className="w-4 h-4 text-lime-500" />,
};

interface LeaderboardProps {
  leaderboard: VolunteerStats[];
}

export function Leaderboard({ leaderboard }: LeaderboardProps) {
  if (leaderboard.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No completed cleanups yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leaderboard.map((volunteer, index) => (
        <motion.div
          key={volunteer.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg",
            index === 0 ? "bg-primary/10 border border-primary/30" : "bg-muted"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
            index === 0 ? "bg-primary text-primary-foreground" :
            index === 1 ? "bg-muted-foreground/20 text-foreground" :
            index === 2 ? "bg-muted-foreground/10 text-muted-foreground" :
            "bg-transparent text-muted-foreground"
          )}>
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{volunteer.name}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {badgeIcons[volunteer.badge]}
              <span>{volunteer.badge}</span>
            </div>
          </div>

          <div className="text-right">
            <p className="font-bold text-primary">{volunteer.completedTickets}</p>
            <p className="text-xs text-muted-foreground">cleanups</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}