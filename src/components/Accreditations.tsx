"use client";

import { motion } from "framer-motion";
import { Shield, UserCheck, Clock, BadgeCheck, Stethoscope } from "lucide-react";

const trustBadges = [
  { 
    icon: UserCheck, 
    name: "Verified Healthcare Staff",
    description: "100% Background Checked"
  },
  { 
    icon: Shield, 
    name: "DISHA Compliant",
    description: "Data Security Certified"
  },
  { 
    icon: Clock, 
    name: "24/7 Support",
    description: "Always Available"
  },
  { 
    icon: BadgeCheck, 
    name: "Licensed & Insured",
    description: "Fully Accredited"
  },
  { 
    icon: Stethoscope, 
    name: "Quality Assured",
    description: "ISO 9001 Standards"
  },
];

export function Accreditations() {
  return (
    <section className="border-t border-slate-200 bg-white/50 py-16" id="trust">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <motion.p
          className="mb-10 text-center text-xs font-bold uppercase tracking-widest text-text-secondary/70"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Why Thousands Trust Sanocare
        </motion.p>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 lg:gap-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {trustBadges.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                className="flex flex-col items-center gap-2 group cursor-default"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <span className="font-bold text-sm text-text-main text-center">{item.name}</span>
                <span className="text-xs text-text-secondary text-center">{item.description}</span>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Additional Trust Line */}
        <motion.div
          className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-green-500" />
            5000+ Consultations Completed
          </span>
          <span className="hidden sm:block">•</span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-green-500" />
            4.9★ Average Rating
          </span>
          <span className="hidden sm:block">•</span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-green-500" />
            Serving Delhi NCR Since 2024
          </span>
        </motion.div>
      </div>
    </section>
  );
}
