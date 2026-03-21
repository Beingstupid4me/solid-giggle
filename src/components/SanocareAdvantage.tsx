"use client";

import { motion } from "framer-motion";
import { 
  Clock, 
  Home, 
  Shield, 
  IndianRupee,
  Check,
  Building2,
  Zap,
  ArrowRight,
  Users,
  Heart,
  Activity,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { Smartphone } from "lucide-react";

const comparisonData = {
  providers: [
    {
      name: "Traditional Hospitals",
      icon: Building2,
      description: "In-person visits with travel and wait times",
      highlight: false,
    },
    {
      name: "Telemedicine Apps",
      icon: Smartphone,
      description: "Virtual consultations only",
      highlight: false,
    },
    {
      name: "Sanocare NOW",
      icon: Zap,
      description: "Doorstep care within 30 minutes",
      highlight: true,
    },
  ],
  features: [
    {
      name: "Response Time",
      icon: Clock,
      traditional: "2-4 Hours (Travel+Wait)",
      telemedicine: "15 Mins (Consult only)",
      sanocare: "30 Mins (At your door)",
    },
    {
      name: "Physical Care",
      icon: Home,
      traditional: "Yes (But requires travel)",
      telemedicine: "No (Consult only)",
      sanocare: "Yes (Medics at home)",
    },
    {
      name: "Risk Detection",
      icon: Shield,
      traditional: "Reactive",
      telemedicine: "Basic",
      sanocare: "Proactive & Structured",
    },
    {
      name: "Pricing",
      icon: IndianRupee,
      traditional: "High (Travel + Fees)",
      telemedicine: "Variable",
      sanocare: "Transparent & Fixed",
    },
  ],
};

// Our service offerings
const serviceOfferings = [
  {
    id: "sanocare-now",
    name: "Sanocare NOW",
    tagline: "Direct to Consumer Healthcare",
    icon: Zap,
    color: "primary",
    description: "Get doctors, nurses, and diagnostics at your doorstep within 30 minutes. Pay-per-visit model starting at ₹499.",
    features: [
      { icon: Clock, text: "30 min response" },
      { icon: Stethoscope, text: "Trained paramedics" },
      { icon: Home, text: "Homecare & nursing" },
      { icon: Activity, text: "Diagnostics at home" },
    ],
    cta: "Book a Visit",
    ctaLink: "/#hero-booking-form",
    learnMore: "/now",
  },
  {
    id: "carehub",
    name: "CareHub",
    tagline: "For Gated Communities",
    icon: Building2,
    color: "indigo",
    description: "Transform your society into a health-first community with dedicated healthcare infrastructure and priority response.",
    features: [
      { icon: Users, text: "Dedicated care team" },
      { icon: Shield, text: "<15 min response" },
      { icon: Heart, text: "Health camps" },
      { icon: Activity, text: "Resident tracking" },
    ],
    cta: "Request for Society",
    ctaLink: "/carehub",
    learnMore: "/carehub",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function SanocareAdvantage() {
  return (
    <section className="py-20 lg:py-14 bg-slate-50 relative overflow-hidden" id="advantage">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
            Why Choose Us
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-medium text-text-main mb-4">
            The Sanocare <span className="text-primary italic">Advantage</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            See how Sanocare NOW compares to traditional healthcare options. 
            We combine the best of both worlds—physical care with digital convenience.
          </p>
        </motion.div>

        {/* Comparison Table - Desktop (4 columns) */}
        <motion.div
          className="hidden md:block bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-100">
            <div className="p-6 font-bold text-text-main">
              Feature
            </div>
            {comparisonData.providers.map((provider) => {
              const ProviderIcon = provider.icon;
              return (
                <div 
                  key={provider.name}
                  className={`p-6 text-center ${
                    provider.highlight 
                      ? "bg-primary text-white" 
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 font-bold">
                    <ProviderIcon className="w-5 h-5" />
                    {provider.name}
                  </div>
                  <p className={`text-xs mt-1 ${provider.highlight ? "text-white/80" : "text-text-secondary"}`}>
                    {provider.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Table Rows */}
          {comparisonData.features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                variants={rowVariants}
                className={`grid grid-cols-4 ${
                  index !== comparisonData.features.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="p-6 flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="font-semibold text-text-main">{feature.name}</span>
                </div>
                <div className="p-6 flex items-center justify-center text-center text-slate-600">
                  {feature.traditional}
                </div>
                <div className="p-6 flex items-center justify-center text-center text-slate-600">
                  {feature.telemedicine}
                </div>
                <div className="p-6 flex items-center justify-center text-center bg-primary/5">
                  <span className="font-bold text-primary">{feature.sanocare}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Comparison Table - Mobile (3 columns: Feature, Traditional, Sanocare) */}
        <motion.div
          className="md:hidden bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-100">
            <div className="p-3 font-bold text-text-main text-xs">
              Feature
            </div>
            <div className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 font-bold text-slate-600 text-xs">
                <Building2 className="w-3.5 h-3.5" />
                <span>Traditional</span>
              </div>
            </div>
            <div className="p-3 text-center bg-primary text-white">
              <div className="flex items-center justify-center gap-1 font-bold text-xs">
                <Zap className="w-3.5 h-3.5" />
                <span>Sanocare</span>
              </div>
            </div>
          </div>

          {/* Table Rows */}
          {comparisonData.features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.name}
                variants={rowVariants}
                className={`grid grid-cols-3 ${
                  index !== comparisonData.features.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="p-3 flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <span className="font-semibold text-text-main text-xs">{feature.name}</span>
                </div>
                <div className="p-3 flex items-center justify-center text-center text-slate-500 text-xs">
                  {feature.traditional.split(' ')[0]}
                </div>
                <div className="p-3 flex items-center justify-center text-center bg-primary/5">
                  <span className="font-bold text-primary text-xs">{feature.sanocare.split(' ')[0]}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Service Models - Side by Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-center font-serif text-2xl lg:text-3xl font-medium text-text-main mb-8">
            Our Service Models
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {serviceOfferings.map((service) => {
              const Icon = service.icon;
              const isPrimary = service.color === "primary";
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                    isPrimary ? "border-primary/20" : "border-indigo-200"
                  }`}
                >
                  {/* Header */}
                  <div className={`p-5 lg:p-6 ${isPrimary ? "bg-gradient-to-r from-primary/5 to-blue-50" : "bg-gradient-to-r from-indigo-50 to-purple-50"}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${isPrimary ? "bg-primary/10 text-primary" : "bg-indigo-100 text-indigo-600"}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-text-main">{service.name}</h4>
                        <p className="text-sm text-text-secondary">{service.tagline}</p>
                      </div>
                    </div>
                    
                    <p className="text-text-secondary text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>
                    
                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {service.features.map((feature, idx) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <FeatureIcon className={`w-4 h-4 shrink-0 ${isPrimary ? "text-primary" : "text-indigo-600"}`} />
                            <span className="text-text-main text-xs lg:text-sm">{feature.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href={service.ctaLink}
                        className={`flex-1 inline-flex items-center justify-center gap-2 text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity text-sm ${
                          isPrimary ? "bg-primary" : "bg-indigo-600"
                        }`}
                      >
                        {service.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href={service.learnMore}
                        className={`flex-1 inline-flex items-center justify-center gap-2 border font-semibold py-3 px-4 rounded-xl hover:bg-white/50 transition-colors text-sm ${
                          isPrimary ? "border-primary/20 text-primary" : "border-indigo-200 text-indigo-600"
                        }`}
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Value Propositions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        >
          {[
            { title: "Speed over appointments", desc: "No waiting, instant dispatch" },
            { title: "Dedicated doctors", desc: "MBBS professionals, not ad-hoc" },
            { title: "Medic-led execution", desc: "ANMs/DNMs at your doorstep" },
            { title: "Intelligence over friction", desc: "Tech that resolves, not just books" },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 lg:p-5 border border-slate-100 hover:border-primary/30 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-2 lg:gap-3">
                <div className="size-7 lg:size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-text-main text-xs lg:text-sm">{item.title}</h4>
                  <p className="text-xs text-text-secondary mt-0.5 hidden sm:block">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Explore all our services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
