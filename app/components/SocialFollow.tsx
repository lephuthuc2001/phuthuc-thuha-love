'use client';

import Script from 'next/script';

export default function SocialFollow() {
  return (
    <section className="text-center">
      <div className="glass-card rounded-3xl p-8 max-w-2xl mx-auto">
        <h3 className="text-3xl font-bold text-pink-600 mb-6">
          <i className="fab fa-tiktok mr-2"></i> Follow Our Journey
        </h3>
        <div className="flex justify-center">
          <blockquote 
            className="tiktok-embed" 
            cite="https://www.tiktok.com/@thucvoihane" 
            data-unique-id="thucvoihane" 
            data-embed-type="creator" 
            style={{ maxWidth: '780px', minWidth: '288px' }}
          >
            <section>
              <a target="_blank" rel="noopener noreferrer" href="https://www.tiktok.com/@thucvoihane?refer=creator_embed">
                @thucvoihane
              </a>
            </section>
          </blockquote>
          {/* We use next/script in layout for better performance, but ensuring it's loaded here just in case or using standard script tag if needed */}
        </div>
      </div>
    </section>
  );
}
