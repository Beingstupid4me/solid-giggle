"use client";

import { motion } from "framer-motion";
import { 
  Heart, 
  Shield, 
  Clock, 
  Users, 
  Award, 
  Target,
  Stethoscope,
  MapPin,
  Calendar,
  CheckCircle,
  ArrowRight,
  BadgeCheck,
  Brain,
  Globe,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Navbar, Footer } from "@/components";

// ============================================
// PLACEHOLDER DATA - Replace with actual data
// ============================================
const COMPANY_INFO = {
  name: "SanoCare",
  tagline: "Your Health, Our Mission",
  foundingYear: "2020",
  city: "[City]",
  state: "[State]",
  fullAddress: "[Full Address]",
  phone: "+91 XXXXX XXXXX",
  email: "contact@sanocare.in",
  
  // Founder details
  founderName: "[Founder Name]",
  founderTitle: "Founder & CEO",
  founderQuote: "We don't just treat patients; we empower people to live their healthiest lives.",
};

const STATS = [
  { number: "10,000+", label: "Patients Served" },
  { number: "500+", label: "Home Visits Monthly" },
  { number: "50+", label: "Healthcare Professionals" },
  { number: "98%", label: "Patient Satisfaction" },
];

const PILLARS = [
  {
    number: "01",
    title: "The Vision",
    description: "To be the leading homecare provider, making quality medical care accessible to every household.",
  },
  {
    number: "02",
    title: "The Method",
    description: "Integrating technology with compassionate care for seamless healthcare delivery at your doorstep.",
  },
  {
    number: "03",
    title: "The Impact",
    description: "Positively influencing the lives of thousands of families by bringing healthcare home.",
  },
];

const VALUES = [
  {
    icon: BadgeCheck,
    title: "Uncompromising Quality",
    description: "We adhere to the highest medical standards, ensuring safety and precision in every home visit and consultation.",
  },
  {
    icon: Brain,
    title: "Empathetic Innovation",
    description: "Technology serves the human experience. We innovate to make healthcare more accessible and comfortable.",
  },
  {
    icon: Globe,
    title: "Community First",
    description: "Health is a universal right. We work to foster a community that supports health awareness and education.",
  },
];

const MILESTONES = [
  {
    year: "[Year]",
    title: "The Foundation",
    description: "Started with a vision to transform homecare, making quality medical care accessible to every family.",
    position: "right",
  },
  {
    year: "[Year]",
    title: "First 1,000 Patients",
    description: "Reached our first major milestone, establishing trust within the community through consistent, quality care.",
    position: "left",
  },
  {
    year: "[Year]",
    title: "Team Expansion",
    description: "Grew our network to include highly qualified doctors, nurses, and lab technicians across the city.",
    position: "right",
  },
  {
    year: "Today",
    title: "Leading Homecare",
    description: "Serving thousands of families with comprehensive homecare services including teleconsultation and lab tests.",
    position: "left",
  },
];

const TEAM_MEMBERS = [
  {
    name: "[Team Member 1]",
    role: "Chief Medical Officer",
  },
  {
    name: "[Team Member 2]",
    role: "Head of Operations",
  },
  {
    name: "[Team Member 3]",
    role: "Director of Nursing",
  },
  {
    name: "[Team Member 4]",
    role: "Patient Experience Lead",
  },
];

const ACCREDITATIONS = [
  { icon: Shield, name: "NABH" },
  { icon: Award, name: "ISO Certified" },
  { icon: Heart, name: "HealthTrust" },
  { icon: CheckCircle, name: "QualityCare" },
];

// ============================================
// COMPONENTS
// ============================================

function HeroSection() {
  return (
    <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-blue-50 to-transparent blur-3xl opacity-60" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-indigo-50 to-transparent blur-3xl opacity-60" />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white/50 backdrop-blur-sm px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Establishing Trust Since {COMPANY_INFO.foundingYear}
            </div>

            <h1 className="font-serif text-5xl font-medium leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Our Mission is <br />
              <span className="text-primary italic">Your Health.</span>
            </h1>

            <p className="text-xl leading-relaxed text-slate-600 max-w-xl font-light">
              {COMPANY_INFO.name} was founded on the principle that premium healthcare 
              should be as seamless as it is effective. We bridge the gap between 
              medical excellence and human compassion.
            </p>

            <div className="pt-4">
              <Link
                href="/#specialists"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all transform hover:-translate-y-1"
              >
                Meet Our Specialists
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Image with Quote Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative z-10 border-8 border-white bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="absolute inset-0 flex items-center justify-center">
                <Stethoscope className="w-32 h-32 text-primary/20" />
              </div>
              {/* Replace with actual image */}
              {/* <Image src="/about/hero.jpg" alt="Medical Excellence" fill className="object-cover" /> */}
            </div>

            {/* Floating Quote Card */}
            <div className="absolute -bottom-10 -left-10 bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl z-20 max-w-xs border border-white/50">
              <Shield className="w-10 h-10 text-primary mb-4" />
              <p className="text-sm font-medium text-slate-900 italic">
                "{COMPANY_INFO.founderQuote}"
              </p>
              <p className="mt-2 text-xs font-bold uppercase text-slate-500">
                {COMPANY_INFO.founderName}, Founder
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WhoWeAreSection() {
  return (
    <section className="py-24 lg:py-36 bg-white">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
            Who We Are
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-medium text-slate-900 mb-8">
            Redefining the standard of homecare.
          </h2>
          <div className="space-y-6 text-lg text-slate-600 font-light leading-relaxed">
            <p>
              {COMPANY_INFO.name} is an integrated healthcare ecosystem designed for the 
              modern family. We believe that clinical expertise should be complemented 
              by convenience and compassion.
            </p>
            <p>
              Our multidisciplinary approach ensures that every aspect of your well-being 
              is considered, from home consultations to advanced diagnostic services. 
              We are not just a service; we are your lifelong partner in health.
            </p>
          </div>
        </motion.div>

        {/* Three Pillars */}
        <div className="grid md:grid-cols-3 gap-12 mt-24">
          {PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col gap-4 p-8 border-l-2 border-slate-200 hover:border-primary transition-colors"
            >
              <span className="text-5xl font-serif text-primary">{pillar.number}</span>
              <h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="py-28 lg:py-36 relative bg-slate-50">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
            Our Core Values
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-medium text-slate-900">
            The Pillars of {COMPANY_INFO.name}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {VALUES.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-10 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="size-16 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-4 text-slate-900">
                  {value.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
              Expertise
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl font-medium">
              Visionary Leadership
            </h2>
          </motion.div>
          <p className="max-w-md text-white/60 font-light">
            Driven by a team of dedicated healthcare professionals committed to 
            transforming homecare delivery.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM_MEMBERS.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-6 relative bg-gradient-to-br from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="w-16 h-16 text-slate-600" />
                </div>
                {/* Replace with actual image */}
                {/* <Image src={member.image} alt={member.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" /> */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="text-xl font-serif font-bold">{member.name}</h4>
              <p className="text-primary text-sm uppercase font-bold tracking-wider mt-1">
                {member.role}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section className="py-28 lg:py-36 relative bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
            Our Heritage
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-medium text-slate-900">
            The {COMPANY_INFO.name} Story
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-lg font-light">
            Milestones that defined our path toward excellence.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 lg:-translate-x-1/2" />

          <div className="space-y-24 lg:space-y-32">
            {MILESTONES.map((milestone, index) => (
              <motion.div
                key={milestone.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-16 ${
                  milestone.position === "left" ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className={`lg:w-1/2 pl-12 lg:pl-0 ${
                  milestone.position === "right" ? "lg:text-right" : "lg:text-left"
                }`}>
                  <span className="text-primary font-bold text-xl mb-2 block">
                    {milestone.year}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-slate-900">
                    {milestone.title}
                  </h3>
                  <p className="mt-2 text-slate-600 text-lg">
                    {milestone.description}
                  </p>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 top-0 lg:top-1/2 lg:-translate-y-1/2 z-10">
                  <div className={`size-12 rounded-full border-4 shadow-lg flex items-center justify-center text-base font-bold ${
                    index === 0 
                      ? "bg-primary border-white text-white" 
                      : "bg-white border-slate-200 text-slate-900"
                  }`}>
                    {index + 1}
                  </div>
                </div>

                {/* Image Placeholder */}
                <div className="lg:w-1/2 pl-12 lg:pl-0">
                  <div className="relative h-64 w-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-md overflow-hidden flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-slate-300" />
                    {/* Replace with actual image */}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AccreditationsSection() {
  return (
    <section className="border-t border-slate-200 bg-white/50 py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <p className="mb-10 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
          Accredited by Leading Health Organizations
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale transition-opacity hover:opacity-100 lg:gap-24">
          {ACCREDITATIONS.map((acc) => {
            const Icon = acc.icon;
            return (
              <div key={acc.name} className="flex items-center gap-2 group">
                <Icon className="w-10 h-10 group-hover:text-primary transition-colors" />
                <span className="font-bold text-xl font-serif">{acc.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-primary to-primary-dark">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-4">
            Ready to Experience Better Healthcare?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
            Book your first home visit today and see why thousands of families trust us 
            with their healthcare needs.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary font-bold rounded-full hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            Book a Visit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main>
        <HeroSection />
        <WhoWeAreSection />
        <ValuesSection />
        <TeamSection />
        <TimelineSection />
        <AccreditationsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
