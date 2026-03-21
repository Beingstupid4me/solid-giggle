"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Building2,
  User,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlassCard, Button, Input } from "@/components/ui";
import { supabase } from "@/lib/supabase";

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["1666/2, Govindpuri Ext.", "Kalkaji, New Delhi, India"],
    link: "https://www.google.com/maps/search/?api=1&query=1666/2,+Govindpuri+Ext.,+Kalkaji,+New+Delhi",
    linkText: "Get Directions",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+91-9571608318", "Mon-Sat: 8AM - 10PM"],
    link: "tel:+919571608318",
    linkText: "Call Now",
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["contact@sanocare.in", "support@sanocare.in"],
    link: "mailto:contact@sanocare.in",
    linkText: "Send Email",
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Sat: 8:00 AM - 10:00 PM", "Sunday: 9:00 AM - 6:00 PM"],
    link: null,
    linkText: null,
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        status: "new",
      });

      if (error) throw error;

      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you for reaching out! We\'ll get back to you within 24 hours.' 
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again or contact us directly.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+91')) {
      value = '+91 ' + value.replace(/^\+?91?\s?/, '');
    }
    const afterPrefix = value.slice(4).replace(/\D/g, '');
    const limitedDigits = afterPrefix.slice(0, 10);
    let formatted = '+91 ';
    if (limitedDigits.length > 0) {
      formatted += limitedDigits.slice(0, 5);
      if (limitedDigits.length > 5) {
        formatted += ' ' + limitedDigits.slice(5);
      }
    }
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  return (
    <main className="min-h-screen bg-background-light">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-background-light" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-text-main mb-6">
              Get in <span className="text-primary italic">Touch</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Have questions about our services? Want to partner with us? 
              Or just want to say hello? We&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="h-full p-6 text-center hover:shadow-lg transition-all">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mx-auto mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-text-main mb-2">{info.title}</h3>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-sm text-text-secondary">{detail}</p>
                    ))}
                    {info.link && (
                      <a 
                        href={info.link}
                        target={info.link.startsWith('http') ? '_blank' : undefined}
                        rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="inline-block mt-3 text-sm font-semibold text-primary hover:underline"
                      >
                        {info.linkText} →
                      </a>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-text-main mb-6">
                Send Us a Message
              </h2>
              
              <GlassCard variant="solid" className="p-6 lg:p-8">
                {submitStatus?.type === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-text-main mb-2">Message Sent!</h3>
                    <p className="text-text-secondary mb-6">{submitStatus.message}</p>
                    <Button
                      variant="outline"
                      onClick={() => setSubmitStatus(null)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Your Name"
                        icon={User}
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Input
                        label="Phone Number"
                        icon={Phone}
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                      />
                    </div>

                    <Input
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />

                    <Input
                      label="Subject"
                      icon={Building2}
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />

                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-1.5">
                        Your Message
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <textarea
                          placeholder="Tell us how we can help you..."
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          rows={5}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                        />
                      </div>
                    </div>

                    {submitStatus?.type === 'error' && (
                      <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">
                        {submitStatus.message}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </GlassCard>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col"
            >
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-text-main mb-6">
                Find Us
              </h2>
              
              <div className="flex-1 bg-slate-200 rounded-2xl overflow-hidden min-h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3505.0!2d77.26!3d28.54!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sGovindpuri%20Extension%2C%20Kalkaji%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '400px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sanocare Location"
                />
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <h3 className="font-bold text-text-main mb-2">Service Areas</h3>
                <p className="text-sm text-text-secondary">
                  We currently serve <strong>Delhi NCR</strong> including South Delhi, 
                  Noida, Gurgaon, Faridabad, and Ghaziabad. Expanding to more cities soon!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-text-main mb-4">
              Have Questions About Our Services?
            </h2>
            <p className="text-text-secondary mb-6">
              Check out our services page or book a free consultation call with our team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/services">
                <Button variant="primary" size="lg">
                  View Services
                </Button>
              </a>
              <a href="tel:+919571608318">
                <Button variant="outline" size="lg">
                  <Phone className="w-4 h-4" />
                  Call Us Now
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
