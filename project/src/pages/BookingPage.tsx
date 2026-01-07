import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Users, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Venue } from '../types';

export default function BookingPage() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase.from('venues').select('*');
      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast.error('Failed to load venues');
    }
  };

  const checkVenueAvailability = async (venueId: string, date: string, startTime: string, endTime: string) => {
    setIsChecking(true);
    setAvailabilityMessage(null);
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('venue_id', venueId)
        .eq('date', date)
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

      if (error) throw error;

      const isAvailable = !data || data.length === 0;
      
      if (isAvailable) {
        setAvailabilityMessage({
          type: 'success',
          message: 'Venue is available for the selected time slot!'
        });
      } else {
        // Find next available slot
        const bookedSlots = data.map(event => ({
          start: event.start_time,
          end: event.end_time
        })).sort((a, b) => a.start.localeCompare(b.start));

        let nextSlot = null;
        for (let i = 0; i < bookedSlots.length - 1; i++) {
          if (bookedSlots[i].end < bookedSlots[i + 1].start) {
            nextSlot = {
              start: bookedSlots[i].end,
              end: bookedSlots[i + 1].start
            };
            break;
          }
        }

        setAvailabilityMessage({
          type: 'error',
          message: nextSlot 
            ? `Venue is booked. Next available slot: ${nextSlot.start} - ${nextSlot.end}`
            : 'Venue is not available for the selected time slot'
        });
      }

      return isAvailable;
    } catch (error) {
      console.error('Error checking venue availability:', error);
      setAvailabilityMessage({
        type: 'error',
        message: 'Error checking venue availability'
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Debounced check when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedVenue && date && startTime && endTime) {
        checkVenueAvailability(selectedVenue, date, startTime, endTime);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedVenue, date, startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to book a venue');
      return;
    }

    setLoading(true);
    try {
      // Final availability check before submission
      const isAvailable = await checkVenueAvailability(selectedVenue, date, startTime, endTime);
      
      if (!isAvailable) {
        toast.error('This venue is already booked for the selected date and time');
        return;
      }

      const { error } = await supabase.from('events').insert([
        {
          title,
          description,
          venue_id: selectedVenue,
          date,
          start_time: startTime,
          end_time: endTime,
          registration_link: registrationLink,
          host_id: user.id,
        },
      ]);

      if (error) {
        if (error.code === '23505') {
          toast.error('This venue is already booked for the selected date and time');
        } else {
          throw error;
        }
      } else {
        toast.success('Venue booked successfully!');
        setSelectedVenue('');
        setTitle('');
        setDescription('');
        setDate('');
        setStartTime('');
        setEndTime('');
        setRegistrationLink('');
        setAvailabilityMessage(null);
      }
    } catch (error) {
      console.error('Error booking venue:', error);
      toast.error('Failed to book venue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
              Book Your Event Venue
            </h1>
            <p className="text-lg text-gray-600">
              Select a venue and secure your date for an unforgettable event
            </p>
          </div>

          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
            <div className="px-6 md:px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Tech Conference 2025"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <Building className="inline-block w-4 h-4 mr-2" />
                      Select Venue
                    </label>
                    <select
                      value={selectedVenue}
                      onChange={(e) => setSelectedVenue(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
                      required
                    >
                      <option value="">Choose a venue</option>
                      {venues.map((venue) => (
                        <option key={venue.id} value={venue.id}>
                          {venue.name} - Capacity: {venue.capacity}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Event Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your event, agenda, and what attendees can expect..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <CalendarIcon className="inline-block w-4 h-4 mr-2" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <Clock className="inline-block w-4 h-4 mr-2" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <Clock className="inline-block w-4 h-4 mr-2" />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <Users className="inline-block w-4 h-4 mr-2" />
                    Registration Link
                  </label>
                  <input
                    type="url"
                    value={registrationLink}
                    onChange={(e) => setRegistrationLink(e.target.value)}
                    placeholder="https://example.com/register"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {availabilityMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-start gap-3 ${
                      availabilityMessage.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      availabilityMessage.type === 'success'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`} />
                    <p className={availabilityMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                      {availabilityMessage.message}
                    </p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || isChecking || (availabilityMessage?.type === 'error')}
                  className="w-full py-3 px-6 font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Booking...' : isChecking ? 'Checking Availability...' : 'Confirm Booking'}
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}