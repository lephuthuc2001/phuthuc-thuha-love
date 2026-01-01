'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";

interface MilestonesProps {
  nextMilestoneDate: Date;
}

export default function Milestones({ nextMilestoneDate }: MilestonesProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = nextMilestoneDate.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(interval);
  }, [nextMilestoneDate]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <section className="grid md:grid-cols-2 gap-8">
      {/* Milestones Reached */}
      <Card className="glass-card bg-transparent border-none rounded-3xl p-8">
        <CardContent className="p-0">
          <h3 className="text-3xl font-bold text-pink-600 mb-6 flex items-center">
            <i className="fas fa-flag-checkered mr-3"></i> Milestones
          </h3>
          <motion.div 
            className="space-y-6 relative"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-pink-300 opacity-50"></div>
            
            <motion.div variants={item} className="flex items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg mr-4 border-2 border-white">
                <i className="fas fa-heart text-xs"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">First Date</h4>
                <p className="text-sm text-gray-600">June 29, 2025</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="flex items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg mr-4 border-2 border-white">
                <i className="fas fa-check text-xs"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">First Day</h4>
                <p className="text-sm text-gray-600">July 1, 2025</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="flex items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg mr-4 border-2 border-white">
                <i className="fas fa-check text-xs"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">1 Month</h4>
                <p className="text-sm text-gray-600">August 1, 2025</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="flex items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg mr-4 border-2 border-white">
                <i className="fas fa-check text-xs"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">100 Days</h4>
                <p className="text-sm text-gray-600">October 9, 2025</p>
              </div>
            </motion.div>
            
            <motion.div variants={item} className="flex items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg mr-4 border-2 border-white">
                <i className="fas fa-heart text-xs"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">6 Months</h4>
                <p className="text-sm text-gray-600">January 1, 2026</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="flex items-center relative z-10 opacity-60">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-pink-400 shadow-sm mr-4 border-2 border-pink-200">
                <i className="fas fa-lock text-xs"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">1 Year</h4>
                <p className="text-sm text-gray-600">July 1, 2026</p>
              </div>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Next Big Milestone */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="glass-card bg-transparent border-2 border-pink-300 rounded-3xl p-8 flex flex-col justify-center text-center shadow-[0_0_20px_rgba(236,72,153,0.3)] h-full">
          <CardContent className="p-0 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Next Milestone</h3>
            <div className="text-4xl font-bold text-pink-600 mb-4 script-font">1 Year Anniversary</div>
            
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="bg-white/50 rounded-lg p-2">
                <div className="text-2xl font-bold text-pink-500">{timeLeft.days}</div>
                <div className="text-xs text-gray-600">Days</div>
              </div>
              <div className="bg-white/50 rounded-lg p-2">
                <div className="text-2xl font-bold text-pink-500">{timeLeft.hours}</div>
                <div className="text-xs text-gray-600">Hrs</div>
              </div>
              <div className="bg-white/50 rounded-lg p-2">
                <div className="text-2xl font-bold text-pink-500">{timeLeft.minutes}</div>
                <div className="text-xs text-gray-600">Mins</div>
              </div>
              <div className="bg-white/50 rounded-lg p-2">
                <div className="text-2xl font-bold text-pink-500">{timeLeft.seconds}</div>
                <div className="text-xs text-gray-600">Secs</div>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm">
              <i className="fas fa-gift text-pink-400 mr-1"></i>
              Time flies when I&apos;m with you!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
