import { motion } from 'framer-motion';
import React from 'react';

interface RibbonProps {
  text: string;
  color?: string; // tailwind color e.g. 'bg-red-500'
  className?: string;
  children?: React.ReactNode;
}

export default function Ribbon({ text, color = 'bg-primary-500', className = '', children }: RibbonProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Ribbon */}
      <motion.div
        initial={{ rotate: -10, y: -20, opacity: 0 }}
        animate={{ rotate: -10, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`absolute right-[-40px] top-4 w-40 text-center text-white font-bold py-1 shadow-lg ${color} z-20 select-none`}
        style={{ transform: 'rotate(45deg)' }}
      >
        {text}
      </motion.div>
      {/* Content */}
      {children}
    </div>
  );
}
