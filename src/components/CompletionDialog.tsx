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
  onComplete: (afterImageFile: File) => void;
  ticketTitle: string;
}


export function CompletionDialog({ open, onOpenChange, onComplete, ticketTitle }: CompletionDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
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

  const handleSubmit = () => {
    if (selectedFile) {
      onComplete(selectedFile);
      onOpenChange(false);
      // Reset state
      setSelectedImage(null);
      setSelectedFile(null);
      setUploadedPreview(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedImage(null);
    setSelectedFile(null);
    setUploadedPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            Complete Cleanup
          </DialogTitle>
        </DialogHeader>

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
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedImage}
              className="flex-1 gap-2"
            >
              <Check className="w-4 h-4" />
              Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
