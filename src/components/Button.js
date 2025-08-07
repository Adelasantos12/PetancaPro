import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, primary = true, className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2";
  const primaryStyle = "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105";
  const secondaryStyle = "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105";

  return (
    <motion.button
      onClick={onClick}
      className={`${baseStyle} ${primary ? primaryStyle : secondaryStyle} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;