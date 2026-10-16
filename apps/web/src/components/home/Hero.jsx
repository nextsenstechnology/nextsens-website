import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
    return (
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Electrochemical Measuring Instruments
                    </h2>
                    <p className="text-xl md:text-2xl mb-8 text-blue-100">
                        Professional Grade pH Electrodes & Accessories - Version 2.0
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
                        <Button size="lg" variant="secondary" asChild>
                            <Link to="/products">Browse Catalog</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
                            <Link to="/contact">Request Quote</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;