import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event, Venue } from '../types';

type EventWithVenue = Event & { venue: Venue };

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<EventWithVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventDensity, setEventDensity] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venue:venues(*)
        `)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);

      // Calculate event density
      const density: Record<string, number> = {};
      data?.forEach((event) => {
        const date = event.date;
        density[date] = (density[date] || 0) + 1;
      });
      setEventDensity(density);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayClassNames = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = eventDensity[dateStr] || 0;
    if (count > 5) return 'bg-red-50 text-red-600';
    if (count > 2) return 'bg-green-50 text-green-600';
    if (count > 0) return 'bg-blue-50 text-blue-600';
    return '';
  };

  const selectedDateEvents = events.filter(
    (event) => event.date === format(selectedDate || new Date(), 'yyyy-MM-dd')
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/2"
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiersClassNames={{
                  selected: 'bg-primary-600 text-white rounded',
                  today: 'text-primary-600 font-bold',
                }}
                modifiers={{
                  hasEvents: (date) =>
                    eventDensity[format(date, 'yyyy-MM-dd')] > 0,
                }}
                modifiersStyles={{
                  hasEvents: {
                    fontWeight: 'bold',
                  },
                }}
                className="mx-auto"
                styles={{
                  caption: { color: 'rgb(17 24 39)' },
                  head_cell: { color: 'rgb(107 114 128)' },
                }}
              />

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600">High event density</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">Medium event density</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Low event density</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/2"
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Events on {format(selectedDate || new Date(), 'MMMM d, yyyy')}
              </h2>

              {loading ? (
                <div className="text-center py-8">Loading events...</div>
              ) : selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No events scheduled for this date
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedDateEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-l-4 border-primary-500 pl-4 py-2"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{event.description}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {event.start_time} - {event.end_time}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{event.venue.name}</span>
                        </div>
                      </div>
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-primary-600 hover:text-primary-700"
                      >
                        Register →
                      </a>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}