import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Award, Leaf, Sprout, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LeaderboardEntry } from '@/types/api';

// Map points to badge
function getBadge(points: number): string {
  if (points >= 500) return 'Eco Legend';
  if (points >= 250) return 'Cleanup Captain';
  if (points >= 100) return 'Eco Hero';
  if (points >= 50) return 'Green Champion';
  if (points >= 20) return 'Earth Guardian';
  return 'Rookie Cleaner';
}

const badgeIcons: Record<string, React.ReactNode> = {
  'Eco Legend': <Trophy className="w-4 h-4 text-yellow-500" />,
  'Cleanup Captain': <Medal className="w-4 h-4 text-amber-500" />,
  'Eco Hero': <Star className="w-4 h-4 text-primary" />,
  'Green Champion': <Award className="w-4 h-4 text-green-500" />,
  'Earth Guardian': <Leaf className="w-4 h-4 text-emerald-500" />,
  'Rookie Cleaner': <Sprout className="w-4 h-4 text-lime-500" />,
};

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Leaderboard({ entries, currentPage, totalPages, onPageChange }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No volunteers yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Leaderboard entries */}
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const badge = getBadge(entry.points);
          const displayRank = entry.rank;
          
          return (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                displayRank === 1 ? "bg-primary/10 border border-primary/30" : "bg-muted"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                displayRank === 1 ? "bg-primary text-primary-foreground" :
                displayRank === 2 ? "bg-muted-foreground/20 text-foreground" :
                displayRank === 3 ? "bg-muted-foreground/10 text-muted-foreground" :
                "bg-transparent text-muted-foreground"
              )}>
                {displayRank}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{entry.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {badgeIcons[badge]}
                  <span>{badge}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-primary">{entry.points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
