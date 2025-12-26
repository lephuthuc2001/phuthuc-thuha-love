'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { type Schema } from '@/amplify/data/resource';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AddMemoryForm from './AddMemoryForm';

const client = generateClient<Schema>();

type MemoryWithUrls = Schema['Memory']['type'] & { imageUrls?: string[] };

export default function MemoryTimeline() {
  const [memories, setMemories] = useState<MemoryWithUrls[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMemory, setEditingMemory] = useState<MemoryWithUrls | null>(null);

  useEffect(() => {
    const sub = client.models.Memory.observeQuery().subscribe({
      next: async ({ items }) => {
        // Sort by date descending (newest first)
        const sortedItems = items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Fetch image URLs for each memory
        const itemsWithUrls = await Promise.all(
          sortedItems.map(async (item) => {
            if (item.images && item.images.length > 0) {
              const urls = await Promise.all(
                item.images.map(async (path) => {
                  try {
                    const result = await getUrl({ path: path as string });
                    return result.url.toString();
                  } catch (e) {
                    return null;
                  }
                })
              );
              return { ...item, imageUrls: urls.filter(Boolean) as string[] };
            }
            return { ...item, imageUrls: [] };
          })
        );

        setMemories(itemsWithUrls);
        setIsLoading(false);
      },
      error: (error) => {
        console.error("Error observing memories:", error);
        setIsLoading(false);
      }
    });

    return () => sub.unsubscribe();
  }, []);

  // Helper to group memories
  const groupedMemories = memories.reduce((acc, memory) => {
    const date = new Date(memory.date);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('default', { month: 'long' });

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    
    acc[year][month].push(memory);
    return acc;
  }, {} as Record<string, Record<string, MemoryWithUrls[]>>);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling if needed
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="space-y-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl text-white drop-shadow-md mb-2 script-font">Our Journey</h2>
        <div className="h-1 w-24 bg-white mx-auto rounded-full opacity-50 mb-4"></div>

      </div>

      <div className="max-w-3xl mx-auto px-4">
        {Object.keys(groupedMemories).sort((a, b) => Number(b) - Number(a)).map(year => (
          <div key={year} className="mb-16">
            {/* Year Header */}
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-7xl font-bold text-white/20 mb-8 border-b border-white/10 pb-4 select-none"
            >
              {year}
            </motion.h3>

            <div className="space-y-10 pl-2 md:pl-4">
              {Object.keys(groupedMemories[year]).map(month => (
                <div key={month} className="relative">
                  {/* Month Header - Now clearly visible in flow */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-3 h-3 bg-pink-500 rounded-full shadow-lg shadow-pink-500/50"></div>
                    <span className="text-2xl font-bold text-pink-200 capitalize tracking-wide drop-shadow-md">{month}</span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-pink-500/30 to-transparent"></div>
                  </div>

                  <div className="space-y-4 pl-4 border-l-2 border-white/10 ml-1.5 md:ml-1.5">
                    {groupedMemories[year][month].map((memory) => (
                      <motion.div
                        layout
                        key={memory.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        onClick={(e) => toggleExpand(memory.id, e)}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`group cursor-pointer glass-card bg-black/60 hover:bg-black/70 border border-white/20 rounded-2xl overflow-hidden shadow-xl ${
                          expandedId === memory.id ? 'ring-2 ring-pink-500/50 bg-black/80' : ''
                        }`}
                      >
                        {/* Compact Row */}
                        <div className="flex items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-5 transition-all duration-200">
                          {/* Day Badge */}
                          <div className="flex flex-col items-center justify-center bg-white/10 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border border-white/20 shadow-inner shrink-0 backdrop-blur-md">
                            <span className="text-xl sm:text-2xl font-bold drop-shadow-sm leading-none">{new Date(memory.date).getDate()}</span>
                            <span className="text-[8px] sm:text-[10px] uppercase text-white/80 font-bold tracking-wider mt-0.5 sm:mt-1">
                              {new Date(memory.date).toLocaleString('default', { weekday: 'short' })}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-xl group-hover:text-pink-300 transition-colors duration-200 drop-shadow-md truncate">
                              {memory.title}
                            </h4>
                            <div className="flex flex-wrap items-center text-sm text-white/80 gap-x-4 gap-y-1 mt-1.5">
                              {memory.location && (
                                <span className="flex items-center truncate max-w-[200px]">
                                  <i className="fas fa-map-marker-alt mr-1.5 text-pink-400"></i> {memory.location}
                                </span>
                              )}
                              {memory.cost && memory.cost > 0 && (
                                <span className="flex items-center text-green-300 font-bold tracking-wide bg-green-900/30 px-2 py-0.5 rounded-md border border-green-500/30">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(memory.cost)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Thumbnail / Expand Icon */}
                          <div className="shrink-0 ml-auto pt-1 sm:pt-0">
                            {memory.imageUrls && memory.imageUrls.length > 0 ? (
                              <img 
                                src={memory.imageUrls[0]} 
                                alt="thumb" 
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover border border-white/30 shadow-lg group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10 group-hover:bg-white/10 transition-colors">
                                <i className={`fas ${expandedId === memory.id ? 'fa-align-left' : 'fa-list'} text-base sm:text-lg`}></i>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                        {expandedId === memory.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="border-t border-white/10 bg-black/40"
                          >
                            <div className="p-6 space-y-6">
                              {memory.description && (
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                  <p className="text-white text-base leading-relaxed whitespace-pre-wrap font-light italic">
                                    "{memory.description}"
                                  </p>
                                </div>
                              )}
                              
                              {/* Gallery Grid */}
                              {memory.imageUrls && memory.imageUrls.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {memory.imageUrls.map((url, i) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/20 relative group/img shadow-md cursor-zoom-in">
                                      <img src={url} alt={`memory-${i}`} className="w-full h-full object-cover transition-transform duration-200 group-hover/img:scale-105" />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex justify-end pt-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditingMemory(memory); }}
                                  className="text-white hover:text-pink-100 text-sm flex items-center gap-2 px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 transition-all shadow-lg shadow-pink-600/30 active:scale-95 duration-100 font-medium"
                                >
                                  <i className="fas fa-edit"></i> Edit Memory
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
              ))}
            </div>
          </div>
        ))}
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-16 w-32 bg-white/10" />
                <div className="space-y-4 pl-4 border-l-2 border-white/10">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-4 p-4 glass-card bg-black/40 rounded-2xl">
                      <Skeleton className="w-14 h-14 rounded-2xl bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-1/2 bg-white/10" />
                        <Skeleton className="h-4 w-1/4 bg-white/10" />
                      </div>
                      <Skeleton className="w-14 h-14 rounded-xl bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center text-white/50 py-12 italic">
            Ready to start your journey? Add your first memory!
          </div>
        ) : null}
      </div>

      {/* Edit Memory Modal */}
      <AddMemoryForm 
        open={!!editingMemory}
        onOpenChange={(open) => !open && setEditingMemory(null)}
        initialData={editingMemory}
      />
    </section>
  );
}
