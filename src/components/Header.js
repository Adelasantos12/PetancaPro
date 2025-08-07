import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';

const Header = ({ title, subtitle }) => {
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
        <motion.div
          className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Users className="w-5 h-5" />
          <span className="font-semibold">40 Equipos</span>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;