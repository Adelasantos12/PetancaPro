import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from '../components/Header';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header title="PetancaPro" subtitle="Gestión de Torneos" />
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
