'use client';

import { useAuthenticator } from "@aws-amplify/ui-react";
import LoveHeader from './LoveHeader';
import TimeCounters from './TimeCounters';
import MemoriesGallery from './MemoriesGallery';
import BucketList from './BucketList';
import Milestones from './Milestones';
import SocialFollow from './SocialFollow';
import MemoryTimeline from './MemoryTimeline';
import { motion } from "motion/react";
import { useState } from 'react';
import AddMemoryForm from './AddMemoryForm';

import { useMilestones } from '@/app/hooks/useMilestones';

export default function MainPage({ images }: { images: string[] }) {
  const { signOut } = useAuthenticator();
  const [showAddMemory, setShowAddMemory] = useState(false);
  const { startDate, nextMilestoneDate } = useMilestones();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-32 md:pb-24 relative z-10 text-white"
    >
      <LoveHeader />

      <main className="max-w-5xl mx-auto space-y-16 md:space-y-20">
        <TimeCounters startDate={startDate} />
        <MemoriesGallery images={images} />
        <MemoryTimeline />
        <BucketList />
        <Milestones />
        <SocialFollow />
      </main>

      {/* Floating Add Memory Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddMemory(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl shadow-pink-500/50 z-40 flex items-center justify-center border-2 border-white/30 backdrop-blur-sm transition-all duration-300"
        aria-label="Add Memory"
      >
        <i className="fas fa-plus text-xl md:text-2xl"></i>
      </motion.button>

      {/* Add Memory Modal */}
      <AddMemoryForm 
        open={showAddMemory} 
        onOpenChange={setShowAddMemory}
      />

      <footer className="text-center mt-16 pb-8 text-white/80">
        <p>Made with <motion.i 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="fas fa-heart text-red-500 inline-block mx-1"
        ></motion.i> for Thu Hà</p>
        <button 
          onClick={signOut} 
          className="mt-4 text-xs text-white/50 hover:text-white transition-colors"
        >
          Logout
        </button>
      </footer>
    </motion.div>
  );
}
