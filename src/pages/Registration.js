import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Save, XCircle, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import TeamCard from '../components/TeamCard';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Registration = () => {
  const [teams, setTeams] = useLocalStorage('petancapro-teams', []);
  const navigate = useNavigate();
  const [newTeam, setNewTeam] = useState({
    id: '',
    captain: '',
    players: ['', '', ''], // Only for players 2, 3, 4
    attended: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setNewTeam(prev => ({ ...prev, [name]: val }));
  };

  const handlePlayerChange = (index, value) => {
    const updatedPlayers = [...newTeam.players];
    updatedPlayers[index] = value;
    setNewTeam(prev => ({ ...prev, players: updatedPlayers }));
  };

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleAddOrUpdateTeam = () => {
    if (teams.length >= 40 && !isEditing) {
      setError('No se pueden registrar más de 40 equipos.');
      return;
    }

    if (!newTeam.captain.trim()) {
      setError('El nombre del capitán es obligatorio.');
      return;
    }

    const finalTeam = {
      ...newTeam,
      id: isEditing ? newTeam.id : generateUniqueId(),
      name: newTeam.captain, // Team name is captain's name
      players: [newTeam.captain, ...newTeam.players.filter(p => p.trim() !== '')]
    };

    if (isEditing) {
      setTeams(prev => prev.map(team => team.id === finalTeam.id ? finalTeam : team));
      setIsEditing(false);
    } else {
      setTeams(prev => [...prev, finalTeam]);
    }
    setNewTeam({ id: '', captain: '', players: ['', '', ''], attended: true });
    setError('');
  };

  const handleEditTeam = (id) => {
    const teamToEdit = teams.find(team => team.id === id);
    // When editing, we need to populate the form correctly
    const otherPlayers = teamToEdit.players.slice(1);
    while (otherPlayers.length < 3) {
      otherPlayers.push('');
    }
    setNewTeam({
        id: teamToEdit.id,
        captain: teamToEdit.captain,
        players: otherPlayers,
        attended: teamToEdit.attended
    });
    setIsEditing(true);
    setError('');
  };

  const handleDeleteTeam = (id) => {
    setTeams(prev => prev.filter(team => team.id !== id));
  };

  const handleSaveAllTeams = () => {
    if (teams.length === 0) {
      setError('Por favor, registra al menos un equipo.');
      return;
    }
    // No need to pass teams up, they are already in localStorage.
    // Just navigate to the tournament page.
    navigate('/tournament');
    setError('');
  };

  return (
    <motion.div
      className="container mx-auto p-8 bg-white rounded-3xl shadow-xl my-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Registro de Equipos</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario de Registro */}
        <motion.div
          className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            {isEditing ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}
          </h3>
          {error && (
            <motion.div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </motion.div>
          )}
          <div className="space-y-4">
            <Input
              label="Nombre del Capitán (Este será el nombre del equipo)"
              name="captain"
              value={newTeam.captain}
              onChange={handleInputChange}
              placeholder="Ej: Juan Pérez"
            />
            <p className="text-gray-600 font-medium mt-4 mb-2">Otros Jugadores (hasta 3 más):</p>
            {newTeam.players.map((player, index) => (
              <Input
                key={index}
                value={player}
                onChange={(e) => handlePlayerChange(index, e.target.value)}
                placeholder={`Jugador ${index + 2}`}
              />
            ))}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
              <label htmlFor="attended" className="font-medium text-gray-700">Asistencia Confirmada</label>
              <input
                type="checkbox"
                id="attended"
                name="attended"
                checked={newTeam.attended}
                onChange={handleInputChange}
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <Button
              onClick={handleAddOrUpdateTeam}
              className="w-full"
              primary={!isEditing}
              disabled={teams.length >= 40 && !isEditing}
            >
              {isEditing ? (
                <>
                  <Save className="w-5 h-5" /> Guardar Cambios
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" /> Agregar Equipo
                </>
              )}
            </Button>
            {isEditing && (
              <Button onClick={() => {
                setIsEditing(false);
                setNewTeam({ id: '', captain: '', players: ['', '', ''], attended: true });
                setError('');
              }} className="w-full" primary={false}>
                <XCircle className="w-5 h-5" /> Cancelar Edición
              </Button>
            )}
          </div>
        </motion.div>

        {/* Lista de Equipos Registrados */}
        <motion.div
          className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-2xl font-semibold text-gray-700 mb-5">Equipos Registrados ({teams.length})</h3>
          <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2">
            <AnimatePresence>
              {teams.length === 0 ? (
                <motion.p
                  className="text-center text-gray-500 py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Aún no hay equipos registrados. ¡Anímate a añadir el primero!
                </motion.p>
              ) : (
                teams.map(team => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onEdit={handleEditTeam}
                    onDelete={handleDeleteTeam}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
          {teams.length > 0 && (
            <Button onClick={handleSaveAllTeams} className="w-full mt-6">
              <Save className="w-5 h-5" /> Iniciar Torneo
            </Button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Registration;