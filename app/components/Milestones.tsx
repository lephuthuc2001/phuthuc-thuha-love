'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";

import { useMilestones, type Milestone } from '@/app/hooks/useMilestones';
import { Skeleton } from "@/components/ui/skeleton";

export default function Milestones() {
  const { milestones, isLoading, nextMilestone, nextMilestoneDate, seedMilestones } = useMilestones();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    await seedMilestones();
    setIsSeeding(false);
  };

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

  const itemVariants = {
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
          
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-8 h-8 rounded-full bg-pink-100" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24 bg-pink-50" />
                    <Skeleton className="h-3 w-32 bg-pink-50" />
                  </div>
                </div>
              ))}
            </div>
          ) : milestones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4 font-medium">No milestones found in your journey yet.</p>
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {isSeeding ? 'Initializing...' : 'Initialize Our Milestones'}
              </button>
            </div>
          ) : (
            <motion.div 
              className="space-y-6 relative"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-pink-300 opacity-50"></div>
              
              {milestones.map((milestone) => (
                <motion.div 
                  key={milestone.id} 
                  variants={itemVariants} 
                  className={`flex items-center relative z-10 ${!milestone.isReached ? 'opacity-60' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg mr-4 border-2 ${
                    milestone.isReached 
                      ? 'bg-pink-500 text-white border-white' 
                      : 'bg-white text-pink-400 border-pink-200'
                  }`}>
                    <i className={`fas fa-${milestone.isReached ? (milestone.icon || 'check') : 'lock'} text-xs`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{milestone.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(milestone.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Next Big Milestone */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="glass-card bg-transparent border-2 border-pink-300 rounded-3xl p-8 flex flex-col justify-center text-center shadow-[0_0_20px_rgba(236,72,153,0.3)] h-full">
          <CardContent className="p-0 text-center">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 mx-auto bg-pink-100" />
                <Skeleton className="h-10 w-48 mx-auto bg-pink-100" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 bg-pink-50 rounded-lg" />)}
                </div>
              </div>
            ) : nextMilestone ? (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Next Milestone</h3>
                <div className="text-4xl font-bold text-pink-600 mb-4 script-font">{nextMilestone.title}</div>
                
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
              </>
            ) : (
              <div className="py-8">
                <i className="fas fa-heart text-pink-400 text-5xl mb-4"></i>
                <h3 className="text-2xl font-bold text-gray-800">Every day is a milestone with you!</h3>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
