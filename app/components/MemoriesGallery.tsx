'use client';

import React, { useRef } from 'react';
import { motion } from "motion/react";
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

interface MemoriesGalleryProps {
  images: string[];
}

export default function MemoriesGallery({ images }: MemoriesGalleryProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  )

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl text-white drop-shadow-md mb-2">Our Memories</h2>
        <div className="h-1 w-24 bg-white mx-auto rounded-full opacity-50"></div>
      </div>
      
      <div className="flex flex-col items-center w-full px-4">
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          className="w-full max-w-md lg:max-w-5xl"
          opts={{
            align: "center",
            loop: true
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {images.map((img, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="border-none bg-transparent shadow-none">
                    <CardContent className="flex aspect-[2/3] items-center justify-center p-0">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full p-2 rounded-2xl overflow-hidden"
                      >
                        <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20">
                          <img 
                            src={img} 
                            alt={`Memory ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12 bg-white/20 hover:bg-white/40 border-none text-white scale-125" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-12 bg-white/20 hover:bg-white/40 border-none text-white scale-125" />
        </Carousel>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              className={`h-2 rounded-full transition-all duration-300 hover:bg-white/60 ${
                current === i + 1 ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
              onClick={() => api?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
