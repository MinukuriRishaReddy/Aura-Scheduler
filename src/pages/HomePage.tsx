import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Calendar,
      title: 'View Calendar',
      description: 'Check upcoming events and venue availability',
      path: '/calendar',
    },
    {
      icon: BookOpen,
      title: 'Book Venue',
      description: 'Reserve a venue for your event',
      path: '/booking',
    },
    {
      icon: Users,
      title: 'Event Registration',
      description: 'Register for upcoming events',
      path: '/events',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-700 bg-clip-text text-transparent">
              Welcome{user ? `, ${user.name}` : ''}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your all-in-one platform for managing events and venue bookings with ease
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
              onClick={() => navigate(feature.path)}
              className="relative group bg-white rounded-2xl p-8 cursor-pointer border border-gray-100 hover:border-primary-200 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-flex p-4 bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-700 rounded-xl mb-6"
                >
                  <feature.icon className="h-7 w-7" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="flex items-center text-primary-600 font-semibold"
                >
                  <span>Get Started</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>

              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to book your next event?</h2>
          <p className="text-lg mb-8 text-primary-100">Choose a venue and secure your date in just a few clicks</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/booking')}
            className="bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Book a Venue Now
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}