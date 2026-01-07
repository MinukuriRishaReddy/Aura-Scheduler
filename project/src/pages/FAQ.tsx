import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I book a venue?',
      answer:
        'To book a venue, navigate to the "Book Venue" page, select your desired venue, date, and time slot. Fill in the required details and submit your booking request. Hosts will review and approve your booking.',
    },
    {
      question: 'What are the venue capacities?',
      answer:
        'D Block Auditorium: 500 people\nB Block Auditorium: 300 people\nC Seminar Hall: 150 people\nG Seminar Hall: 100 people\nA Seminar Hall: 200 people\nH Seminar Hall: 120 people',
    },
    {
      question: 'How can I register for an event?',
      answer:
        'You can register for events through the "Event Registration" page. Browse available events, click on "Register Now," and follow the registration link provided by the event organizer.',
    },
    {
      question: 'Can I modify or cancel my booking?',
      answer:
        'Yes, hosts can modify or cancel their bookings. Contact the venue administrator through the chatbot or email for assistance with modifications.',
    },
    {
      question: 'How far in advance should I book a venue?',
      answer:
        'We recommend booking venues at least 2 weeks in advance to ensure availability. Popular venues and peak times may require earlier booking.',
    },
    {
      question: 'What if I need technical support during my event?',
      answer:
        'Technical support is available for all venues. Contact the support team through the chatbot or call +91 8328382486 for immediate assistance.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Find answers to common questions about venue booking and event management
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
              >
                <span className="text-lg font-medium text-gray-900">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <Minus className="h-5 w-5 text-primary-500" />
                ) : (
                  <Plus className="h-5 w-5 text-primary-500" />
                )}
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 whitespace-pre-line text-gray-600">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}