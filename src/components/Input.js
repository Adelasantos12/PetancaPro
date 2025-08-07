import React from 'react';
import { motion } from 'framer-motion';

const Input = ({ label, type = 'text', value, onChange, placeholder, className = '', ...props }) => {
  return (
    <motion.div
      className={`w-full ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && <label className="block text-gray-700 text-sm font-medium mb-2">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-400"
        {...props}
      />
    </motion.div>
  );
};

export default Input;