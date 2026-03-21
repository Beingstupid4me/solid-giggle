"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  ArrowRight,
  ExternalLink,
  BookOpen,
  Lightbulb,
  BarChart3,
  Heart,
  Clock,
  Sparkles,
  Quote,
  Newspaper,
  Video,
  Mic,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui";

// Featured insights/facts
const healthFacts = [
  {
    stat: "73%",
    label: "of urban patients prefer home healthcare for non-emergency needs",
    source: "Urban Health Survey 2025",
  },
  {
    stat: "45 min",
    label: "average time saved per medical visit with doorstep care",
    source: "Sanocare Data",
  },
  {
    stat: "89%",
    label: "patient satisfaction rate with Sanocare services",
    source: "Customer Feedback",
  },
  {
    stat: "62%",
    label: "reduction in hospital readmissions with home follow-up care",
    source: "Clinical Outcomes Study",
  },
];

// Blog posts / articles
const featuredBlogs = [
  {
    title: "Home-Based Primary Care: A Viable Model for Urban India",
    excerpt: "Exploring how doorstep healthcare is transforming the way urban families access medical services...",
    category: "Healthcare Trends",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2940&auto=format&fit=crop",
    slug: "home-based-primary-care",
  },
  {
    title: "The Rise of Telemedicine in Post-Pandemic India",
    excerpt: "How virtual consultations have become an integral part of the healthcare ecosystem...",
    category: "Digital Health",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2940&auto=format&fit=crop",
    slug: "telemedicine-india",
  },
  {
    title: "Managing Chronic Diseases at Home: A Complete Guide",
    excerpt: "Tips and best practices for monitoring diabetes, hypertension, and cardiac conditions from home...",
    category: "Health Tips",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2940&auto=format&fit=crop",
    slug: "managing-chronic-diseases",
  },
];

// Health tips / quick reads
const healthTips = [
  {
    icon: Heart,
    title: "Monitor Your Vitals Weekly",
    description: "Regular tracking of BP, heart rate, and blood sugar can help detect issues early.",
  },
  {
    icon: Clock,
    title: "Don't Delay Emergency Care",
    description: "Chest pain, severe breathing difficulty, or stroke symptoms need immediate attention.",
  },
  {
    icon: Lightbulb,
    title: "Keep Digital Health Records",
    description: "Store your prescriptions and reports digitally for quick access during emergencies.",
  },
  {
    icon: Users,
    title: "Schedule Regular Checkups",
    description: "Preventive screenings can catch potential health issues before they become serious.",
  },
];

// Media mentions / press
const mediaMentions = [
  {
    outlet: "Economic Times",
    title: "Sanocare disrupting home healthcare in Delhi NCR",
    type: "Article",
    icon: Newspaper,
  },
  {
    outlet: "Healthcare Executive",
    title: "Interview: Building scalable homecare infrastructure",
    type: "Interview",
    icon: Mic,
  },
  {
    outlet: "StartupNews",
    title: "How Sanocare achieved 30-min response times",
    type: "Feature",
    icon: Video,
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

export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-background-light relative overflow-x-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-indigo-50 to-transparent blur-3xl opacity-60" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-purple-50 to-transparent blur-3xl opacity-60" />
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
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600 shadow-sm">
                  <Sparkles className="size-3.5" />
                  Knowledge Hub
                </div>
                
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.1] tracking-tight text-text-main">
                  Health <span className="text-indigo-600 italic">Insights</span> <br />
                  & Resources
                </h1>
                
                <p className="text-lg lg:text-xl leading-relaxed text-text-secondary max-w-xl font-light">
                  Stay informed with the latest healthcare trends, expert tips, and data-driven insights. Your go-to resource for making smarter health decisions.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="#blogs">
                    <Button className="rounded-full px-8 py-4 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 hover:-translate-y-1 transition-transform">
                      Explore Articles
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="#facts">
                    <Button variant="outline" className="rounded-full px-8 py-4 border-slate-200 hover:border-indigo-300">
                      View Health Facts
                    </Button>
                  </Link>
                </div>
              </motion.div>
              
              {/* Right Image */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="aspect-[16/10] rounded-[2rem] overflow-hidden shadow-2xl relative z-10 border-8 border-white">
                  <Image
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2940&auto=format&fit=crop"
                    alt="Healthcare insights and knowledge"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                {/* Floating Card */}
                <motion.div
                  className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-xl z-20 max-w-[220px] border border-white/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-bold uppercase tracking-widest">Updated Weekly</span>
                  </div>
                  <p className="text-[11px] text-text-secondary">Fresh insights and health tips curated by our medical experts.</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Key Health Facts */}
        <section className="py-16 bg-white border-y border-slate-100" id="facts">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 font-bold tracking-widest text-xs uppercase mb-3 block">
                Did You Know?
              </span>
              <h2 className="font-serif text-3xl lg:text-4xl font-medium text-text-main">
                Healthcare Facts & Figures
              </h2>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {healthFacts.map((fact, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="text-center p-6 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-100/50"
                >
                  <div className="text-4xl lg:text-5xl font-bold text-indigo-600 mb-3">
                    {fact.stat}
                  </div>
                  <p className="text-sm text-text-main mb-2 font-medium">{fact.label}</p>
                  <p className="text-xs text-text-secondary">{fact.source}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Blogs */}
        <section className="py-20 lg:py-28" id="blogs">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <motion.div
              className="text-center mb-16 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-600 font-bold tracking-widest text-xs uppercase mb-3 block">
                Featured Articles
              </span>
              <h2 className="font-serif text-3xl lg:text-5xl font-medium text-text-main mb-6">
                Latest from Our Blog
              </h2>
              <p className="text-text-secondary font-light">
                Expert insights, health tips, and stories from the frontlines of home healthcare.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {featuredBlogs.map((blog) => (
                <motion.article
                  key={blog.slug}
                  variants={itemVariants}
                  className="group bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-indigo-600">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-text-main mb-3 group-hover:text-indigo-600 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-4">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">{blog.readTime}</span>
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-2 text-indigo-600 text-sm font-bold group/link"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link href="/blog" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:underline">
                View All Articles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Health Tips Section */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-indigo-600 font-bold tracking-widest text-xs uppercase mb-3 block">
                  Expert Tips
                </span>
                <h2 className="font-serif text-3xl lg:text-5xl font-medium text-text-main mb-6 lg:mb-8">
                  Quick Health Tips
                </h2>
                <p className="text-lg text-text-secondary font-light leading-relaxed mb-10 lg:mb-12">
                  Simple, actionable advice from our medical professionals to help you stay healthy and make informed decisions about your care.
                </p>
                
                <div className="space-y-6">
                  {healthTips.map((tip, index) => {
                    const Icon = tip.icon;
                    return (
                      <motion.div
                        key={tip.title}
                        className="flex gap-4 group"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="size-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-text-main mb-1">{tip.title}</h3>
                          <p className="text-text-secondary text-sm">{tip.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
              
              {/* Right - Quote Card */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
                  <Quote className="w-16 h-16 opacity-20 absolute top-6 right-6" />
                  <div className="relative z-10">
                    <p className="text-xl lg:text-2xl font-light leading-relaxed mb-8">
                      &quot;Prevention is better than cure. Regular health monitoring at home has helped us catch potential issues early and provide timely interventions for our patients.&quot;
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold">Dr. Medical Team</p>
                        <p className="text-white/70 text-sm">Sanocare Health Experts</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-12 -right-12 size-64 bg-indigo-400/20 rounded-full blur-3xl -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Media Mentions - Dark Section */}
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
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-indigo-400 font-bold tracking-widest text-xs uppercase mb-3 block">
                In The Press
              </span>
              <h2 className="font-serif text-3xl lg:text-5xl font-medium text-white">
                Media & Mentions
              </h2>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-6 lg:gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {mediaMentions.map((mention) => {
                const Icon = mention.icon;
                return (
                  <motion.div
                    key={mention.title}
                    variants={itemVariants}
                    className="group p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-500"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="size-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                        {mention.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{mention.title}</h3>
                    <p className="text-white/50 text-sm">{mention.outlet}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                Stay Updated on Health Insights
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Get the latest health tips, articles, and updates delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/#hero-booking-form">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-slate-100 hover:text-indigo-600 rounded-full px-8">
                    Book a Health Checkup
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10 rounded-full px-8">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
