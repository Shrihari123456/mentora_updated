'use client';
import React from 'react';
import { useRouter } from "next/navigation";

import { motion } from 'framer-motion';
import { ArrowRight, Star, Users, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const LandingPage: React.FC = () => {
    const router = useRouter();
  const features = [
    {
      icon: Target,
      title: 'Smart Mentoring',
      description: 'AI connects students with the perfect mentors for their goals.'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your growth with smart insights and analytics.'
    },
    {
      icon: Users,
      title: 'Supportive Community',
      description: 'Learn, grow, and thrive with mentors, peers, and parents.'
    }
  ];

  const testimonials = [
    {
      name: 'Aarav R.',
      role: 'Engineering Student',
      content: 'MentorConnect helped me gain confidence and land my dream internship!',
      rating: 5
    },
    {
      name: 'Dr. Nisha Verma',
      role: 'Senior Mentor',
      content: 'The platform simplifies mentoring and brings clarity to student progress.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-purple-50 text-gray-800 font-sans">
      {/* Hero Section */}
      <section className="py-24 px-6 text-center bg-gradient-to-br from-purple-500 to-purple-700 text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
        >
          Transforming Futures with <br />
          <span className="text-yellow-300">MentorConnect</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl md:text-2xl max-w-xl mx-auto mb-8"
        >
          Personalized mentoring for every student, with real-time progress and community support.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-yellow-400 text-purple-900 font-medium text-lg rounded-lg shadow-md hover:bg-yellow-300 transition"
          >
            Get Started <ArrowRight className="ml-2" />
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-purple-700">Why MentorConnect?</h2>
          <p className="text-lg text-gray-600 mb-12">
            Empowering students with technology, insight, and guidance.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-purple-100 p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-purple-600 text-white rounded-full">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-purple-800 mb-2">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10 text-purple-700">What People Are Saying</h2>
          <div className="space-y-10">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-6 rounded-xl shadow"
              >
                <div className="flex justify-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-4">"{testimonial.content}"</p>
                <p className="font-semibold text-purple-800">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Ready to Begin Your Journey?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-yellow-400 text-purple-900 font-medium text-lg rounded-lg hover:bg-yellow-300 transition"
          >
            Join Now <ArrowRight className="ml-2" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
