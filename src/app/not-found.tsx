"use client";

import { motion } from "framer-motion";
import { Home, Search, HeartPulse } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.svg"
              alt="Sanocare"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <h2 className="text-2xl font-serif font-bold tracking-tight text-text-main">
              Sano<span className="text-primary font-normal italic">care</span>
            </h2>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div 
          className="max-w-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 404 Visual */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
            className="relative mx-auto mb-8"
          >
            {/* Large 404 */}
            <div className="text-[120px] lg:text-[160px] font-serif font-bold text-slate-100 leading-none select-none">
              404
            </div>
            {/* Heartbeat overlay */}
            {/* <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <HeartPulse className="w-16 h-16 text-primary" />
            </motion.div> */}
          </motion.div>

          {/* Heading */}
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-text-main mb-4">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-text-secondary mb-8 leading-relaxed">
            Looks like this page took a sick day! Don&apos;t worry, our care team 
            is always available. Let&apos;s get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="primary" size="lg" className="rounded-full w-full sm:w-auto">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
            <Link href="/#services">
              <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto">
                <Search className="w-4 h-4" />
                Browse Services
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-sm text-text-secondary mb-4">Quick links:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/#services" className="text-primary hover:underline">
                Services
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/#specialists" className="text-primary hover:underline">
                Specialists
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/#contact" className="text-primary hover:underline">
                Contact
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/portal" className="text-primary hover:underline">
                Patient Portal
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer note */}
      <footer className="py-6 text-center text-sm text-text-secondary border-t border-slate-100">
        Need help? Call us at{" "}
        <a href="tel:+919571608318" className="text-primary hover:underline">
          +91-9571608318
        </a>
      </footer>
    </div>
  );
}
