"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Rocket, CheckCircle, Phone } from "lucide-react";

const announcements = [
  {
    icon: Rocket,
    text: "Sanocare NOW is now live in Kalkaji & Govindpuri Extension!",
    highlight: "Sanocare NOW",
  },
  {
    icon: CheckCircle,
    text: "Launching permanent CareHubs in South Delhi Gated Societies soon.",
    highlight: "CareHubs",
  },
  {
    icon: Phone,
    text: "Emergency? Call +91-9571608318 for instant doorstep care.",
    highlight: "+91-9571608318",
  },
];

export function TopBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const currentAnnouncement = announcements[currentIndex];
  const Icon = currentAnnouncement.icon;

  // Highlight the special text
  const highlightText = (text: string, highlight: string) => {
    const parts = text.split(highlight);
    if (parts.length === 1) return text;
    
    return (
      <>
        {parts[0]}
        <span className="font-bold text-white">{highlight}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <div className="relative bg-gradient-to-r from-primary via-primary-dark to-primary overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          animate={{ x: [0, 20], y: [0, 20] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 lg:px-12">
        <div className="flex items-center justify-center py-3.5 gap-3">
          {/* Announcement with fade animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-sm text-white/90"
            >
              <Icon className="w-4 h-4 text-white shrink-0" />
              <span>{highlightText(currentAnnouncement.text, currentAnnouncement.highlight)}</span>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="hidden sm:flex items-center gap-1.5 ml-4">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`size-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "bg-white w-4" 
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 lg:right-12 p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
