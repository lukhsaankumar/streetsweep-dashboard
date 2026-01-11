import { motion } from 'framer-motion';
import { Leaf, MapPin, Trophy, Users, ArrowRight, Sparkles, TreeDeciduous, Recycle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: MapPin,
    title: 'AI-Powered Detection',
    description: 'Our AI automatically detects litter hotspots and creates cleanup tickets for volunteers.',
  },
  {
    icon: Trophy,
    title: 'Gamified Experience',
    description: 'Earn points, climb the leaderboard, and unlock badges as you help clean your community.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Join a growing community of eco-warriors making a real difference in their neighborhoods.',
  },
];


export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.1, y: 0 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute top-20 left-10 text-primary"
          >
            <Leaf className="w-16 h-16 md:w-24 md:h-24" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.1, y: 0 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }}
            className="absolute top-40 right-20 text-primary"
          >
            <TreeDeciduous className="w-12 h-12 md:w-20 md:h-20" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 0.08, rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-20 left-1/4 text-primary"
          >
            <Recycle className="w-20 h-20 md:w-32 md:h-32" />
          </motion.div>
        </div>

        {/* Nav */}
        <nav className="relative z-10 px-4 md:px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-lg text-foreground">StreetSweep AI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Join</span>
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-4 md:px-8 pt-12 md:pt-24 pb-16 md:pb-32 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Gamified Community Cleanup</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
              Clean Streets,{' '}
              <span className="text-primary glow-text">Earn Rewards</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto px-4">
              Join the movement to keep our neighborhoods clean. Report litter, claim cleanup missions, and compete with fellow eco-warriors.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 h-12 px-6 sm:px-8 text-base w-full sm:w-auto">
                  Start Cleaning
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="h-12 px-6 sm:px-8 text-base w-full sm:w-auto">
                  I have an account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </header>


      {/* Features Section */}
      <section className="relative z-10 px-4 md:px-8 py-16 md:py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Our AI-powered platform makes community cleanup fun and rewarding.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">{feature.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20"
          >
            <Leaf className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm sm:text-base">
              Join thousands of volunteers who are transforming their communities one cleanup at a time.
            </p>
            <Link to="/signup">
              <Button size="lg" className="gap-2 h-12 px-8 text-base">
                Join the Movement
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 md:px-8 py-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            <span>StreetSweep AI</span>
          </div>
          <p>© 2025 StreetSweep AI. Making cities cleaner.</p>
        </div>
      </footer>
    </div>
  );
}
