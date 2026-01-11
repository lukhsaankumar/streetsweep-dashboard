import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Camera, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (afterImageFile: File) => Promise<{ success: boolean; result?: any }>;
  onReclaim?: () => void;
  onRelease?: () => void;
  ticketTitle: string;
}


export function CompletionDialog({ open, onOpenChange, onComplete, onReclaim, onRelease, ticketTitle }: CompletionDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        setUploadedPreview(url);
        setSelectedImage(url);
        setSelectedFile(file);
        setIsUploading(false);
      }, 500);
    }
  };

  const handleSubmit = async () => {
    if (selectedFile) {
      setIsSubmitting(true);
      const result = await onComplete(selectedFile);
      setIsSubmitting(false);
      
      if (result.success) {
        // Success - close dialog
        onOpenChange(false);
        resetState();
      } else {
        // Failed - show result screen
        setResultSuccess(false);
        setShowResult(true);
      }
    }
  };

  const resetState = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setUploadedPreview(null);
    setShowResult(false);
    setResultSuccess(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  const handleReclaim = () => {
    // Reclaim does nothing - ticket stays claimed under current user
    onOpenChange(false);
    resetState();
  };

  const handleRelease = () => {
    // Release calls unclaim/claim endpoint to release the ticket
    onRelease?.();
    onOpenChange(false);
    resetState();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            {showResult ? 'Cleanup Review' : 'Complete Cleanup'}
          </DialogTitle>
        </DialogHeader>

        {showResult ? (
          <div className="space-y-4 mt-2">
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500 mb-2">
                You missed some spots
              </p>
              <p className="text-sm text-muted-foreground">
                The ticket has been updated based on what you missed. You can reclaim it to finish the job or release it for someone else.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRelease} className="flex-1">
                Release Ticket
              </Button>
              <Button onClick={handleReclaim} className="flex-1">
                Reclaim & Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Upload a photo showing the area after cleanup for <span className="font-medium text-foreground">"{ticketTitle}"</span>
            </p>

          {/* Upload Section */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Upload your photo</p>
            
            {uploadedPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-primary">
                <img 
                  src={uploadedPreview} 
                  alt="Uploaded" 
                  className="w-full h-40 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => {
                    setUploadedPreview(null);
                    setSelectedImage(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                  Selected ✓
                </div>
              </div>
            ) : (
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  "hover:border-primary/50 hover:bg-muted/50",
                  isUploading && "pointer-events-none opacity-50"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                )}
                <p className="text-sm text-muted-foreground">
                  {isUploading ? 'Uploading...' : 'Click to upload or take photo'}
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
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>


          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedImage || isSubmitting}
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Complete
                </>
              )}
            </Button>
          </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
