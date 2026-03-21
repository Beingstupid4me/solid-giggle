"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  Clock, 
  Home, 
  Stethoscope, 
  Activity, 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  Phone,
  IndianRupee,
  Syringe,
  HeartPulse,
  Thermometer,
  TestTube,
  MapPin,
  BadgeCheck,
  FileText,
  Timer,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui";

const services = [
  {
    icon: Stethoscope,
    title: "Paramedic Home Visit",
    description: "Trained paramedics at your doorstep for consultations, vitals checks, and initial assessments",
    price: "₹499",
    duration: "15 mins",
  },
  {
    icon: Syringe,
    title: "Nursing & Injections",
    description: "IV administration, injections, wound dressing, and post-operative care by trained nurses",
    price: "₹349",
    duration: "Per visit",
  },
  {
    icon: HeartPulse,
    title: "Vitals Monitoring",
    description: "BP, SpO2, temperature, blood sugar monitoring with digital records",
    price: "₹199",
    duration: "Per check",
  },
  {
    icon: TestTube,
    title: "Lab Sample Collection",
    description: "Blood tests, urine tests, and other diagnostic sample collection at home",
    price: "₹99",
    duration: "+ Lab fees",
  },
  {
    icon: Thermometer,
    title: "Chronic Care Visits",
    description: "Regular monitoring visits for diabetes, hypertension, and other chronic conditions",
    price: "₹399",
    duration: "Per visit",
  },
  {
    icon: Activity,
    title: "ECG at Home",
    description: "12-lead ECG with immediate digital report shared with you and your doctor",
    price: "₹599",
    duration: "With report",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Book Online",
    description: "Fill the quick form or call us. Tell us your symptoms and location.",
    icon: Phone,
  },
  {
    step: "02",
    title: "We Dispatch",
    description: "Nearest available paramedic is dispatched to your location immediately.",
    icon: MapPin,
  },
  {
    step: "03",
    title: "Care at Home",
    description: "Receive professional care in the comfort of your home within 30 minutes.",
    icon: Home,
  },
  {
    step: "04",
    title: "Digital Records",
    description: "Get prescriptions and reports digitally on WhatsApp and email.",
    icon: FileText,
  },
];

const advantages = [
  {
    title: "No Waiting Rooms",
    description: "Skip the queues. Healthcare comes to your doorstep.",
  },
  {
    title: "Transparent Pricing",
    description: "Know the cost upfront. No hidden fees or surprises.",
  },
  {
    title: "Trained Professionals",
    description: "All staff are verified, certified, and background-checked.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SanocareNowPage() {
  return (
    <main className="min-h-screen bg-background-light relative overflow-x-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl opacity-60" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-blue-50 to-transparent blur-3xl opacity-60" />
      </div>

      <div className="relative z-10">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative pt-16 pb-16 lg:pt-28 lg:pb-28 overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <motion.div
                className="flex flex-col gap-6 lg:gap-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm">
                  <Zap className="size-3.5" />
                  Direct to Consumer
                </div>
                
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.1] tracking-tight text-text-main">
                  Sanocare <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 italic">NOW</span>
                </h1>
                
                <p className="text-lg lg:text-xl leading-relaxed text-text-secondary max-w-xl font-light">
                  Healthcare that comes to you. Get paramedics, nurses, and diagnostics at your doorstep within 30 minutes. No appointments, no waiting rooms.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/#hero-booking-form">
                    <Button className="rounded-full px-8 py-4 bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform">
                      Book a Visit Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <a href="tel:+919571608318">
                    <Button variant="outline" className="rounded-full px-8 py-4 border-slate-200 hover:border-primary/30">
                      <Phone className="w-4 h-4" />
                      +91-9571608318
                    </Button>
                  </a>
                </div>
              </motion.div>
              
              {/* Right Image */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl relative z-10 border-8 border-white">
                  <Image
                    src="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=2942&auto=format&fit=crop"
                    alt="Healthcare professional at home visit"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                {/* Floating Card */}
                <motion.div
                  className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-xl z-20 max-w-[200px] border border-white/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Timer className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">Quick Response</span>
                  </div>
                  <p className="text-[11px] text-text-secondary">Our team reaches you in under 30 minutes, guaranteed.</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-12 bg-white border-y border-slate-100">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {[
                { icon: Clock, value: "30 Min", label: "Response Time" },
                { icon: IndianRupee, value: "₹499", label: "Starting Price" },
                { icon: BadgeCheck, value: "100%", label: "Verified Staff" },
                { icon: FileText, value: "Digital", label: "Health Records" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4 justify-center lg:justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl lg:text-3xl font-bold text-text-main">{stat.value}</div>
                      <div className="text-sm font-medium text-text-secondary">{stat.label}</div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 lg:py-28 bg-white" id="services">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <motion.div
              className="text-center mb-16 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
                Our Services
              </span>
              <h2 className="font-serif text-3xl lg:text-5xl font-medium text-text-main mb-6">
                What We Bring to Your Door
              </h2>
              <p className="text-text-secondary font-light">
                Comprehensive healthcare services delivered by verified, trained professionals.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="group relative p-8 lg:p-10 bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{service.price}</div>
                        <div className="text-xs text-text-secondary font-medium">{service.duration}</div>
                      </div>
                    </div>
                    <h3 className="font-serif text-xl font-bold mb-3 text-text-main">
                      {service.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Image */}
              <motion.div
                className="relative order-2 lg:order-1"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative">
                  <Image
                    src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?q=80&w=2864&auto=format&fit=crop"
                    alt="Healthcare at home"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-12 -right-12 size-64 bg-primary/20 rounded-full blur-3xl -z-10" />
              </motion.div>
              
              {/* Right Content */}
              <motion.div
                className="order-1 lg:order-2"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
                  Simple Process
                </span>
                <h2 className="font-serif text-3xl lg:text-5xl font-medium text-text-main mb-6 lg:mb-8">
                  How It Works
                </h2>
                <p className="text-lg text-text-secondary font-light leading-relaxed mb-10 lg:mb-12">
                  Getting healthcare at home is simple with Sanocare NOW. Just four easy steps.
                </p>
                
                <div className="space-y-8">
                  {howItWorks.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.step}
                        className="flex gap-6 group"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="relative">
                          <span className="text-4xl lg:text-5xl font-serif text-primary opacity-30 group-hover:opacity-100 transition-opacity duration-300">
                            {item.step}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className="w-5 h-5 text-primary" />
                            <h3 className="text-lg lg:text-xl font-bold text-text-main">
                              {item.title}
                            </h3>
                          </div>
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
                  Why Sanocare NOW
                </span>
                <h2 className="font-serif text-3xl lg:text-5xl font-medium text-text-main mb-8">
                  Healthcare, Redefined
                </h2>
                
                <div className="space-y-8">
                  {advantages.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex gap-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-5xl font-serif text-primary/20">
                        0{index + 1}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-text-main mb-2">
                          {item.title}
                        </h3>
                        <p className="text-text-secondary leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Right - Pricing Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-primary/5 via-blue-50/50 to-white rounded-3xl p-8 lg:p-10 border border-primary/10 shadow-xl">
                  <div className="text-center mb-8">
                    <span className="text-primary font-bold tracking-widest text-xs uppercase">Transparent Pricing</span>
                    <div className="mt-4">
                      <span className="text-sm text-text-secondary">Starting at just</span>
                      <div className="text-6xl font-bold text-primary mt-1">₹499</div>
                      <span className="text-sm text-text-secondary">for 15-minute consultation</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      "Base consultation: ₹499 for first 15 minutes",
                      "Additional time: ₹100 per 5 minutes",
                      "Lab tests: Sample collection ₹99 + lab fees",
                      "Nursing: Starting ₹349 per visit",
                      "ECG at home: ₹599 with digital report",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-text-main text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link href="/#hero-booking-form">
                    <Button variant="primary" size="lg" className="w-full rounded-full shadow-lg shadow-primary/20">
                      Book Your Visit
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust Section - Dark */}
        <section className="py-20 lg:py-28 bg-text-main overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div 
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>
          
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-primary font-bold tracking-widest text-xs uppercase mb-3 block">
                  Trust & Safety
                </span>
                <h2 className="font-serif text-3xl lg:text-5xl font-medium text-white mb-6">
                  Your Safety is Our Priority
                </h2>
                <p className="text-white/70 mb-8 leading-relaxed text-lg">
                  Every Sanocare NOW professional undergoes rigorous background verification, skill assessment, and regular training to ensure you receive the best care.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Aadhar and police verification for all staff",
                    "Certified paramedics and trained nurses only",
                    "Real-time tracking of your caregiver",
                    "Digital records shared with you instantly",
                    "24/7 customer support for any concerns"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-white/80">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2940&auto=format&fit=crop"
                    alt="Healthcare professional"
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary via-primary to-blue-600">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                Need Healthcare Now?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Don&apos;t wait in queues. Get professional medical care at your doorstep within 30 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/#hero-booking-form">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-slate-100 hover:text-primary rounded-full px-8">
                    Book a Visit
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="tel:+919571608318">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10 rounded-full px-8">
                    <Phone className="w-4 h-4" />
                    Emergency? Call Now
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
