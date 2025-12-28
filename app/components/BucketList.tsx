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

// Initialize client lazily outside to avoid multiple instances, but handle configuration state
let client: any = null;

const MotionButton = motion(Button);

type BucketItem = Schema["BucketItem"]["type"];

export default function BucketList() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  // Subscribe to real-time updates
  useEffect(() => {
    // Defensive check to see if the model exists in the current client configuration
    const bucketModel = (client.models as any)?.BucketItem;
    
    if (!bucketModel) {
      console.warn("BucketItem model not found in the current Amplify configuration. Please run 'npx ampx sandbox' to sync your backend.");
      setIsLoading(false);
      return;
    }

    try {
      const sub = bucketModel.observeQuery().subscribe({
        next: ({ items }: { items: BucketItem[] }) => {
          const sortedItems = [...items].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          setItems(sortedItems);
          setIsLoading(false);
        },
        error: (error: any) => {
          console.error('Error fetching bucket items:', error);
          setIsLoading(false);
        },
      });

      return () => sub.unsubscribe();
    } catch (e) {
      console.error("Failed to initialize BucketItem subscription:", e);
      setIsLoading(false);
    }
  }, []);

  const addItem = async () => {
    if (newItem.trim()) {
      const bucketModel = (client.models as any)?.BucketItem;
      if (!bucketModel) {
        console.error("Cannot add item: BucketItem model not found.");
        return;
      }
      const text = newItem.trim();
      const tempId = `temp-${Date.now()}`;
      
      // Optimistic update
      const optimisticItem: BucketItem = {
        id: tempId,
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      } as BucketItem;
      
      setItems(prev => [optimisticItem, ...prev]);
      setNewItem('');
      setIsAdding(false);
      
      try {
        await bucketModel.create({
          text,
          completed: false,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to add item', error);
        // Revert on error
        setItems(prev => prev.filter(item => item.id !== tempId));
      }
    }
  };

  const toggleComplete = async (item: BucketItem) => {
    const bucketModel = (client.models as any)?.BucketItem;
    if (!bucketModel) return;

    // Optimistic update
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, completed: !i.completed } : i
    ));

    try {
      await bucketModel.update({
        id: item.id,
        completed: !item.completed,
      });
    } catch (error) {
      console.error('Failed to toggle item', error);
      // Revert on error
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, completed: item.completed } : i
      ));
    }
  };

  const deleteItem = async (id: string) => {
    const bucketModel = (client.models as any)?.BucketItem;
    if (!bucketModel) return;

    // Save previous state for revert
    const previousItems = [...items];

    // Optimistic update
    setItems(prev => prev.filter(item => item.id !== id));

    try {
      await bucketModel.delete({ id });
    } catch (error) {
      console.error('Failed to delete item', error);
      // Revert on error
      setItems(previousItems);
    }
  };

  const handleEdit = (item: BucketItem) => {
    setEditingItem(item);
    setEditText(item.text || '');
  };

  const saveEdit = async () => {
    if (!editingItem || !editText.trim()) return;

    const bucketModel = (client.models as any)?.BucketItem;
    if (!bucketModel) return;

    const updatedText = editText.trim();
    const originalItem = { ...editingItem };

    // Optimistic update
    setItems(prev => prev.map(i => 
      i.id === editingItem.id ? { ...i, text: updatedText } : i
    ));
    setEditingItem(null);

    try {
      await bucketModel.update({
        id: originalItem.id,
        text: updatedText,
      });
    } catch (error) {
      console.error('Failed to update item', error);
      // Revert on error
      setItems(prev => prev.map(i => 
        i.id === originalItem.id ? originalItem : i
      ));
    }
  };


  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
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
          <div className="mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium flex items-center gap-2">
                <span className="text-gray-600">Progress</span>
                <Badge variant="secondary" className="bg-pink-100 text-pink-600 hover:bg-pink-100 border-none">
                  {completedCount} / {totalCount}
                </Badge>
              </div>
              <Badge variant="outline" className="text-pink-600 font-bold border-pink-200">
                {Math.round(progress)}%
              </Badge>
            </div>
            <Progress value={progress} className="h-3 bg-gray-100" />
          </div>

          {/* Add New Item */}
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                    placeholder="Add a dream..."
                    className="w-full sm:flex-1 h-12 rounded-xl border-2 border-pink-200 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:border-pink-400"
                    autoFocus
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={addItem}
                      className="flex-1 sm:w-16 h-12 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-pink-500/30 hover:scale-[1.05] active:scale-95 transition-all border-none"
                    >
                      <i className="fas fa-plus"></i>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsAdding(false);
                        setNewItem('');
                      }}
                      className="w-12 h-12 rounded-xl hover:bg-gray-200"
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
                className="w-full mb-6 h-12 border-2 border-dashed border-pink-300 rounded-xl text-pink-500 font-semibold hover:bg-pink-50 hover:border-pink-400 transition-all flex items-center justify-center gap-2 active:scale-[0.99] bg-transparent"
              >
                <i className="fas fa-plus-circle"></i>
                Add New Dream
              </MotionButton>
            )}
          </AnimatePresence>

          {/* Bucket List Items */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar relative"
          >
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 border-gray-100 bg-white shadow-sm">
                    <Skeleton className="h-6 w-6 rounded-full bg-gray-100" />
                    <Skeleton className="h-5 flex-1 bg-gray-100" />
                    <Skeleton className="h-8 w-8 rounded-md bg-gray-100" />
                  </div>
                ))}
              </div>
            )}
            <AnimatePresence initial={false} mode='popLayout'>
              {items.length === 0 && !isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-400"
                >
                  <i className="fas fa-heart text-6xl mb-4 text-pink-200"></i>
                  <p className="text-lg">Start adding your dreams for 2026!</p>
                </motion.div>
              ) : (
                items.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`group flex items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-colors duration-200 ${
                      item.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-pink-200 hover:shadow-md'
                    }`}
                  >
                    {editingItem?.id === item.id ? (
                      <div className="flex-1 flex items-center gap-2 w-full animate-in fade-in slide-in-from-left-2 duration-200">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') saveEdit();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setEditingItem(null);
                          }}
                          className="flex-1 h-10 rounded-xl border-2 border-pink-300 focus-visible:ring-pink-400 bg-white"
                          autoFocus
                        />
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={saveEdit}
                            className="text-green-500 hover:bg-green-50 h-10 w-10 bg-white shadow-sm border border-green-100 rounded-xl"
                          >
                            <i className="fas fa-check"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingItem(null)}
                            className="text-gray-400 hover:bg-gray-50 h-10 w-10 bg-white shadow-sm border border-gray-100 rounded-xl"
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="pt-0.5 sm:pt-0">
                          <Checkbox 
                            checked={!!item.completed}
                            onCheckedChange={() => toggleComplete(item)}
                            className={cn(
                              "peer h-6 w-6 shrink-0 rounded-full border-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white",
                              item.completed
                                ? 'border-pink-500' // Ensure border is pink when checked
                                : 'border-gray-300 hover:border-pink-400'
                            )}
                          />
                        </div>

                        <span
                          className={`flex-1 transition-all duration-200 break-words min-w-0 ${
                            item.completed
                              ? 'line-through text-gray-500'
                              : 'text-gray-800 font-medium'
                          }`}
                        >
                          {item.text}
                        </span>

                        <div className="flex gap-1 shrink-0">
                          {!item.completed && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item)}
                              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-pink-400 hover:text-pink-600 hover:bg-pink-50 p-2 active:scale-95 duration-200"
                            >
                              <i className="fas fa-edit text-sm"></i>
                            </Button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50 p-2 active:scale-95 duration-200 shrink-0"
                              >
                                <i className="fas fa-trash text-sm"></i>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-card bg-black/90 backdrop-blur-xl border-white/10 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this dream?</AlertDialogTitle>
                                <AlertDialogDescription className="text-white/60">
                                  Are you sure you want to remove "{item.text}" from our bucket list?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteItem(item.id)}
                                  className="bg-red-600 text-white hover:bg-red-700 border-none"
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
          </motion.div>

          {/* Footer Message */}

          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 pt-6 border-t border-gray-200 text-center"
            >
              <p className="text-sm text-gray-600 italic">
                <i className="fas fa-sparkles text-pink-400 mr-2"></i>
                {completedCount === totalCount && totalCount > 0
                  ? "Amazing! You've completed all your dreams! 🎉"
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
