'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

interface TimeCountersProps {
  startDate: Date;
}

export default function TimeCounters({ startDate }: TimeCountersProps) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diff = now.getTime() - startDate.getTime();

      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    const interval = setInterval(updateTime, 1000);
    updateTime();

    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <motion.section 
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      className="text-center"
    >
      <Card className="glass-card bg-white/40 backdrop-blur-md border border-white/20 rounded-[40px] p-8 md:p-12 inline-block max-w-3xl w-full">
        <CardContent className="p-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-pink-600">We&apos;ve been together for</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8">
            <div className="flex flex-col items-center">
              <span className="text-5xl md:text-7xl font-bold text-pink-500 drop-shadow-sm">{time.days}</span>
              <Badge variant="secondary" className="mt-2 text-xs md:text-sm uppercase bg-pink-100 text-pink-700 hover:bg-pink-100 border-none px-3">Days</Badge>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl md:text-7xl font-bold text-pink-400 drop-shadow-sm">{time.hours}</span>
              <Badge variant="secondary" className="mt-2 text-xs md:text-sm uppercase bg-pink-100 text-pink-700 hover:bg-pink-100 border-none px-3">Hours</Badge>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl md:text-7xl font-bold text-pink-400 drop-shadow-sm">{time.minutes}</span>
              <Badge variant="secondary" className="mt-2 text-xs md:text-sm uppercase bg-pink-100 text-pink-700 hover:bg-pink-100 border-none px-3">Mins</Badge>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-5xl md:text-7xl font-bold text-pink-400 drop-shadow-sm">{time.seconds}</span>
              <Badge variant="secondary" className="mt-2 text-xs md:text-sm uppercase bg-pink-100 text-pink-700 hover:bg-pink-100 border-none px-3">Secs</Badge>
            </div>
          </div>
          
          <div className="text-gray-700 italic text-lg">
            &quot;And I fall in love with you more every single day.&quot;
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
