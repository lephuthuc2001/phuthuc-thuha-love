import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { motion } from "motion/react";

interface MemoryLightboxProps {
  image: string | null;
  onClose: () => void;
}

export function MemoryLightbox({ image, onClose }: MemoryLightboxProps) {
  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-[80vw] lg:max-w-[70vw] p-0 overflow-hidden bg-black/90 border-none shadow-2xl backdrop-blur-xl">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        <div className="relative w-full h-[80vh] flex items-center justify-center p-2">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shadow-lg border border-white/20 backdrop-blur-md"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
          {image && (
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={image}
              alt="Memory Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
