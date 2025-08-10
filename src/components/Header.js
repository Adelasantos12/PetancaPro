import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== '/';

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar el torneo? Todo el progreso se perderá.')) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('petanca')) {
          localStorage.removeItem(key);
        }
      });
      navigate('/');
      window.location.reload();
    }
  };

  const handleBack = () => {
    if (location.pathname === '/tournament') {
      const event = new CustomEvent('petanca-back-button-clicked');
      window.dispatchEvent(event);
    } else {
      navigate(-1);
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
          {showBackButton && (
            <motion.button
              onClick={handleBack}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          )}
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