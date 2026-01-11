import { useState, useRef } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  MapPin, 
  CalendarIcon, 
  Clock, 
  Camera, 
  Upload,
  X,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Ticket, TicketPriority } from '@/types/api';
import { createTicket, classifyImage } from '@/services/api';

interface CreateTicketDialogProps {
  onTicketCreated: (ticket: Ticket) => void;
}

export function CreateTicketDialog({ onTicketCreated }: CreateTicketDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [autoSeverity, setAutoSeverity] = useState<number | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setPriority('MEDIUM');
    setDate(new Date());
    setTime(format(new Date(), 'HH:mm'));
    setImagePreview(null);
    setImageFile(null);
    setImageBase64(null);
    setAutoSeverity(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Read as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageBase64(result);
      };
      reader.readAsDataURL(file);

      // Try to classify the image
      setIsClassifying(true);
      try {
        const classification = await classifyImage(file);
        if (classification.severity !== null) {
          setAutoSeverity(classification.severity);
          // Map 1-10 severity to priority
          if (classification.severity >= 7) {
            setPriority('HIGH');
          } else if (classification.severity >= 4) {
            setPriority('MEDIUM');
          } else {
            setPriority('LOW');
          }
          toast({
            title: 'AI Classification',
            description: `Detected severity: ${classification.severity}/10`,
          });
        }
      } catch (error) {
        console.error('Classification failed:', error);
        // Non-critical, just continue without AI severity
      } finally {
        setIsClassifying(false);
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageBase64(null);
    setAutoSeverity(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !location.trim()) return;
    
    setIsSubmitting(true);

    try {
      // Generate random coordinates near NYC for demo
      // In production, you'd geocode the location string
      const baseLat = 40.7128 + (Math.random() - 0.5) * 0.1;
      const baseLng = -74.0060 + (Math.random() - 0.5) * 0.1;

      // Map priority to severity (1-10)
      const severityMap: Record<TicketPriority, number> = {
        'LOW': autoSeverity || 3,
        'MEDIUM': autoSeverity || 5,
        'HIGH': autoSeverity || 8,
      };

      const response = await createTicket({
        image_url: imagePreview || '',
        image_base64: imageBase64,
        location: {
          lat: baseLat,
          lon: baseLng,
        },
        severity: severityMap[priority],
        description: `${title.trim()}. ${description.trim()}`.trim(),
        claimed: false,
      });

      // Combine date and time
      const dateTime = date ? new Date(date) : new Date();
      const [hours, minutes] = time.split(':').map(Number);
      dateTime.setHours(hours, minutes, 0, 0);

      // Create frontend ticket object
      const newTicket: Ticket = {
        id: response.ticket_id,
        title: title.trim(),
        description: description.trim() || 'User reported litter area requiring cleanup.',
        priority,
        lat: baseLat,
        lng: baseLng,
        createdAt: dateTime.toISOString(),
        state: 'OPEN',
        cameraId: 'user-report',
        cameraName: location.trim(),
        severityScore: severityMap[priority] * 10,
        beforeImageUrl: response.image_url || imagePreview || '/dummy_images/litter-1-before.jpg',
        numDetections: Math.floor(Math.random() * 20) + 5,
        totalAreaRatio: Math.random() * 0.15 + 0.05,
      };

      onTicketCreated(newTicket);
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create ticket',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" size="lg">
          <Plus className="w-5 h-5" />
          Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Report Litter Area
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Photo
            </Label>
            
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                />
                {isClassifying && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      <span className="text-sm font-medium">Analyzing...</span>
                    </div>
                  </div>
                )}
                {autoSeverity !== null && !isClassifying && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Severity: {autoSeverity}/10
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Litter near Queen & Spadina"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the litter situation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location *
            </Label>
            <Input
              placeholder="e.g., Queen St W & Spadina Ave"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Severity
              {autoSeverity !== null && (
                <span className="text-xs text-primary">(AI suggested)</span>
              )}
            </Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? format(date, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={isSubmitting || isClassifying || !title.trim() || !location.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Ticket
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
