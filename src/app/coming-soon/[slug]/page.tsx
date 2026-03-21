"use client";

import { motion } from "framer-motion";
import { Construction, ArrowLeft, Clock, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { useParams } from "next/navigation";

// Page metadata for different "coming soon" pages
const pageInfo: Record<string, { title: string; description: string; eta?: string }> = {
  'about': {
    title: 'About Us',
    description: 'Learn more about Sanocare\'s mission, vision, and the team behind reimagining primary healthcare.',
    eta: 'Q2 2026',
  },
  'privacy': {
    title: 'Privacy Policy',
    description: 'Our commitment to protecting your health data and personal information.',
    eta: 'Q1 2026',
  },
  'terms': {
    title: 'Terms of Service',
    description: 'Terms and conditions for using Sanocare services.',
    eta: 'Q1 2026',
  },
  'sitemap': {
    title: 'Sitemap',
    description: 'A comprehensive map of all pages and resources on our website.',
    eta: 'Q1 2026',
  },
  'blog': {
    title: 'Health Blog',
    description: 'Medical insights, health tips, and wellness articles from our expert doctors.',
    eta: 'Q2 2026',
  },
  'careers': {
    title: 'Careers',
    description: 'Join our mission to make quality healthcare accessible to every household.',
    eta: 'Q2 2026',
  },
  'chat': {
    title: 'Live Chat Support',
    description: 'Get instant help from our care coordinators via chat.',
    eta: 'Q2 2026',
  },
  'default': {
    title: 'Coming Soon',
    description: 'We\'re working hard to bring you this feature. Check back soon!',
    eta: 'Soon',
  },
};

export default function ComingSoonPage() {
  const params = useParams();
  const slug = params.slug as string;
  const info = pageInfo[slug] || pageInfo['default'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
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
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
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
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
            className="mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-8"
          >
            <Construction className="w-12 h-12 text-amber-600" />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6"
          >
            <Clock className="w-4 h-4" />
            {info.eta && `Expected: ${info.eta}`}
          </motion.div>

          {/* Heading */}
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-text-main mb-4">
            {info.title}
            <br />
            <span className="text-primary italic font-light">Under Construction</span>
          </h1>

          {/* Description */}
          <p className="text-text-secondary mb-8 leading-relaxed">
            {info.description}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="primary" size="lg" className="rounded-full w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4" />
                Go Back Home
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full"
              onClick={() => {
                // TODO: Implement notification signup
                alert('Thanks! We\'ll notify you when this page is ready.');
              }}
            >
              <Bell className="w-4 h-4" />
              Notify Me
            </Button>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-sm text-text-secondary">
              Need immediate help? Call us at{" "}
              <a href="tel:+919571608318" className="text-primary hover:underline font-medium">
                +91-9571608318
              </a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
