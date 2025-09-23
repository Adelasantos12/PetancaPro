import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Tournament from './pages/Tournament';
import AdelaProfile from './pages/AdelaProfile';
import MainLayout from './layouts/MainLayout';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<MainLayout><Home /></MainLayout>}
        />
        <Route
          path="/register"
          element={<MainLayout><Registration /></MainLayout>}
        />
        <Route
          path="/tournament"
          element={<MainLayout><Tournament /></MainLayout>}
        />
        <Route path="/adela-santos" element={<AdelaProfile />} />
      </Routes>
    </Router>
  );
};

export default App;