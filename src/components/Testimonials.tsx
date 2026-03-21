"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

// TODO: Replace with real patient testimonials once available
const testimonials = [
  {
    quote:
      "Getting a doctor at home within an hour was a lifesaver for my elderly mother. The doctor was professional and took time to explain everything.",
    name: "Sanyam Modi", // PLACEHOLDER
    treatment: "Home Doctor Visit",
    initial: "P",
  },
  {
    quote:
      "The teleconsultation was so convenient. I got my prescription digitally and even had medicines delivered. No more waiting in long queues!",
    name: "Abhishek Bisht", // PLACEHOLDER
    treatment: "Teleconsultation",
    initial: "P",
  },
  {
    quote:
      "Lab sample collection at home saved my entire day. The paramedic was punctual and the reports came quickly. Highly recommend Sanocare!",
    name: "Aamir Sohai", // PLACEHOLDER
    treatment: "Lab Collection at Home",
    initial: "P",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 relative bg-background-light">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-end justify-between pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
              Real Stories
            </span>
            <h2 className="font-serif text-4xl font-medium text-text-main">
              Patient Testimonials
            </h2>
          </motion.div>
          <div className="hidden sm:flex gap-3">
            <button className="flex size-12 items-center justify-center rounded-full border border-slate-200 bg-white text-text-main hover:border-primary hover:text-primary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="flex size-12 items-center justify-center rounded-full border border-slate-200 bg-white text-text-main hover:border-primary hover:text-primary transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className={`group bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all ${
                index === 2 ? "hidden lg:block" : ""
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Stars */}
              <div className="flex items-center gap-1 text-yellow-400 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-text-main text-lg font-medium leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {testimonial.initial}
                </div>
                <div>
                  <h4 className="font-bold text-text-main text-sm">
                    {testimonial.name}
                  </h4>
                  <span className="text-xs text-text-secondary block">
                    {testimonial.treatment}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
