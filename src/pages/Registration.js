import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Save, XCircle, AlertCircle, FileUp, Pencil, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Button from '../components/Button';
import Input from '../components/Input';
import TeamCard from '../components/TeamCard';
import DonationModal from '../components/DonationModal';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Registration = () => {
  const [teams, setTeams] = useLocalStorage('petancapro-teams', []);
  const navigate = useNavigate();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [attendingPlayerCount, setAttendingPlayerCount] = useState(0);
  const [newTeam, setNewTeam] = useState({
    id: '',
    captain: '',
    players: ['', '', ''], // Only for players 2, 3, 4
    attended: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [isImportView, setIsImportView] = useState(false);
  const [teamsBeforeImport, setTeamsBeforeImport] = useState([]);
  const [editingFromImport, setEditingFromImport] = useState(false);

  const handleSelectAll = () => {
    setTeams(prev => prev.map(team => ({ ...team, attended: true })));
  };

  const handleDeselectAll = () => {
    setTeams(prev => prev.map(team => ({ ...team, attended: false })));
  };

  const handleCancelImport = () => {
    setTeams(teamsBeforeImport);
    setIsImportView(false);
    setError('');
  };

  const handleAttendanceChange = (teamId, isAttending) => {
    setTeams(prev =>
      prev.map(team =>
        team.id === teamId ? { ...team, attended: isAttending } : team
      )
    );
  };

  const handleEditFromImport = (id) => {
    handleEditTeam(id);
    setEditingFromImport(true);
    setIsImportView(false);
  };

  const handleUpdateTeamFromImport = () => {
    handleAddOrUpdateTeam(); // La lógica existente de `handleAddOrUpdateTeam` ya actualiza el equipo
    setEditingFromImport(false);
    setIsImportView(true); // Vuelve a la vista de importación
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    setTeamsBeforeImport(teams); // Guardar el estado actual

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const importedTeams = jsonData
          .slice(1) // Omitir la primera fila (títulos)
          .map((row, index) => {
            const captainName = row[0] ? String(row[0]).trim() : '';
            const player2 = row[1] ? String(row[1]).trim() : '';
            const players = [captainName];
            if (player2) {
              players.push(player2);
            }

            if (captainName) {
              return {
                id: generateUniqueId(),
                captain: captainName,
                name: captainName,
                players: players,
                attended: false, // Por defecto no han asistido
              };
            }
            return null;
          })
          .filter(Boolean); // Eliminar filas nulas o vacías

        setTeams(importedTeams);
        setIsImportView(true);
        setError('');
      } catch (err) {
        setError('Error al leer el archivo. Asegúrate de que sea un formato válido (.xlsx o .csv).');
        setIsImportView(false);
      }
    };
    reader.readAsBinaryString(file);
  };

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
    if (teams.length >= 58 && !isEditing) {
      setError('No se pueden registrar más de 58 equipos.');
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
    const attendingTeams = teams.filter(team => team.attended);
    if (attendingTeams.length < 2) {
      setError('Se necesitan al menos 2 equipos con asistencia confirmada para iniciar el torneo.');
      return;
    }
    // Guardar solo los equipos que asisten en el localStorage para el torneo
    setTeams(attendingTeams);
    const playerCount = attendingTeams.reduce((count, team) => count + team.players.length, 0);
    setAttendingPlayerCount(playerCount);
    setShowDonationModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowDonationModal(false);
    navigate('/tournament');
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-700">
              {isImportView ? 'Confirmar Asistencia' : isEditing ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}
            </h3>
            {isImportView ? (
              <Button onClick={handleCancelImport} primary={false}>
                <XCircle className="w-5 h-5 mr-2" />
                Cancelar Importación
              </Button>
            ) : (
              <div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".xlsx, .csv"
                />
                <Button onClick={() => document.getElementById('file-upload').click()} primary={false}>
                  <FileUp className="w-5 h-5 mr-2" />
                  Importar
                </Button>
              </div>
            )}
          </div>
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

          {isImportView ? (
            <div>
              <div className="flex justify-end gap-2 mb-4">
                <Button onClick={handleSelectAll} primary={false} className="px-3 py-1 text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Todos
                </Button>
                <Button onClick={handleDeselectAll} primary={false} className="px-3 py-1 text-sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  Ninguno
                </Button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {teams.map(team => (
                  <motion.div
                  key={team.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="font-medium text-gray-800">{team.name}</span>
                  <div className="flex items-center gap-4">
                    <Button onClick={() => handleEditFromImport(team.id)} primary={false} className="px-2 py-1">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <input
                      type="checkbox"
                      checked={team.attended}
                      onChange={(e) => handleAttendanceChange(team.id, e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                </motion.div>
              ))}
              </div>
            </div>
          ) : (
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
              onClick={editingFromImport ? handleUpdateTeamFromImport : handleAddOrUpdateTeam}
              className="w-full"
              primary={!isEditing}
              disabled={teams.length >= 58 && !isEditing}
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
          )}
        </motion.div>

        {/* Lista de Equipos Registrados */}
        {!isImportView && (
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
        </motion.div>
        )}
      </div>

      {teams.length > 0 && (
        <div className="mt-8 text-center">
          <Button onClick={handleSaveAllTeams} className="w-full md:w-auto">
            <Save className="w-5 h-5" /> Iniciar Torneo
          </Button>
        </div>
      )}

      <DonationModal
        isOpen={showDonationModal}
        onClose={handleCloseModal}
        playerCount={attendingPlayerCount}
        paypalEmail="adela.santos12@gmail.com"
      />
    </motion.div>
  );
};

export default Registration;
