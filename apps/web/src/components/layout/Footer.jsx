import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1F2937] text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
                <span className="text-white font-bold text-2xl">NST</span>
              </div>
              <span className="text-xl font-bold text-white">NextSens Technology</span>
            </div>
            <p className="text-gray-300 text-sm mt-4">
              Pioneering precision in electrochemical measurement. High-quality instruments trusted by laboratories and industries worldwide.
            </p>
          </div>

          <div>
            <p className="font-semibold text-white tracking-wider uppercase">Quick Links</p>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/store" className="text-gray-300 hover:text-accent transition-colors">Online Store</Link></li>
              <li><Link to="/products" className="text-gray-300 hover:text-accent transition-colors">All Products</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white tracking-wider uppercase">Contact Us</p>
            <ul className="mt-4 space-y-3 text-gray-300">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-accent" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-accent" />
                <a href="tel:+919321175585" className="hover:text-accent transition-colors">+91-9321175585</a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-accent" />
                <a href="mailto:sales@nextsenstech.com" className="hover:text-accent transition-colors">sales@nextsenstech.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} NextSens Technology. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;