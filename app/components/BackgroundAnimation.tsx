'use client';

import { useEffect } from 'react';

export default function BackgroundAnimation() {
  useEffect(() => {
    createHearts();
  }, []);

  const createHearts = () => {
    const container = document.getElementById('bgAnimation');
    if (!container) return;

    // Clear existing hearts to prevent duplicates if component re-renders
    container.innerHTML = '';

    const heartCount = 20;
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart-bg');
        heart.innerHTML = '<i class="fas fa-heart"></i>';
        
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
        heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
        heart.style.animationDelay = Math.random() * 5 + 's';
        
        container.appendChild(heart);
    }
  };

  return <div className="bg-animation" id="bgAnimation"></div>;
}
