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
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl text-white drop-shadow-md mb-2">
          Our 2026 Bucket List
        </h2>
        <div className="h-1 w-24 bg-white mx-auto rounded-full opacity-50"></div>
      </div>

      <Card className="glass-card bg-white/95 backdrop-blur-md border-none rounded-3xl p-6 md:p-8 shadow-2xl max-w-3xl mx-auto">
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
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                    placeholder="Add a dream to achieve together..."
                    className="flex-1 h-12 rounded-xl border-pink-200 focus-visible:ring-pink-400"
                    autoFocus
                  />
                  <Button
                    onClick={addItem}
                    className="h-12 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-pink-500/30 hover:scale-[1.05] active:scale-95 transition-all border-none"
                  >
                    <i className="fas fa-plus"></i>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsAdding(false);
                      setNewItem('');
                    }}
                    className="h-12 px-4 rounded-xl hover:bg-gray-200"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
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
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-xl backdrop-blur-sm">
                <motion.i 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="fas fa-spinner text-pink-500 text-3xl"
                />
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
                    className={`group flex items-center gap-3 p-4 rounded-xl border-2 transition-colors duration-200 ${
                      item.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-pink-200 hover:shadow-md'
                    }`}
                  >
                    <Checkbox 
                      checked={item.completed}
                      onCheckedChange={() => toggleComplete(item)}
                      className={cn(
                        "peer h-6 w-6 shrink-0 rounded-full border-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white",
                        item.completed
                          ? 'border-pink-500' // Ensure border is pink when checked
                          : 'border-gray-300 hover:border-pink-400'
                      )}
                    />

                    <span
                      className={`flex-1 transition-all duration-200 ${
                        item.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-800 font-medium'
                      }`}
                    >
                      {item.text}
                    </span>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50 p-2 active:scale-95 duration-200"
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
