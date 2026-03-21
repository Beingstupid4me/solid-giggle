"use client";

import { motion } from "framer-motion";
import { Calendar, Phone, MessageCircle, User } from "lucide-react";

const sidebarButtons = [
  { icon: Calendar, label: "Book Now", href: "/#hero-booking-form" },
  { icon: Phone, label: "Call Us", href: "tel:+919571608318" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/919571608318" },
];

export function FloatingSidebar() {
  return (
    <aside className="fixed right-0 top-1/2 z-50 -translate-y-1/2 transform hidden lg:flex flex-col gap-3 p-3 bg-surface-light/80 backdrop-blur-md rounded-l-2xl shadow-xl border-y border-l border-white/50">
      {sidebarButtons.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.a
            key={item.label}
            href={item.href}
            className="group relative flex flex-col items-center justify-center p-2 rounded-xl hover:bg-primary/10 transition-colors"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="absolute right-full mr-4 px-2 py-1 bg-text-main text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </span>
          </motion.a>
        );
      })}
      
      <div className="h-px w-8 bg-slate-200 mx-auto" />
      
      <motion.a
        href="/portal"
        className="group relative flex flex-col items-center justify-center p-2 rounded-xl hover:bg-primary/10 transition-colors"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <User className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
        <span className="absolute right-full mr-4 px-2 py-1 bg-text-main text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Portal
        </span>
      </motion.a>
    </aside>
  );
}
