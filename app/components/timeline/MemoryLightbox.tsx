import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

interface MemoryLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryLightbox({ images, initialIndex, isOpen, onClose }: MemoryLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  
  // Reset index when opening with a new initialIndex
  useEffect(() => {
    if (isOpen) {
      setIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (index < images.length - 1) {
      setIndex(index + 1);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50 && index < images.length - 1) {
      setIndex(index + 1);
    } else if (info.offset.x > 50 && index > 0) {
      setIndex(index - 1);
    }
  };

  if (!images.length) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[100vw] h-[100vh] md:max-w-[90vw] md:h-[90vh] p-0 border-none bg-black/95 shadow-2xl backdrop-blur-xl flex flex-col justify-center items-center">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Image Gallery ({index + 1}/{images.length})</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shadow-lg border border-white/20 backdrop-blur-md"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* Navigation Buttons (Desktop) */}
        {index > 0 && (
          <button
            onClick={prevImage}
            className="hidden md:flex absolute left-4 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
          >
            <i className="fas fa-chevron-left text-2xl"></i>
          </button>
        )}
        
        {index < images.length - 1 && (
          <button
            onClick={nextImage}
            className="hidden md:flex absolute right-4 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
          >
            <i className="fas fa-chevron-right text-2xl"></i>
          </button>
        )}

        {/* Main Image Area */}
        <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={index}
              src={images[index]}
              alt={`Photo ${index + 1}`}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-full max-h-full object-contain touch-pan-y"
            />
          </AnimatePresence>

          {/* Mobile Image Counter / Dots */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <div 
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === index ? 'bg-white scale-125' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
