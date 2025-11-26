'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: "What's Included", href: '#included' },
  { name: 'Stories', href: '#stories' },
  { name: 'Our Why', href: '#why' },
  { name: 'FAQs', href: '#faqs' },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollY = useMotionValue(0);
  
  const paddingTop = useTransform(scrollY, [0, 100], [32, 12]);

  useEffect(() => {
    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  return (
    <motion.header 
      style={{ paddingTop }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-[70%] mx-auto bg-black/80 backdrop-blur-md rounded-full px-4 sm:px-6 lg:px-8 shadow-xl border border-white/10"
      >
        <div className="flex items-center justify-between lg:justify-start h-12 lg:h-14 relative">
          {/* Desktop Navigation - Left */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Logo - Center on desktop, left on mobile */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:absolute lg:left-1/2 lg:-translate-x-1/2"
          >
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white tracking-tight">
                superpower
              </span>
            </Link>
          </motion.div>

          {/* Desktop CTA Buttons - Right */}
          <motion.div
            className="hidden lg:flex items-center space-x-4 ml-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              Login
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Testing
            </Button>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden lg:hidden"
        >
          <div className="py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full text-white hover:bg-white/10"
              >
                Login
              </Button>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full"
              >
                Start Testing
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.nav>
    </motion.header>
  );
}
