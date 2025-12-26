'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

// Initialize client lazily outside to avoid multiple instances, but handle configuration state
let client: any = null;

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
      }
    }
  };

  const toggleComplete = async (item: BucketItem) => {
    const bucketModel = (client.models as any)?.BucketItem;
    if (!bucketModel) return;
    try {
      await bucketModel.update({
        id: item.id,
        completed: !item.completed,
      });
    } catch (error) {
      console.error('Failed to toggle item', error);
    }
  };

  const deleteItem = async (id: string) => {
    const bucketModel = (client.models as any)?.BucketItem;
    if (!bucketModel) return;
    try {
      await bucketModel.delete({ id });
    } catch (error) {
      console.error('Failed to delete item', error);
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
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
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-gray-600">
                <span className="font-bold text-pink-600">{completedCount}</span> of{' '}
                <span className="font-bold text-gray-800">{totalCount}</span> completed
              </div>
              <div className="text-sm font-semibold text-pink-600">{Math.round(progress)}%</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Add New Item */}
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                    placeholder="Add a dream to achieve together..."
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={addItem}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewItem('');
                    }}
                    className="px-4 py-3 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="add-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAdding(true)}
                className="w-full mb-6 py-3 border-2 border-dashed border-pink-300 rounded-xl text-pink-500 font-semibold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus-circle"></i>
                Add New Dream
              </motion.button>
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
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-xl">
                <motion.i 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="fas fa-spinner text-pink-500 text-3xl"
                />
              </div>
            )}
            <AnimatePresence>
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
                    key={item.id}
                    variants={itemVariants}
                    layout
                    className={`group flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      item.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-pink-200 hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() => toggleComplete(item)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-pink-400'
                      }`}
                    >
                      {item.completed && (
                        <motion.i
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="fas fa-check text-white text-xs"
                        />
                      )}
                    </button>

                    <span
                      className={`flex-1 transition-all ${
                        item.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-800 font-medium'
                      }`}
                    >
                      {item.text}
                    </span>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-2"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
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
