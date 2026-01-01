import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

interface MemoryLightboxProps {
  media: { url: string; type: string }[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryLightbox({ media, initialIndex, isOpen, onClose }: MemoryLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  
  // Reset index when opening with a new initialIndex
  useEffect(() => {
    if (isOpen) {
      setIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (index < media.length - 1) {
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
    if (info.offset.x < -50 && index < media.length - 1) {
      setIndex(index + 1);
    } else if (info.offset.x > 50 && index > 0) {
      setIndex(index - 1);
    }
  };

  if (!media.length) return null;

  const currentItem = media[index];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[100vw] h-[100vh] md:max-w-[90vw] md:h-[90vh] p-0 border-none bg-black/95 shadow-2xl backdrop-blur-xl flex flex-col justify-center items-center">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Media Gallery ({index + 1}/{media.length})</DialogTitle>
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
        
        {index < media.length - 1 && (
          <button
            onClick={nextImage}
            className="hidden md:flex absolute right-4 z-50 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
          >
            <i className="fas fa-chevron-right text-2xl"></i>
          </button>
        )}

        {/* Main Content Area */}
        <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full h-full flex items-center justify-center touch-pan-y"
            >
              {currentItem.type === 'VIDEO' ? (
                 <video 
                   src={currentItem.url} 
                   controls 
                   autoPlay 
                   className="max-w-full max-h-full rounded-lg shadow-2xl"
                 />
              ) : currentItem.type === 'AUDIO' ? (
                 <div className="bg-white/10 p-8 rounded-2xl flex flex-col items-center gap-4 backdrop-blur-md border border-white/20">
                    <i className="fas fa-music text-6xl text-pink-400"></i>
                    <audio src={currentItem.url} controls className="w-full min-w-[300px]" />
                 </div>
              ) : (
                <img
                  src={currentItem.url}
                  alt={`Media ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Mobile Counter / Dots */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-50">
            {media.map((_, i) => (
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
