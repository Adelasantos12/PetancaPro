import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Tournament from './pages/Tournament';

const AppContent = () => {
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const navigate = useNavigate();

  const handleRegisterTeams = (teams) => {
    setRegisteredTeams(teams);
    navigate('/tournament');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header title="PetancaPro" subtitle="Gestión de Torneos" />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/register"
            element={<Registration onRegisterTeams={handleRegisterTeams} />}
          />
          <Route
            path="/tournament"
            element={<Tournament registeredTeams={registeredTeams} />}
          />
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