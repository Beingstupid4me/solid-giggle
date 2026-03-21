"use client";

import { motion } from "framer-motion";

export function DNABackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Top-right gradient blob */}
      <motion.div
        className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-blue-50 to-transparent blur-3xl opacity-60"
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Bottom-left gradient blob */}
      <motion.div
        className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-indigo-50 to-transparent blur-3xl opacity-60"
        animate={{
          x: [0, -15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* DNA Pattern overlay */}
      <div className="absolute inset-0 bg-dna-pattern opacity-50" />
    </div>
  );
}
