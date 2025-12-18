'use client';

import { useState, useEffect } from 'react';

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
    <section className="text-center float">
      <div className="glass-card rounded-[40px] p-8 md:p-12 inline-block max-w-3xl w-full">
        <h2 className="text-3xl md:text-4xl mb-8 text-pink-600">We&apos;ve been together for</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8">
          <div className="flex flex-col items-center">
            <span className="text-5xl md:text-7xl font-bold text-pink-500 drop-shadow-sm">{time.days}</span>
            <span className="text-sm md:text-lg uppercase tracking-widest mt-2 text-gray-700 font-semibold">Days</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-5xl md:text-7xl font-bold text-pink-400 drop-shadow-sm">{time.hours}</span>
            <span className="text-sm md:text-lg uppercase tracking-widest mt-2 text-gray-700 font-semibold">Hours</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-5xl md:text-7xl font-bold text-pink-400 drop-shadow-sm">{time.minutes}</span>
            <span className="text-sm md:text-lg uppercase tracking-widest mt-2 text-gray-700 font-semibold">Mins</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-5xl md:text-7xl font-bold text-pink-400 drop-shadow-sm">{time.seconds}</span>
            <span className="text-sm md:text-lg uppercase tracking-widest mt-2 text-gray-700 font-semibold">Secs</span>
          </div>
        </div>
        
        <div className="text-gray-700 italic text-lg">
          &quot;And I fall in love with you more every single day.&quot;
        </div>
      </div>
    </section>
  );
}
