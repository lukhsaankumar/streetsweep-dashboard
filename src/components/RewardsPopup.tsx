import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Trophy, Medal, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import airPurifierImage from '@/assets/air-purifier-reward.png';
import type { LeaderboardEntry } from '@/types/api';

interface RewardsPopupProps {
  topEntries: LeaderboardEntry[];
}

export function RewardsPopup({ topEntries }: RewardsPopupProps) {
  const [open, setOpen] = useState(false);
  
  const top3 = topEntries.slice(0, 3);
  
  const rankIcons = [
    <Trophy key="1" className="w-5 h-5 text-yellow-500" />,
    <Medal key="2" className="w-5 h-5 text-gray-400" />,
    <Award key="3" className="w-5 h-5 text-amber-600" />,
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10"
        >
          <Gift className="w-4 h-4 text-primary" />
          <span className="font-medium text-primary">This Month's Rewards</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Gift className="w-5 h-5 text-primary" />
            January 2025 Rewards
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Prize Image */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative mx-auto w-40 h-40 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/20"
          >
            <img 
              src={airPurifierImage} 
              alt="Philips Air Purifier" 
              className="w-full h-full object-contain"
            />
          </motion.div>
          
          {/* Prize Description */}
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg text-foreground">Philips Air Purifier</h3>
            <p className="text-sm text-muted-foreground">
              Top 3 volunteers this month win a free air purifier!
            </p>
          </div>
          
          {/* Current Top 3 */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
              Current Leaders
            </p>
            <div className="space-y-2">
              {top3.length > 0 ? (
                top3.map((entry, index) => (
                  <motion.div
                    key={entry._id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background">
                      {rankIcons[index]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.points} points</p>
                    </div>
                    <div className="text-sm font-bold text-primary">
                      #{index + 1}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No volunteers yet. Be the first to claim a spot!
                </p>
              )}
            </div>
          </div>
          
          {/* CTA */}
          <p className="text-xs text-center text-muted-foreground pt-2">
            Complete more cleanups to climb the leaderboard!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
