'use client';

import { useState, useEffect } from 'react';
import './love-story.css';
import BackgroundAnimation from './components/BackgroundAnimation';
import MusicPlayer from './components/MusicPlayer';
import LoginScreen from './components/LoginScreen';
import LoveHeader from './components/LoveHeader';
import TimeCounters from './components/TimeCounters';
import MemoriesGallery from './components/MemoriesGallery';
import Milestones from './components/Milestones';
import SocialFollow from './components/SocialFollow';

export default function LoveStory() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLogin = localStorage.getItem('isLoggedIn');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const correctCredential = "29-06-2025";
  const startDate = new Date('2025-07-01T00:00:00');
  const nextMilestoneDate = new Date('2026-01-01T00:00:00');

  const images = [
    '/img/thuhaphuthuc1.jpg',
    '/img/thuhaphuthuc2.jpg',
    '/img/z7042330849323_207ac349674544b234c66d23ac13edab.jpg',
    '/img/z7042330752446_54830a242bddacb88c3f661c27e97ad4.jpg',
    '/img/z7009844772256_e508e44b18834a47a9cde6feabaa6ef9.jpg',
    '/img/z7009844806378_8aaea5f609fd24909c54f10802df55d3.jpg',
    '/img/z7009844756980_804c0253bc94f68291d04bffa62cb4a9.jpg',
    '/img/z7007306627913_29d7656ae33e30ce5829a69d809653b5.jpg',
    '/img/z7008123793908_afefd62fedef050cfa34227d737776b9.jpg',
  ];

  if (isLoading) return null;

  return (
    <div className="text-white min-h-screen">
      <BackgroundAnimation />
      <MusicPlayer />

      {!isLoggedIn && (
        <LoginScreen 
          onLogin={handleLogin}  
          correctCredential={correctCredential} 
        />
      )}

      {isLoggedIn && (
        <div className="container mx-auto px-4 py-8 relative z-10 animate-fade-in-up">
          <LoveHeader />

          <main className="max-w-5xl mx-auto space-y-16">
            <TimeCounters startDate={startDate} />
            <MemoriesGallery images={images} />
            <Milestones nextMilestoneDate={nextMilestoneDate} />
            <SocialFollow />
          </main>

          <footer className="text-center mt-16 pb-8 text-white/80">
            <p>Made with <i className="fas fa-heart text-red-500 animate-pulse"></i> for Thu Hà</p>
          </footer>
        </div>
      )}
    </div>
  );
}
