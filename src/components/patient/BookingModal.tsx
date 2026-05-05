'use client';

import { useCreateBooking, useDoctorQueue } from '@/hooks/useSupabaseIntegration';
import { useState } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const { cases: doctors } = useDoctorQueue(); // Reusing doctor queue to get available doctors
  const { createBooking, loading, error } = useCreateBooking();
  
  const [formData, setFormData] = useState({
    patientName: '',
    doctoId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
  });
  
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.doctoId || !formData.appointmentDate || !formData.appointmentTime) {
      alert('Please fill in all required fields');
      return;
    }

    const result = await createBooking({
      patient_name: formData.patientName,
      doctor_id: formData.doctoId,
      appointment_date: formData.appointmentDate,
      appointment_time: formData.appointmentTime,
      reason: formData.reason,
      status: 'pending',
    });

    if (result.success) {
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          patientName: '',
          doctoId: '',
          appointmentDate: '',
          appointmentTime: '',
          reason: '',
        });
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Book Appointment</h2>
          <button
            onClick={onClose}
            className="text-xl hover:text-blue-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-lg font-bold text-green-700">Booking Confirmed!</p>
              <p className="text-gray-600 text-sm mt-2">
                Your appointment has been scheduled. Check your email for details.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Select Doctor *
                </label>
                <select
                  name="doctoId"
                  value={formData.doctoId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Choose a doctor...</option>
                  {doctors?.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.patient_name} ({doctor.status})
                    </option>
                  ))}
                </select>
                {!doctors?.length && (
                  <p className="text-sm text-gray-500 mt-1">No doctors available</p>
                )}
              </div>

              {/* Appointment Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Appointment Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Appointment Time *
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Reason for Visit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Describe your symptoms or reason for appointment"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold transition ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <p className="text-xs text-gray-600 text-center">
            By booking, you agree to our appointment terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
