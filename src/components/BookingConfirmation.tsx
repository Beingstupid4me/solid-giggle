"use client";

import { motion } from "framer-motion";
import { CheckCircle2, User, Phone, MapPin, Calendar, Clock, ArrowRight, IndianRupee } from "lucide-react";
import { ConfirmedBooking } from "@/store/bookingStore";
import { SERVICE_PRICING, formatPrice } from "@/constants/pricing";

const serviceLabels: Record<string, string> = {
  "home-visit": "Doctor Home Visit",
  "teleconsult": "Teleconsultation",
  "nursing": "Nursing & Paramedic",
  "lab": "Lab Sample Collection",
};

interface BookingConfirmationProps {
  booking: ConfirmedBooking;
  onBookAgain: () => void;
  variant?: "card" | "modal";
}

export function BookingConfirmation({ booking, onBookAgain, variant = "card" }: BookingConfirmationProps) {
  const timeAgo = () => {
    const elapsed = Date.now() - booking.confirmedAt;
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    return "Recently";
  };

  const servicePrice = SERVICE_PRICING[booking.serviceCategory]?.price || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
        className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
      >
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </motion.div>

      {/* Heading */}
      <h3 className="text-xl lg:text-2xl font-bold text-text-main mb-2">
        Booking Received!
      </h3>
      <p className="text-sm text-text-secondary mb-6">
        We&apos;ll connect with you within 30 minutes to confirm your appointment.
      </p>

      {/* Booking Details */}
      <div className={`bg-slate-50 rounded-xl p-4 mb-4 text-left ${variant === "modal" ? "mx-0" : ""}`}>
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
          <Clock className="w-3 h-3" />
          Booked {timeAgo()}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-text-secondary">Patient Name</p>
              <p className="text-sm font-medium text-text-main">{booking.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-text-secondary">Phone</p>
              <p className="text-sm font-medium text-text-main">{booking.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-text-secondary">Address</p>
              <p className="text-sm font-medium text-text-main">{booking.location}</p>
              {booking.gpsLocation && (
                <p className="text-xs text-green-600 mt-0.5">
                  📍 GPS verified
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-text-secondary">Service</p>
              <p className="text-sm font-medium text-text-main">
                {serviceLabels[booking.serviceCategory] || booking.serviceCategory}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Card */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-green-700" />
            <span className="text-sm font-medium text-green-800">Estimated Total</span>
          </div>
          <span className="text-xl font-bold text-green-700">{formatPrice(servicePrice)}</span>
        </div>
        <p className="text-xs text-green-600 mt-1 text-left">
          To be paid via UPI/Cash after visit completion
        </p>
      </div>

      {/* What's Next */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 text-left">
        <p className="text-sm font-medium text-blue-800 mb-1">What happens next?</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Our care coordinator will call you within 30 minutes</li>
          <li>• We&apos;ll confirm the visit time and doctor details</li>
          <li>• Payment is collected after the visit is complete</li>
        </ul>
      </div>

      {/* Book Again Button - Less prominent */}
      <button
        onClick={onBookAgain}
        className="text-sm text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
      >
        Need to book for someone else?
        <ArrowRight className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
