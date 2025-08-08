import React from 'react';
import { motion } from 'framer-motion';
import { User, Users, CheckCircle, XCircle } from 'lucide-react';

const TeamCard = ({ team, onEdit, onDelete, showActions = true }) => {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${team.attended ? 'border-green-500' : 'border-gray-300'} flex flex-col gap-4`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${team.attended ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Users className={`w-6 h-6 ${team.attended ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
                <p className="text-gray-500 text-sm">Capitán: {team.captain}</p>
            </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${team.attended ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
          {team.attended ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          <span>{team.attended ? 'Presente' : 'Ausente'}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 pl-2">
        <p className="text-gray-600 font-medium">Jugadores:</p>
        <ul className="space-y-1 text-gray-600">
          {team.players.filter(p => p.trim() !== '').map((player, index) => (
            <li key={index} className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" /> {player}
            </li>
          ))}
        </ul>
      </div>
      {showActions && (
        <div className="flex gap-2 mt-4">
          <motion.button
            onClick={() => onEdit(team.id)}
            className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold hover:bg-yellow-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Editar
          </motion.button>
          <motion.button
            onClick={() => onDelete(team.id)}
            className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Eliminar
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default TeamCard;