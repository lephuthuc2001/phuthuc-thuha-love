'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence, Reorder, useDragControls } from "motion/react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { BucketListItem } from "./bucket-list/BucketListItem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Initialize client lazily outside to avoid multiple instances, but handle configuration state
let client: any = null;

const MotionButton = motion(Button);

type BucketItem = Schema["BucketItem"]["type"];

interface ReorderableItemProps {
  item: BucketItem;
  toggleComplete: (item: BucketItem) => void;
  handleEdit: (item: BucketItem) => void;
  deleteItem: (id: string) => void;
  editingItem: BucketItem | null;
  editText: string;
  setEditText: (text: string) => void;
  saveEdit: () => void;
  setEditingItem: (item: BucketItem | null) => void;
}

const ReorderableItem = ({ item, ...props }: ReorderableItemProps) => {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="relative"
    >
      <BucketListItem 
        item={item} 
        dragControls={controls} 
        isDraggable={true}
        {...props} 
      />
    </Reorder.Item>
  );
};

export default function BucketList() {
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketItem | null>(null);
  const [editText, setEditText] = useState('');
  const [activeItems, setActiveItems] = useState<BucketItem[]>([]);


  // Lazy initialize Amplify client
  if (!client) {
    try {
      client = generateClient<Schema>();
    } catch (e) {
      console.error("Failed to generate Amplify client:", e);
    }
  }

  // Fetch items using TanStack Query
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["bucketItems"],
    queryFn: async () => {
      const { data: bucketItems } = await client.models.BucketItem.list();
      return (bucketItems || []).sort((a: BucketItem, b: BucketItem) => {
        // Sort by order first (ascending), then by creation date (newest first)
        if (a.order !== null && b.order !== null && a.order !== b.order) {
           return (a.order ?? 0) - (b.order ?? 0);
        }
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    },
  });

  useEffect(() => {
    if (items) {
      const active = items.filter((i: BucketItem) => !i.completed);
      // Only update if the order or content has actually changed to avoid jitter
      setActiveItems(prev => {
         const isSame = prev.length === active.length && prev.every((p, i) => p.id === active[i].id);
         return isSame ? prev : active;
      });
    }
  }, [items]);


  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data: newItem } = await client.models.BucketItem.create({
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      });
      return newItem;
    },
    onMutate: async (text) => {
      queryClient.cancelQueries({ queryKey: ["bucketItems"] });
      const previousItems = queryClient.getQueryData<BucketItem[]>(["bucketItems"]);
      
      const optimisticItem = {
        id: `temp-${Date.now()}`,
        text,
        completed: false,
        createdAt: new Date().toISOString(),
        order: previousItems ? previousItems.length : 0, 
      } as BucketItem;


      if (previousItems) {
        queryClient.setQueryData(["bucketItems"], [optimisticItem, ...previousItems]);
      }
      
      return { previousItems };
    },
    onError: (err, text, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["bucketItems"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bucketItems"] });
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BucketItem> & { id: string }) => {
      const { data: updatedItem } = await client.models.BucketItem.update({
        id,
        ...updates,
      });
      return updatedItem;
    },
    onMutate: async (updatedItem) => {
      queryClient.cancelQueries({ queryKey: ["bucketItems"] });
      const previousItems = queryClient.getQueryData<BucketItem[]>(["bucketItems"]);
      
      if (previousItems) {
        queryClient.setQueryData(
          ["bucketItems"],
          previousItems.map((item) =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item
          )
        );
      }
      
      return { previousItems };
    },
    onError: (err, updatedItem, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["bucketItems"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bucketItems"] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await client.models.BucketItem.delete({ id });
    },
    onMutate: async (id) => {
      queryClient.cancelQueries({ queryKey: ["bucketItems"] });
      const previousItems = queryClient.getQueryData<BucketItem[]>(["bucketItems"]);
      
      if (previousItems) {
        queryClient.setQueryData(
          ["bucketItems"],
          previousItems.filter((item) => item.id !== id)
        );
      }
      
      return { previousItems };
    },
    onError: (err, id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["bucketItems"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bucketItems"] });
    },
  });

  const handleReorder = async (newOrder: BucketItem[]) => {
    setActiveItems(newOrder); // Optimistic local update
    
    // Create map of updates needed
    const updates = newOrder.map((item, index) => {
      if (item.order !== index) {
        return { id: item.id, order: index };
      }
      return null;
    }).filter(Boolean);

    if (updates.length > 0) {
      // We process updates in batches or sequence - for now simple Promise.all
      // Note: In a real app, you might want to debounce this or use a more robust sync
      try {
        await Promise.all(updates.map(u => 
          client.models.BucketItem.update({
            id: u!.id,
            order: u!.order
          })
        ));
      } catch (e) {
        console.error("Failed to persist order", e);
        // On error, we might want to refetch
        queryClient.invalidateQueries({ queryKey: ["bucketItems"] });
      }
    }
  };


  const addItem = async () => {
    if (newItem.trim()) {
      createMutation.mutate(newItem.trim());
      setNewItem('');
      setIsAdding(false);
    }
  };

  const toggleComplete = (item: BucketItem) => {
    updateMutation.mutate({
      id: item.id,
      completed: !item.completed,
    });
  };

  const deleteItem = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (item: BucketItem) => {
    setEditingItem(item);
    setEditText(item.text || '');
  };

  const saveEdit = () => {
    if (!editingItem || !editText.trim()) return;
    
    updateMutation.mutate({
      id: editingItem.id,
      text: editText.trim(),
    });
    setEditingItem(null);
  };


  
  const completedItems = items.filter((item: BucketItem) => item.completed);
  const completedCount = completedItems.length;
  const totalCount = items.length;

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03 // Faster stagger
      }
    }
  };

  const layoutTransition = {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 0.8
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 5 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8
      } as const
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      transition: { duration: 0.15 } 
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full"
    >
      <div className="text-center mb-8 px-4">
        <h2 className="text-4xl md:text-5xl text-white drop-shadow-md mb-2 script-font">
          Our 2026 Bucket List
        </h2>
        <div className="h-1 w-24 bg-white mx-auto rounded-full opacity-50"></div>
      </div>

      <div className="px-4 sm:px-6 pb-12 sm:pb-16">
        <Card className="glass-card bg-white/95 backdrop-blur-md border-none rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl max-w-3xl mx-auto overflow-hidden">
        <CardContent className="p-0">
          {/* Stats */}
          <motion.div layout className="mb-10 space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Our Journey</p>
                <div className="text-sm font-medium flex items-center gap-2">
                  <span className="text-gray-600 text-lg">Progress</span>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-600 hover:bg-pink-100 border-none px-3 py-1 text-sm font-bold">
                    {completedCount} / {totalCount}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-pink-600 font-black border-pink-200 text-lg px-3 py-0.5 rounded-lg shadow-sm">
                  {Math.round(progress)}%
                </Badge>
              </div>
            </div>
            <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <Progress value={progress} className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 transition-all duration-1000" />
            </div>
          </motion.div>

          {/* Add New Item */}
          <AnimatePresence mode="popLayout" initial={false}>
            {isAdding ? (
              <motion.div
                layout
                key="input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8 p-1"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                    placeholder="Capture a new dream..."
                    className="w-full sm:flex-1 h-14 rounded-2xl border-2 border-pink-100 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:border-pink-400 bg-white text-lg px-6 transition-all"
                    autoFocus
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={addItem}
                      className="flex-1 sm:w-20 h-14 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:scale-[1.02] active:scale-95 transition-all border-none text-xl"
                    >
                      <i className="fas fa-plus"></i>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsAdding(false);
                        setNewItem('');
                      }}
                      className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all active:scale-95"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <MotionButton
                variant="outline"
                key="add-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsAdding(true)}
                className="w-full mb-8 h-16 border-2 border-dashed border-pink-200 rounded-2xl text-pink-500 font-bold hover:bg-pink-50/50 hover:border-pink-400 hover:text-pink-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] bg-white/50 text-lg shadow-sm"
              >
                <i className="fas fa-plus-circle text-xl"></i>
                Add New Dream
              </MotionButton>
            )}
          </AnimatePresence>

          {/* Bucket List Items */}
          <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar relative space-y-8">
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 border-gray-100 bg-white shadow-sm">
                    <Skeleton className="h-7 w-7 rounded-full bg-gray-100" />
                    <Skeleton className="h-6 flex-1 bg-gray-100" />
                    <Skeleton className="h-9 w-9 rounded-xl bg-gray-100" />
                  </div>
                ))}
              </motion.div>
            )}
            
            {/* Active Items (Reorderable) */}
             <div>
               <div className="flex items-center gap-2 mb-4">
                 <h3 className="text-lg font-bold text-gray-700">To Do</h3>
                 <Badge variant="secondary" className="bg-pink-100 text-pink-600 border-none">{activeItems.length}</Badge>
               </div>
               
               <Reorder.Group axis="y" values={activeItems} onReorder={handleReorder} className="space-y-3">
                {activeItems.length === 0 && !isLoading ? (
                   <motion.div
                    key="empty-todo"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl"
                  >
                    <p className="text-gray-400">No active dreams. Add one above! ✨</p>
                  </motion.div>
                ) : (
                  activeItems.map((item: BucketItem) => (
                    <ReorderableItem 
                        key={item.id} 
                        item={item}
                        toggleComplete={toggleComplete} 
                        handleEdit={handleEdit} 
                        deleteItem={deleteItem}
                        editingItem={editingItem}
                        editText={editText}
                        setEditText={setEditText}
                        saveEdit={saveEdit}
                        setEditingItem={setEditingItem}
                    />
                  ))
                )}
               </Reorder.Group>
            </div>

            {/* Completed Items */}
            {completedItems.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-bold text-gray-400">Completed</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-600 border-none">{completedCount}</Badge>
                </div>
                <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                   {completedItems.map((item: BucketItem) => (
                     <BucketListItem 
                        key={item.id}
                        item={item} 
                        toggleComplete={toggleComplete} 
                        handleEdit={handleEdit} 
                        deleteItem={deleteItem}
                        editingItem={editingItem}
                        editText={editText}
                        setEditText={setEditText}
                        saveEdit={saveEdit}
                        setEditingItem={setEditingItem}
                        isDraggable={false}
                      />
                   ))}
                </div>
              </div>
            )}
          </div>



        {/* Footer Message */}

          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 pt-8 border-t border-gray-100 text-center"
            >
              <p className="text-base text-gray-400 italic font-medium">
                <i className="fas fa-sparkles text-pink-300 mr-2"></i>
                {completedCount === totalCount && totalCount > 0
                  ? "Amazing! We've completed all our dreams! 🎉"
                  : "Every dream achieved together is a memory forever ✨"}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ec4899;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #db2777;
        }
      `}</style>
    </motion.section>
  );
}
