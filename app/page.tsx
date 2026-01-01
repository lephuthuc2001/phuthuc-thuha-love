'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './love-story.css';
import MainPage from '@/app/components/MainPage';
import { getUrl, list } from 'aws-amplify/storage';
import { useState, useEffect } from 'react';

export default function LoveStory() {
  const startDate = new Date('2025-07-01T00:00:00');
  const nextMilestoneDate = new Date('2026-07-01T00:00:00');

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        console.log('Listing images from media/img/ folder...');
        const listResult = await list({
          path: 'media/img/',
        });

        const paths = listResult.items
          .map(item => item.path)
          .filter(path => path !== 'media/img/' && !path.endsWith('chibi-logo.png')); // Filter out folder and logo

        console.log('Found image paths:', paths);

        const urls = await Promise.all(
          paths.map(async (path) => {
            try {
              const result = await getUrl({ path });
              return result.url.toString();
            } catch (innerError) {
              console.error(`Failed to get URL for ${path}`, innerError);
              return '';
            }
          })
        );
        
        setImages(urls.filter(url => url !== ''));
      } catch (error) {
        console.error('Critical Error loading images from storage:', error);
      }
    };

    fetchImages();
  }, []);

  const components = {
    Header() {
      return (
        <div className="text-center p-6 pb-2">
          <h1 className="text-4xl font-bold text-[#ff9a9e] drop-shadow-sm" style={{ fontFamily: 'Dancing Script, cursive' }}>
            Love Story
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-light">
            Only for Us
          </p>
        </div>
      );
    },
  };

  return (
    <div className="text-white min-h-screen relative z-10 flex flex-col items-center justify-center p-4">
      <Authenticator hideSignUp={true} components={components}>
        {({ signOut, user }) => (
          <div className="w-full h-full">
            <MainPage 
              startDate={startDate}
              nextMilestoneDate={nextMilestoneDate}
              images={images}
            />
          </div>
        )}
      </Authenticator>
    </div>
  );
}
