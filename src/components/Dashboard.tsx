import { useState } from 'react';
import { useTickets } from '@/contexts/TicketsContext';
import { Header } from '@/components/Header';
import { Filters } from '@/components/Filters';
import { TicketCard } from '@/components/TicketCard';
import { MapView } from '@/components/MapView';
import { TicketDetailDrawer } from '@/components/TicketDetailDrawer';
import { StatsCards } from '@/components/StatsCards';
import { Leaderboard } from '@/components/Leaderboard';
import { AdoptArea } from '@/components/AdoptArea';
import { TrendChart, TopCamerasChart } from '@/components/Charts';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  Trophy, 
  MapPin,
  TrendingUp,
  Camera,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Tab = 'tickets' | 'insights' | 'leaderboard' | 'adopt';

export function Dashboard() {
  const { tickets, selectedTicket, selectTicket, isLoading } = useTickets();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('tickets');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'tickets', label: 'Tickets', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Leaders', icon: <Trophy className="w-4 h-4" /> },
    { id: 'adopt', label: 'Adopt', icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex relative">
        {/* Left Panel */}
        <motion.aside
          initial={false}
          animate={{ 
            width: leftPanelCollapsed ? 0 : 420,
            opacity: leftPanelCollapsed ? 0 : 1,
          }}
          transition={{ duration: 0.3 }}
          className={cn(
            "h-[calc(100vh-4rem)] border-r border-border bg-card flex-shrink-0 overflow-hidden",
            leftPanelCollapsed && "border-r-0"
          )}
        >
          <div className="w-[420px] h-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-border p-2 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors focus-ring",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-pressed={activeTab === tab.id}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                  <div className="space-y-4">
                    <StatsCards />
                    <Filters />
                    
                    {isLoading ? (
                      <div className="py-12 flex flex-col items-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p>Loading tickets...</p>
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No tickets match your filters</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
                        </p>
                        {tickets.map((ticket, index) => (
                          <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <TicketCard
                              ticket={ticket}
                              isSelected={selectedTicket?.id === ticket.id}
                              onClick={() => selectTicket(ticket)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Insights Tab */}
                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    <StatsCards />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Ticket Trends
                      </h3>
                      <div className="p-4 bg-muted rounded-lg">
                        <TrendChart />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Top Cameras
                      </h3>
                      <div className="p-4 bg-muted rounded-lg">
                        <TopCamerasChart />
                      </div>
                    </div>
                  </div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <Trophy className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-foreground">Volunteer Leaderboard</h2>
                    </div>
                    <Leaderboard />
                  </div>
                )}

                {/* Adopt Tab */}
                {activeTab === 'adopt' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-foreground">Adopt-a-Block</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Subscribe to areas near you to stay informed about litter in your neighborhood.
                    </p>
                    <AdoptArea />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </motion.aside>

        {/* Panel toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 rounded-l-none border-l-0 bg-card h-16"
          style={{ left: leftPanelCollapsed ? 0 : 420 }}
          aria-label={leftPanelCollapsed ? 'Show panel' : 'Hide panel'}
        >
          {leftPanelCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>

        {/* Map */}
        <main className="flex-1 h-[calc(100vh-4rem)] p-4">
          <MapView 
            showHeatmap={showHeatmap} 
            onToggleHeatmap={() => setShowHeatmap(!showHeatmap)} 
          />
        </main>

        {/* Ticket Detail Drawer */}
        {selectedTicket && <TicketDetailDrawer />}
      </div>
    </div>
  );
}
