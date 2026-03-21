"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, MapPin, Crosshair, Loader2, ArrowRight, Check, Clock, UserCheck, Calendar, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { useBookingStore } from "@/store/bookingStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useBookingSubmit } from "@/hooks/useBookingSubmit";
import { BookingConfirmation } from "@/components/BookingConfirmation";

const serviceOptions = [
  { value: "", label: "Select Service" },
  { value: "home-visit", label: "Doctor Home Visit" },
  { value: "teleconsult", label: "Teleconsultation" },
  { value: "nursing", label: "Nursing & Paramedic" },
  { value: "lab", label: "Lab Sample Collection" },
];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const { 
    name, 
    phone, 
    location, 
    serviceCategory, 
    gpsLocation,
    isLocating, 
    isSubmitting,
    locationError,
    confirmedBooking,
    isBookingForOther,
    setDetails,
    setBookingForOther,
    resetForNewBooking,
  } = useBookingStore();
  
  const modalRef = useRef<HTMLDivElement>(null);
  const { detectLocation } = useGeolocation();
  const { submitBooking } = useBookingSubmit();
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleGetLocation = async () => {
    try {
      await detectLocation();
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  // Phone number handler - keeps +91 prefix and allows only 10 digits after
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Always ensure it starts with +91
    if (!value.startsWith('+91')) {
      value = '+91 ' + value.replace(/^\+?91?\s?/, '');
    }
    
    // Extract digits after +91
    const afterPrefix = value.slice(4).replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = afterPrefix.slice(0, 10);
    
    // Format: +91 XXXXX XXXXX
    let formatted = '+91 ';
    if (limitedDigits.length > 0) {
      formatted += limitedDigits.slice(0, 5);
      if (limitedDigits.length > 5) {
        formatted += ' ' + limitedDigits.slice(5);
      }
    }
    
    setDetails({ phone: formatted });
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    
    const result = await submitBooking();
    
    if (result.success) {
      setSubmitStatus({ type: 'success', message: 'Booking submitted!' });
    } else {
      setSubmitStatus({ type: 'error', message: result.error || 'Something went wrong' });
    }
  };

  const handleBookAgain = () => {
    resetForNewBooking();
    setSubmitStatus(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="bg-primary px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Book a Home Visit
              </h3>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left - Info */}
              <div className="p-6 lg:p-8 bg-slate-50 border-r border-slate-100">
                <h4 className="text-lg font-bold text-text-main mb-2">
                  Healthcare at Your Doorstep
                </h4>
                <p className="text-sm text-text-secondary mb-6">
                  Doctors, nurses & diagnostics — right at your home
                </p>

                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-text-main">What Happens Next?</h5>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm text-text-secondary">
                        Our care coordinator calls you within 30 minutes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm text-text-secondary">
                        We understand your needs and assign the right doctor
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm text-text-secondary">
                        Doctor arrives at your preferred time slot
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">30</div>
                    <div className="text-xs text-text-secondary">Min Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <div className="text-xs text-text-secondary">Verified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-xs text-text-secondary">Support</div>
                  </div>
                </div>
              </div>

              {/* Right - Form or Confirmation */}
              <div className="p-6 lg:p-8">
                {confirmedBooking ? (
                  <BookingConfirmation 
                    booking={confirmedBooking} 
                    onBookAgain={handleBookAgain}
                    variant="modal"
                  />
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Patient Name"
                      icon={User}
                      placeholder="Enter Full Name"
                      value={name}
                      onChange={(e) => setDetails({ name: e.target.value })}
                    />

                    <Input
                      label="Phone Number"
                      icon={Phone}
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={handlePhoneChange}
                    />

                    {/* Booking for someone else checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isBookingForOther}
                        onChange={(e) => setBookingForOther(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-xs text-text-secondary group-hover:text-text-main transition-colors flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Booking for someone else
                      </span>
                    </label>

                    {/* Location with detect button */}
                    <div className="relative">
                      <Input
                        label="Patient Address"
                        icon={MapPin}
                        placeholder="House/Flat No, Building, Street, Locality"
                        value={location}
                        onChange={(e) => setDetails({ location: e.target.value })}
                      />
                      {!isBookingForOther && (
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={isLocating}
                          className="absolute right-3 top-[34px] text-xs text-primary font-medium hover:text-primary-dark transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {isLocating ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Detecting...
                            </>
                          ) : (
                            <>
                              <Crosshair className="w-3 h-3" />
                              Add GPS
                            </>
                          )}
                        </button>
                      )}
                      
                      {/* GPS Accuracy Indicator */}
                      {gpsLocation && !isBookingForOther && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          GPS added (±{gpsLocation.accuracy}m) — helps paramedic navigate
                        </div>
                      )}
                      {locationError && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="w-3 h-3" />
                          {locationError}
                        </div>
                      )}
                      {!gpsLocation && !locationError && !isLocating && !isBookingForOther && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Crosshair className="w-3 h-3" />
                          GPS optional but helps with faster arrival
                        </div>
                      )}
                      {isBookingForOther && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                          <Users className="w-3 h-3" />
                          Enter the patient&apos;s complete address
                        </div>
                      )}
                    </div>

                    <Select
                      label="Service Type"
                      icon={Calendar}
                      options={serviceOptions}
                      value={serviceCategory}
                      onChange={(e) => setDetails({ serviceCategory: e.target.value })}
                    />

                    {/* Promo badge */}
                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        <Check className="w-3 h-3" />
                        First Consultation FREE
                      </span>
                    </div>

                    {/* Submit Status */}
                    {submitStatus && submitStatus.type === 'error' && (
                      <div className="p-3 rounded-lg text-sm flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {submitStatus.message}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      glow
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Book Appointment
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      Average response time: 30 minutes
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
