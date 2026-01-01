import { motion, AnimatePresence } from "motion/react";
import type { MemoryWithUrls } from "@/app/hooks/useMemories";

interface MemoryCardProps {
  memory: MemoryWithUrls;
  idx: number;
  isExpanded: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onImageClick: (url: string) => void;
  onEdit: (memory: MemoryWithUrls) => void;
}

export function MemoryCard({
  memory,
  idx,
  isExpanded,
  onToggle,
  onImageClick,
  onEdit,
}: MemoryCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onToggle}
      className={`group cursor-pointer bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-xl border-2 transition-all duration-300 ${
        isExpanded
          ? "border-pink-400 shadow-pink-500/20"
          : "border-white/50 hover:border-pink-200"
      }`}
    >
      {/* Activity Card Content */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
        {/* Mobile Header: Index + Title + Arrow */}
        <div className="flex items-start gap-3 sm:hidden w-full">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 font-bold text-xs border border-pink-100 mt-0.5">
            {idx + 1}
          </div>
          <h4 className="flex-1 text-base font-bold text-gray-800 break-words leading-tight mt-1">
            {memory.title}
          </h4>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-pink-400 mt-1"
          >
            <i className="fas fa-chevron-down text-lg"></i>
          </motion.div>
        </div>

        {/* Desktop: Content Structure */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 w-full">
          {/* Desktop Title */}
          <h4 className="hidden sm:block text-lg font-bold text-gray-800 break-words">
            {memory.title}
          </h4>

          {/* Meta Tags (Location & Cost) */}
          <div className="flex flex-wrap items-center gap-2 text-xs w-full">
            {memory.location && (
              <div className="flex items-start gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 max-w-full">
                <i className="fas fa-map-marker-alt text-pink-500 text-[10px] mt-0.5 flex-shrink-0"></i>
                <span className="font-medium whitespace-normal break-words text-left leading-snug">
                  {memory.location}
                </span>
              </div>
            )}
            {memory.cost && memory.cost > 0 && (
              <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 whitespace-nowrap">
                <i className="fas fa-coins text-green-600 text-[10px]"></i>
                <span className="font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(memory.cost)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Right Side Actions (Thumb + Arrow) */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-1 sm:mt-0 pl-11 sm:pl-0">
          {/* Thumbnail */}
          {memory.imageUrls && memory.imageUrls.length > 0 && (
            <div className="flex-shrink-0">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick(memory.imageUrls![0]);
                }}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border border-white shadow-sm cursor-zoom-in"
              >
                <img
                  src={memory.imageUrls[0]}
                  alt={memory.title}
                  className="w-full h-full object-cover"
                />
                {memory.imageUrls.length > 1 && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      +{memory.imageUrls.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop Arrow */}
          <div className="hidden sm:block flex-shrink-0">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-pink-400 group-hover:text-pink-500 transition-colors"
            >
              <i className="fas fa-chevron-down text-lg"></i>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4 space-y-4 bg-gradient-to-br from-gray-50/50 to-white">
              {memory.description && (
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-100 relative">
                  <i className="fas fa-quote-left absolute top-2 left-2 text-pink-200 text-xs"></i>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap italic pl-4">
                    {memory.description}
                  </p>
                </div>
              )}

              {/* Image Gallery */}
              {memory.imageUrls && memory.imageUrls.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      Gallery ({memory.imageUrls.length})
                    </h5>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {memory.imageUrls.map((url, i) => (
                      <div
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageClick(url);
                        }}
                        className="aspect-square rounded-lg overflow-hidden border-2 border-white shadow-sm hover:shadow-md transition-shadow cursor-zoom-in"
                      >
                        <img
                          src={url}
                          alt={`${memory.title} ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(memory);
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 font-bold text-xs uppercase tracking-widest"
                >
                  <i className="fas fa-edit"></i>
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
