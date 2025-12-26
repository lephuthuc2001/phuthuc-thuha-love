import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import BackgroundAnimation from "@/app/components/BackgroundAnimation";
import MusicPlayer from "@/app/components/MusicPlayer";
import ConfigureAmplifyClientSide from "@/app/components/ConfigureAmplifyClientSide";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thu Hà & Phú Thức - Our Love Story ❤️",
  description: "A beautiful love story between Thu Hà and Phú Thức. Follow our journey since July 1, 2025.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <ConfigureAmplifyClientSide />
        <BackgroundAnimation />
        <MusicPlayer />
        {children}
        <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
