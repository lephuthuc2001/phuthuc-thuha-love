'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles - already imported in main CSS or global, but good to have here if needed
// However, since we import 'love-story.css' globally or in page, it should be fine.
// But imports in components for CSS modules is sometimes safer.
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

interface MemoriesGalleryProps {
  images: string[];
}

export default function MemoriesGallery({ images }: MemoriesGalleryProps) {
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl text-white drop-shadow-md mb-2">Our Memories</h2>
        <div className="h-1 w-24 bg-white mx-auto rounded-full opacity-50"></div>
      </div>
      
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
          scale: 0.8, // Add scaling to make side images smaller
        }}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="mySwiper"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index} className="!w-[250px] !h-[350px] md:!w-[300px] md:!h-[400px]">
            <img 
              src={img} 
              alt={`Memory ${index + 1}`} 
              className="w-full h-full object-cover rounded-2xl block shadow-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
