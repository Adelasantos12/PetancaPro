import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlayCircle, Users } from 'lucide-react';
import Button from '../components/Button';

const Home = () => {
  return (
    <motion.div
      className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1
        className="text-5xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
      >
        Bienvenido a PetancaPro
      </motion.h1>
      <motion.p
        className="text-xl text-gray-600 mb-8 max-w-2xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Tu asistente definitivo para gestionar torneos de petanca. Registra equipos, organiza rondas suizas y sigue el progreso de cada partida.
      </motion.p>
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Link to="/register">
          <Button>
            <Users className="w-5 h-5" /> Registrar Equipos
          </Button>
        </Link>
        <Link to="/tournament">
          <Button primary={false}>
            <PlayCircle className="w-5 h-5" /> Iniciar Torneo
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Home;