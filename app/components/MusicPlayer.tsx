'use client';

import { useState, useRef, useEffect } from 'react';
import { getUrl } from 'aws-amplify/storage';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [audioSrc, setAudioSrc] = useState<string>('');

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const result = await getUrl({
          path: 'media/audio/all-of-me-hook.mp3',
        });
        setAudioSrc(result.url.toString());
      } catch (error) {
        console.error('Error loading music from storage:', error);
      }
    };
    fetchAudio();
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="music-player">
      <button 
        onClick={toggleMusic}
        className={`glass-card w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 ${isPlaying ? 'playing' : ''}`}
      >
        <i className={`fas fa-music text-xl music-disc ${isPlaying ? 'text-pink-600' : 'text-gray-400'}`}></i>
      </button>
      {audioSrc && (
        <audio ref={audioRef} id="bgMusic" loop>
          <source src={audioSrc} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}
