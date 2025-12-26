'use client';

import { motion } from "motion/react";
import { getUrl } from 'aws-amplify/storage';
import { useState, useEffect } from 'react';

export default function LoveHeader() {
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const result = await getUrl({
          path: 'media/img/chibi-logo.png',
        });
        setLogoUrl(result.url.toString());
      } catch (error) {
        console.error('Error loading chibi logo:', error);
      }
    };
    fetchLogo();
  }, []);
  return (
    <motion.header 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring" }}
      className="text-center mb-12 mt-8 flex flex-col items-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        className="mb-4 relative group"
      >
        <div className="absolute inset-0 bg-pink-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
        {logoUrl && (
          <img 
            src={logoUrl}
            alt="Chibi Logo" 
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-white shadow-xl relative z-10"
          />
        )}
      </motion.div>

      <div className="inline-block relative">
        <motion.h1 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl md:text-7xl font-bold mb-2 text-white drop-shadow-lg"
        >
          Our Love Story
        </motion.h1>
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-6 -right-6 text-4xl"
        >
          ❤️
        </motion.div>
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-2xl md:text-3xl mt-4 font-light tracking-wide"
      >
        Thu Hà & Phú Thức
      </motion.p>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-2 text-pink-100 text-lg"
      >
        Since July 1, 2025
      </motion.div>
    </motion.header>
  );
}
