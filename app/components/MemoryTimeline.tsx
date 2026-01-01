'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { type Schema } from '@/amplify/data/resource';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import AddMemoryForm from './AddMemoryForm';
import { useMemories, type MemoryWithUrls } from '@/app/hooks/useMemories';
import { useMilestones } from '@/app/hooks/useMilestones';

export default function MemoryTimeline() {
  const { memories, isLoading } = useMemories();
  const { nextMilestone, milestones } = useMilestones();
  const [editingMemory, setEditingMemory] = useState<MemoryWithUrls | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Helper to group memories
  const groupedMemories = memories.reduce((acc, memory) => {
    const memoryDate = new Date(memory.date);
    const year = memoryDate.getFullYear().toString();
    const month = memoryDate.toLocaleString('default', { month: 'long' });
    const day = memoryDate.getDate().toString();

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = {};
    if (!acc[year][month][day]) acc[year][month][day] = [];
    
    acc[year][month][day].push(memory);
    return acc;
  }, {} as Record<string, Record<string, Record<string, MemoryWithUrls[]>>>);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  // Determine if we should show a milestone marker for a specific year
  const getMilestoneForYear = (year: string) => {
    if (!nextMilestone) return null;
    const milestoneYear = new Date(nextMilestone.date).getFullYear().toString();
    return milestoneYear === year ? nextMilestone : null;
  };

  // Helper to calculate total cost for a day
  const getDayTotalCost = (memories: MemoryWithUrls[]) => {
    return memories.reduce((total, m) => total + (m.cost || 0), 0);
  };

  return (
    <section className="space-y-8 pb-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl text-white drop-shadow-md mb-3 script-font">Our Journey</h2>
        <div className="h-1 w-24 bg-white mx-auto rounded-full opacity-50"></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {Object.keys(groupedMemories).sort((a, b) => Number(b) - Number(a)).map(year => (
          <div key={year} className="mb-12">
            {/* Year Header */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
              <h3 className="text-3xl md:text-4xl font-bold text-white/90 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                {year}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
            </motion.div>

            <div className="space-y-12">
              {/* Year Milestone Marker */}
              {getMilestoneForYear(year) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-white/20 backdrop-blur-md text-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500 opacity-50"></div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl animate-pulse">
                      <i className={`fas fa-${getMilestoneForYear(year)!.icon || 'star'} text-yellow-300`}></i>
                    </div>
                    <h4 className="text-xl font-bold text-white">{getMilestoneForYear(year)!.title}</h4>
                    <p className="text-sm text-pink-200 font-medium">
                      Coming {new Date(getMilestoneForYear(year)!.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ✨
                    </p>
                  </div>
                </motion.div>
              )}

              {Object.keys(groupedMemories[year]).map(month => (
                <div key={month} className="space-y-8">
                  {/* Month Header */}
                  <div className="flex items-center gap-3 mb-6 ml-2">
                    <div className="w-2.5 h-2.5 bg-pink-400 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.5)]"></div>
                    <span className="text-xl font-bold text-pink-200 capitalize tracking-wide">{month}</span>
                  </div>

                  {/* Day Groups */}
                  <div className="space-y-10">
                    {Object.keys(groupedMemories[year][month]).sort((a, b) => Number(b) - Number(a)).map(day => {
                      const dayMemories = groupedMemories[year][month][day];
                      const totalCost = getDayTotalCost(dayMemories);
                      const displayDate = new Date(dayMemories[0].date);

                      return (
                        <div key={`${year}-${month}-${day}`} className="relative pl-0 md:pl-20">
                          {/* Desktop Date Sidebar */}
                          <div className="hidden md:flex absolute left-0 top-0 flex-col items-center">
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 border-2 border-pink-100 shadow-lg text-center min-w-[70px]"
                            >
                              <div className="text-3xl font-black text-pink-600 leading-none">{day}</div>
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                {displayDate.toLocaleString('default', { month: 'short' })}
                              </div>
                            </motion.div>
                            {/* Connection Line */}
                            <div className="w-0.5 h-full bg-gradient-to-b from-pink-300/50 via-pink-300/20 to-transparent mt-4 rounded-full"></div>
                          </div>

                          {/* Mobile Date Header */}
                          <div className="md:hidden flex items-center justify-between mb-3 px-2">
                            <div className="flex items-center gap-3">
                              <div className="bg-pink-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-md">
                                {day} {displayDate.toLocaleString('default', { month: 'short' })}
                              </div>
                              {dayMemories.length > 1 && (
                                <span className="text-xs font-semibold text-pink-200 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                                  {dayMemories.length} activities
                                </span>
                              )}
                            </div>
                            {totalCost > 0 && (
                              <div className="text-[10px] font-bold text-green-300 bg-green-900/30 px-2 py-0.5 rounded-full border border-green-500/30 backdrop-blur-sm">
                                Total: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCost)}
                              </div>
                            )}
                          </div>

                          {/* Memory Items in Day */}
                          <div className="space-y-4">
                            {dayMemories.map((memory, idx) => (
                              <motion.div
                                layout
                                key={memory.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                onClick={(e) => toggleExpand(memory.id, e)}
                                className={`group cursor-pointer bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-xl border-2 transition-all duration-300 ${
                                  expandedId === memory.id ? 'border-pink-400 shadow-pink-500/20' : 'border-white/50 hover:border-pink-200'
                                }`}
                              >
                                {/* Activity Card Content */}
                                <div className="flex items-center gap-4 p-4">
                                  {/* Mobile Activity Indicator */}
                                  <div className="md:hidden flex-shrink-0 w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 font-bold text-xs border border-pink-100">
                                    {idx + 1}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-base md:text-lg font-bold text-gray-800 mb-1 break-words">
                                      {memory.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                      {memory.location && (
                                        <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                                          <i className="fas fa-map-marker-alt text-pink-500 text-[10px]"></i>
                                          <span className="font-medium truncate max-w-[150px]">{memory.location}</span>
                                        </div>
                                      )}
                                      {memory.cost && memory.cost > 0 && (
                                        <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                                          <i className="fas fa-coins text-green-600 text-[10px]"></i>
                                          <span className="font-bold">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(memory.cost)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Thumbnail */}
                                  {memory.imageUrls && memory.imageUrls.length > 0 && (
                                    <div className="flex-shrink-0">
                                      <div 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setLightboxImage(memory.imageUrls![0]);
                                        }}
                                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-white shadow-md cursor-zoom-in hover:shadow-lg transition-all"
                                      >
                                        <img 
                                          src={memory.imageUrls[0]} 
                                          alt={memory.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {memory.imageUrls.length > 1 && (
                                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white font-bold text-xs">+{memory.imageUrls.length}</span>
                                          </div>
                                        )}
                                        {memory.imageUrls.length > 1 && (
                                          <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm group-hover:hidden">
                                            +{memory.imageUrls.length - 1}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Expand Icon */}
                                  <div className="flex-shrink-0">
                                    <motion.div 
                                      animate={{ rotate: expandedId === memory.id ? 180 : 0 }}
                                      className="text-pink-400 group-hover:text-pink-500 transition-colors"
                                    >
                                      <i className="fas fa-chevron-down text-lg"></i>
                                    </motion.div>
                                  </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence initial={false}>
                                  {expandedId === memory.id && (
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
                                                    setLightboxImage(url);
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
                                            onClick={(e) => { e.stopPropagation(); setEditingMemory(memory); }}
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
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-gray-200" />
                    <Skeleton className="h-4 w-1/2 bg-gray-200" />
                  </div>
                  <Skeleton className="w-16 h-16 rounded-xl bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <i className="fas fa-heart text-3xl text-white/60"></i>
            </div>
            <p className="text-white/70 text-lg italic">Ready to start your journey? Add your first memory!</p>
          </div>
        ) : null}
      </div>

      {/* Edit Memory Modal */}
      <AddMemoryForm 
        open={!!editingMemory}
        onOpenChange={(open) => !open && setEditingMemory(null)}
        initialData={editingMemory}
      />

      {/* Image Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-[80vw] lg:max-w-[70vw] p-0 overflow-hidden bg-black/90 border-none shadow-2xl backdrop-blur-xl">
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
          </VisuallyHidden>
          
          <div className="relative w-full h-[80vh] flex items-center justify-center p-2">
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shadow-lg border border-white/20 backdrop-blur-md"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
            {lightboxImage && (
              <motion.img 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={lightboxImage} 
                alt="Memory Preview" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
