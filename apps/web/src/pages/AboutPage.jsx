import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Target, Zap, Users } from 'lucide-react';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us | NextSens Tech</title>
        <meta name="description" content="Learn about NextSens Tech, our mission, vision, and the team dedicated to pioneering precision in electrochemical measurement." />
        <link rel="canonical" href="https://www.nextsenstech.com/about" />
      </Helmet>

      <div className="bg-background">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl"
          >
            About <span className="text-primary">NextSens Tech</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground"
          >
            Pioneering Precision in Electrochemical Measurement
          </motion.p>
        </div>

        {/* Our Story Section */}
        <div className="py-16 bg-secondary/50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7 }}
              >
                <img className="rounded-2xl shadow-xl" alt="Modern laboratory with advanced scientific equipment and beakers" src="https://images.unsplash.com/photo-1602052577122-f73b9710adba" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="prose prose-lg text-muted-foreground max-w-none"
              >
                <h2 className="text-foreground">Our Story</h2>
                <p>
                  NextSens Tech was born from a clear vision: to bridge the gap between complex scientific research and accessible, reliable instrumentation. We recognized a critical need for robust, precise, and user-friendly electrochemical sensors that could empower both seasoned researchers and industrial technicians alike.
                </p>
                <p>
                  From our beginnings in Mumbai, we have grown into a trusted national supplier, driven by a relentless passion for innovation and an unwavering commitment to quality. Our journey is one of continuous improvement, inspired by the real-world challenges our customers face every day.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mission, Vision, Team Section */}
        <div className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-8 rounded-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-foreground">Our Mission</h3>
                <p className="mt-4 text-muted-foreground">
                  To provide cutting-edge, reliable, and affordable electrochemical measuring instruments that drive innovation and efficiency in science and industry.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                 className="p-8 rounded-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-foreground">Our Vision</h3>
                <p className="mt-4 text-muted-foreground">
                  To be India's most trusted partner for precision measurement solutions, recognized for our innovation, quality, and exceptional customer support.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                 className="p-8 rounded-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-foreground">Our Team</h3>
                <p className="mt-4 text-muted-foreground">
                  A dedicated group of engineers, scientists, and support specialists passionate about helping you achieve accurate results with our technology.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;