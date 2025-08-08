import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Tournament from './pages/Tournament';

const AppContent = () => {
  // State is no longer managed at the App level.
  // Components will get their state from localStorage.
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header title="PetancaPro" subtitle="Gestión de Torneos" />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/tournament" element={<Tournament />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;