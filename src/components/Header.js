import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar el torneo? Todo el progreso se perderá.')) {
      // Clear all localStorage keys related to the app
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('petanca')) {
          localStorage.removeItem(key);
        }
      });
      navigate('/');
      window.location.reload(); // Force a full reload to clear all state
    }
  };

  return (
    <motion.header
      className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-b-3xl shadow-lg"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Trophy className="w-10 h-10 text-blue-200" />
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-blue-100">{subtitle}</p>
          </div>
        </div>
        <motion.button
          onClick={handleReset}
          className="flex items-center gap-2 bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reiniciar Torneo</span>
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Header;