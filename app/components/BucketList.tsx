'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Initialize client lazily outside to avoid multiple instances, but handle configuration state
let client: any = null;

const MotionButton = motion(Button);

type BucketItem = Schema["BucketItem"]["type"];

export default function BucketList() {
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketItem | null>(null);
  const [editText, setEditText] = useState('');

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
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    },
  });

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


  const completedCount = items.filter((item: BucketItem) => item.completed).length;
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
          <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative">
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
            
            <div className="space-y-4">
              <AnimatePresence initial={false} mode="popLayout">
                {items.length === 0 && !isLoading ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={layoutTransition}
                    className="text-center py-16 text-gray-400"
                  >
                    <i className="fas fa-heart text-7xl mb-6 text-pink-100"></i>
                    <p className="text-xl font-medium text-gray-400">Start adding your dreams for 2026!</p>
                  </motion.div>
                ) : (
                  items.map((item: BucketItem) => (
                    <motion.div
                      layout
                      transition={layoutTransition}
                      key={item.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className={`w-full group flex flex-col md:flex-row md:items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 ${
                        item.completed
                          ? 'bg-green-50/50 border-green-100 shadow-sm'
                          : 'bg-white border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5'
                      }`}
                    >
                      {editingItem?.id === item.id ? (
                        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full animate-in fade-in slide-in-from-left-2 duration-300 p-1">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') saveEdit();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') setEditingItem(null);
                            }}
                            className="flex-1 h-12 sm:h-14 rounded-xl border-2 border-pink-200 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 bg-white text-base px-4 transition-all"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end sm:shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={saveEdit}
                              className="flex-1 sm:flex-none text-green-500 hover:bg-green-100 h-11 w-full sm:w-12 bg-white shadow-sm border border-green-100 rounded-xl transition-all active:scale-95"
                            >
                              <i className="fas fa-check"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingItem(null)}
                              className="flex-1 sm:flex-none text-gray-400 hover:bg-gray-100 h-11 w-full sm:w-12 bg-white shadow-sm border border-gray-100 rounded-xl transition-all active:scale-95"
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="pt-0.5 shrink-0 relative group/checkbox">
                              <Checkbox 
                                checked={!!item.completed}
                                onCheckedChange={() => toggleComplete(item)}
                                className={cn(
                                  "peer h-8 w-8 rounded-full border-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white transition-all duration-300",
                                  item.completed
                                    ? 'border-pink-500'
                                    : 'border-pink-200 bg-pink-50/30 hover:border-pink-400 hover:bg-pink-100/50'
                                )}
                              />
                              {!item.completed && (
                                <i className="fas fa-heart absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-pink-200 group-hover/checkbox:text-pink-400 transition-colors pointer-events-none"></i>
                              )}
                            </div>

                            <span
                            className={`flex-1 break-words min-w-0 text-[15px] sm:text-lg leading-relaxed ${
                              item.completed
                                ? 'line-through text-gray-400 font-normal italic'
                                : 'text-gray-700 font-semibold'
                            }`}
                          >
                              {item.text}
                            </span>
                          </div>

                          <div className="flex gap-2 shrink-0 items-center justify-end md:justify-center mt-2 md:mt-0 pt-2 md:pt-0 border-t border-gray-50 md:border-none">
                            {!item.completed && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all text-pink-400 hover:text-pink-600 hover:bg-pink-50 h-9 w-9 sm:h-11 sm:w-11 rounded-xl active:scale-90 duration-200"
                              >
                                <i className="fas fa-edit text-sm"></i>
                              </Button>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all text-red-400 hover:text-red-600 hover:bg-red-50 h-9 w-9 sm:h-11 sm:w-11 rounded-xl active:scale-90 duration-200"
                                >
                                  <i className="fas fa-trash text-sm"></i>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-card bg-black/90 backdrop-blur-xl border-white/10 text-white rounded-3xl mx-4">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-bold">Delete this dream?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-white/60">
                                    Are you sure you want to remove "{item.text}" from our bucket list?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-row gap-2">
                                  <AlertDialogCancel className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl mt-0">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteItem(item.id)}
                                    className="flex-1 bg-red-600 text-white hover:bg-red-700 border-none rounded-xl"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
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
