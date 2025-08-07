import React from 'react';
import { motion } from 'framer-motion';

const Bracket = ({ title, matches, color = 'blue' }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800' },
    green: { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-800' },
    red: { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-800' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', title: 'text-yellow-800' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-800' },
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      className={`rounded-2xl p-6 ${selectedColor.bg} border ${selectedColor.border} shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className={`text-2xl font-bold text-center mb-6 ${selectedColor.title}`}>{title}</h3>
      <div className="space-y-4">
        {matches.map((match, index) => (
          <div key={match.id} className="flex items-center justify-center">
            {/* This is a simplified bracket view. A real bracket would have lines connecting winners. */}
            <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-inner border">
              <div className="flex justify-between items-center">
                <span className={`font-semibold ${match.winnerId === match.team1.id ? 'text-green-600' : ''}`}>
                  {match.team1.name}
                </span>
                <span className="text-sm font-bold bg-gray-200 px-2 py-1 rounded">
                  {match.played ? `${match.score1} - ${match.score2}` : 'vs'}
                </span>
                <span className={`font-semibold ${match.winnerId === match.team2.id ? 'text-green-600' : ''}`}>
                  {match.team2.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
       {matches.length === 0 && <p className="text-center text-gray-500">Partidos por generar.</p>}
    </motion.div>
  );
};

export default Bracket;
