'use client';

import { useAuthenticator } from "@aws-amplify/ui-react";
import LoveHeader from './LoveHeader';
import TimeCounters from './TimeCounters';
import MemoriesGallery from './MemoriesGallery';
import BucketList from './BucketList';
import Milestones from './Milestones';
import SocialFollow from './SocialFollow';
import { motion } from "motion/react";

interface MainPageProps {
  startDate: Date;
  nextMilestoneDate: Date;
  images: string[];
}

export default function MainPage({ startDate, nextMilestoneDate, images }: MainPageProps) {
  const { signOut } = useAuthenticator();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="container mx-auto px-4 py-8 relative z-10 text-white"
    >
      <LoveHeader />

      <main className="max-w-5xl mx-auto space-y-16">
        <TimeCounters startDate={startDate} />
        <MemoriesGallery images={images} />
        <BucketList />
        <Milestones nextMilestoneDate={nextMilestoneDate} />
        <SocialFollow />
      </main>

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
