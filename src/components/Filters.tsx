import { useState } from 'react';
import { useTickets } from '@/contexts/TicketsContext';
import { TicketPriority, TicketState } from '@/data/dummyTickets';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const priorities: { value: TicketPriority | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const states: { value: TicketState | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLAIMED', label: 'Claimed' },
  { value: 'COMPLETED', label: 'Completed' },
];

const sortOptions: { value: 'severity' | 'newest' | 'oldest'; label: string }[] = [
  { value: 'severity', label: 'Severity' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

export function Filters() {
  const { filters, setFilters } = useTickets();
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setFilters({ ...filters, search: value || undefined });
  };

  const clearFilters = () => {
    setSearchValue('');
    setFilters({ sortBy: 'severity' });
  };

  const hasActiveFilters = filters.priority || filters.state || filters.search;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tickets..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-muted border-border focus-ring"
          aria-label="Search tickets by title, camera, or description"
        />
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "gap-2",
            showFilters && "border-primary text-primary"
          )}
          aria-expanded={showFilters}
          aria-controls="filter-panel"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear all filters"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div id="filter-panel" className="p-4 bg-muted/50 rounded-lg space-y-4 animate-fade-in">
          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Priority</label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by priority">
              {priorities.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setFilters({ ...filters, priority: p.value })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors focus-ring",
                    filters.priority === p.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-muted"
                  )}
                  role="radio"
                  aria-checked={filters.priority === p.value}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by status">
              {states.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setFilters({ ...filters, state: s.value })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors focus-ring",
                    filters.state === s.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-muted"
                  )}
                  role="radio"
                  aria-checked={filters.state === s.value}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Sort by</label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Sort tickets">
              {sortOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFilters({ ...filters, sortBy: s.value })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors focus-ring",
                    filters.sortBy === s.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-muted"
                  )}
                  role="radio"
                  aria-checked={filters.sortBy === s.value}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
