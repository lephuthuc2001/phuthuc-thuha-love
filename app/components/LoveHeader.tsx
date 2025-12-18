'use client';

export default function LoveHeader() {
  return (
    <header className="text-center mb-12 mt-8">
      <div className="inline-block relative">
        <h1 className="text-5xl md:text-7xl font-bold mb-2 text-white drop-shadow-lg heartbeat">
          Our Love Story
        </h1>
        <div className="absolute -top-6 -right-6 text-4xl animate-bounce">❤️</div>
      </div>
      <p className="text-2xl md:text-3xl mt-4 font-light tracking-wide">Thu Hà & Phú Thức</p>
      <div className="mt-2 text-pink-100 text-lg">Since July 1, 2025</div>
    </header>
  );
}
