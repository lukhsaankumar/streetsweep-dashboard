import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

export function SignIn() {
  const [name, setName] = useState('');
  const [mounted, setMounted] = useState(false);
  const { signIn } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    signIn(name.trim());
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-radial opacity-50" />
      
      {/* Animated background elements */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full bg-primary/5"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                scale: 0.5 + Math.random() * 0.5,
              }}
              animate={{
                x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
                y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse-glow"
          >
            <Leaf className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="text-3xl font-bold text-center text-foreground mb-2">
            StreetSweep AI
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Join the community cleaning up our streets
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name to get started"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 bg-muted border-border text-lg focus-ring"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={!name.trim()}
              className="w-full h-12 text-lg gap-2 glow-primary"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            No account needed. Your progress is saved locally.
          </p>
        </div>

        {/* Stats preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { label: 'Volunteers', value: '2.4K+' },
            { label: 'Cleanups', value: '12K+' },
            { label: 'Items Removed', value: '89K+' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-card/50 rounded-lg border border-border/50">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
