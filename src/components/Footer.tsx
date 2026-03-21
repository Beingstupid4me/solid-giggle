"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Twitter, Globe, Send, Shield, UserCheck } from "lucide-react";

const footerLinks = {
  services: [
    { label: "Sanocare NOW", href: "/now" },
    { label: "CareHub for Societies", href: "/carehub" },
    { label: "All Services", href: "/services" },
    { label: "Teleconsultations", href: "/services#teleconsult" },
  ],
  resources: [
    { label: "Book a Visit", href: "/#hero-booking-form" },
    { label: "About Us", href: "/about" },
    { label: "Insights", href: "/research" },
    { label: "Contact", href: "/contact" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/sanocare", label: "Twitter" },
  { icon: Globe, href: "https://sanocare.in", label: "Website" },
  { icon: Send, href: "https://t.me/sanocare", label: "Telegram" },
];

export function Footer() {
  return (
    <footer className="bg-surface-light border-t border-slate-200 pt-20 pb-12 relative z-10">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Sanocare"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-serif font-bold text-text-main">
                Sano<span className="italic font-normal text-primary">care</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-text-secondary">
              Reimagining Primary Healthcare for Urban India. We bridge the gap
              between virtual and physical care with doctors, nurses, and
              diagnostics at your doorstep.
            </p>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <UserCheck className="w-4 h-4 text-green-600" />
                Highly Qualified Doctors
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-blue-600" />
                Secure
              </span>
            </div>
            
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-text-secondary hover:bg-primary hover:text-white transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-text-main">
              Our Services
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-text-secondary">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-text-main">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-text-secondary">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-text-main">
              Get in Touch
            </h4>
            <ul className="flex flex-col gap-4 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=1666/2,+Govindpuri+Ext.,+Kalkaji,+New+Delhi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  1666/2, Govindpuri Ext., <br />
                  Kalkaji, New Delhi, India
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+919571608318" className="hover:text-primary transition-colors">+91-9571608318</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:contact@sanocare.in" className="hover:text-primary transition-colors">contact@sanocare.in</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-8 text-sm text-text-secondary md:flex-row">
          <p>© 2026 Sanocare. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/coming-soon/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/coming-soon/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/coming-soon/sitemap" className="hover:text-primary transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
