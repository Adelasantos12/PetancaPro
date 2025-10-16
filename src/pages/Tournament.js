import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {Shuffle, Play, ListOrdered, Award, UserCheck, FileDown } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Tournament = () => {
  const [teams, setTeams] = useLocalStorage('petanca-teams', []);
  const [currentRound, setCurrentRound] = useLocalStorage('petanca-round', 0);
  const [matches, setMatches] = useLocalStorage('petanca-matches', []);
  const [showRanking, setShowRanking] = useLocalStorage('petanca-show-ranking', false);
  const [byeTeam, setByeTeam] = useLocalStorage('petanca-bye', null);
  const [tournamentPhase, setTournamentPhase] = useLocalStorage('petanca-phase', 'swiss');
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [matchHistory, setMatchHistory] = useLocalStorage('petanca-match-history', []);

  useEffect(() => {
    if (currentRound === 0) {
      const registeredTeams = JSON.parse(localStorage.getItem('petancapro-teams') || '[]');
      if (registeredTeams.length > 0) {
        setTeams(registeredTeams
          .filter(team => team.attended)
          .map(team => ({
            ...team,
            wins: 0,
            losses: 0,
            points: 0,
            scoreDifference: 0,
            coefficient: 0,
            pastOpponents: [],
            receivedBye: false,
            category: null,
            rank: 0,
          })));
      }
    }
  }, [currentRound, setTeams]);

  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const getRankedTeams = () => {
    const sortedTeams = [...teams];
    const categoryOrder = { 'A': 1, 'AA': 2, 'B': 3, 'BB': 4, 'C': 5, 'CC': 6, 'Eliminado': 99 };

    if (['reclassification_pending', 'reclassification', 'final_round'].includes(tournamentPhase)) {
        sortedTeams.sort((a, b) => {
            const orderA = categoryOrder[a.category] || 99;
            const orderB = categoryOrder[b.category] || 99;
            if (orderA !== orderB) return orderA - orderB;
            return a.rank - b.rank;
        });
    } else {
        sortedTeams.sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            if (b.points !== a.points) return b.points - a.points;
            return b.coefficient - a.coefficient;
        });
    }
    return sortedTeams;
  };

  const generateSwissMatches = () => {
    setByeTeam(null);
    const rankedTeams = getRankedTeams();
    let pairingPool = rankedTeams.filter(t => t.attended && t.category !== 'Eliminado');

    if (pairingPool.length % 2 !== 0) {
      let byeAssigned = false;
      for (let i = pairingPool.length - 1; i >= 0; i--) {
        if (!pairingPool[i].receivedBye) {
          const teamToBye = pairingPool.splice(i, 1)[0];
          setTeams(prev => prev.map(t => t.id === teamToBye.id ? { ...t, wins: t.wins + 1, points: t.points + 1, coefficient: t.points + 1 + t.scoreDifference + 13, scoreDifference: t.scoreDifference + 13, receivedBye: true } : t));
          setByeTeam(teamToBye);
          byeAssigned = true;
          break;
        }
      }
      if (!byeAssigned && pairingPool.length > 0) {
        const teamToBye = pairingPool.pop();
        setTeams(prev => prev.map(t => t.id === teamToBye.id ? { ...t, wins: t.wins + 1, points: t.points + 1, coefficient: t.points + 1 + t.scoreDifference + 13, scoreDifference: t.scoreDifference + 13, receivedBye: true } : t));
        setByeTeam(teamToBye);
      }
    }

    const newMatches = [];
    if (currentRound === 0) {
      pairingPool = shuffleArray(pairingPool);
      for (let i = 0; i < pairingPool.length; i += 2) {
        newMatches.push({ id: `match-${currentRound + 1}-${i / 2}`, team1: pairingPool[i], team2: pairingPool[i + 1], score1: '', score2: '', winnerId: null, played: false, roundName: `Ronda ${currentRound + 1}` });
      }
    } else {
      const pointGroups = pairingPool.reduce((groups, team) => {
        const key = team.points;
        if (!groups[key]) groups[key] = [];
        groups[key].push(team);
        return groups;
      }, {});
      let unpaired = [];
      const sortedGroupKeys = Object.keys(pointGroups).sort((a, b) => b - a);
      for (const key of sortedGroupKeys) {
        let group = [...pointGroups[key], ...unpaired];
        unpaired = [];
        while (group.length >= 2) {
          const team1 = group.shift();
          let opponentFound = false;
          for (let i = 0; i < group.length; i++) {
            const team2 = group[i];
            if (!team1.pastOpponents.includes(team2.id)) {
              group.splice(i, 1);
              newMatches.push({ id: `match-${currentRound + 1}-${newMatches.length}`, team1, team2, score1: '', score2: '', winnerId: null, played: false, roundName: `Ronda ${currentRound + 1}` });
              opponentFound = true;
              break;
            }
          }
          if (!opponentFound) unpaired.push(team1);
        }
        unpaired.push(...group);
      }
    }
    setMatches(newMatches);
    setMatchHistory(prev => [...prev, ...newMatches]);
    setCurrentRound(prev => prev + 1);
    setShowRanking(false);
  };

  const handleScoreChange = (matchId, teamNum, value) => {
    const updatedMatches = matches.map(match =>
      match.id === matchId ? { ...match, [`score${teamNum}`]: value } : match
    );
    setMatches(updatedMatches);
  };

  const recordMatchResult = (matchId) => {
    const currentMatchIndex = matches.findIndex(m => m.id === matchId);
    if (currentMatchIndex === -1) return;

    let matchToUpdate = { ...matches[currentMatchIndex] };

    if (matchToUpdate.score1 === '' || matchToUpdate.score2 === '') { alert('Por favor, introduce una puntuación para ambos equipos.'); return; }
    const score1 = parseInt(matchToUpdate.score1, 10);
    const score2 = parseInt(matchToUpdate.score2, 10);
    if (isNaN(score1) || isNaN(score2)) { alert('Por favor, introduce puntuaciones válidas.'); return; }
    if (score1 < 0 || score1 > 13 || score2 < 0 || score2 > 13) { alert('La puntuación debe estar entre 0 y 13.'); return; }
    if (score1 === score2) { alert('Empate no permitido en petanca. Debe haber un ganador.'); return; }

    matchToUpdate.winnerId = score1 > score2 ? matchToUpdate.team1.id : matchToUpdate.team2.id;
    matchToUpdate.played = true;

    const updatedMatches = matches.map(m => m.id === matchId ? matchToUpdate : m);
    setMatches(updatedMatches);

    const historyIndex = matchHistory.findIndex(m => m.id === matchId);
    const updatedHistory = [...matchHistory];
    if (historyIndex > -1) {
      updatedHistory[historyIndex] = matchToUpdate;
    } else {
      updatedHistory.push(matchToUpdate);
    }
    setMatchHistory(updatedHistory);

    const teamsToUpdateIds = [matchToUpdate.team1.id, matchToUpdate.team2.id];
    const updatedTeams = teams.map(team => {
      if (!teamsToUpdateIds.includes(team.id)) return team;

      let newWins = 0, newLosses = 0, newPoints = 0, newScoreDifference = 0;
      let newPastOpponents = [];

      updatedHistory.forEach(playedMatch => {
        if (playedMatch.played && (playedMatch.team1.id === team.id || playedMatch.team2.id === team.id)) {
          const isTeam1 = playedMatch.team1.id === team.id;
          newPastOpponents.push(isTeam1 ? playedMatch.team2.id : playedMatch.team1.id);
          if (playedMatch.winnerId === team.id) {
            newWins++;
            newPoints++;
          } else {
            newLosses++;
          }
          const s1 = parseInt(playedMatch.score1, 10);
          const s2 = parseInt(playedMatch.score2, 10);
          if (!isNaN(s1) && !isNaN(s2)) {
            newScoreDifference += isTeam1 ? (s1 - s2) : (s2 - s1);
          }
        }
      });

      const finalTeam = {
        ...team,
        wins: newWins,
        losses: newLosses,
        points: newPoints,
        scoreDifference: newScoreDifference,
        coefficient: newPoints + newScoreDifference,
        pastOpponents: newPastOpponents,
      };

      if (tournamentPhase === 'reclassification') {
        const won = team.id === matchToUpdate.winnerId;
        const currentCategory = team.category;
        if (currentCategory === 'A') finalTeam.category = won ? 'A' : 'AA';
        if (currentCategory === 'B') finalTeam.category = won ? 'B' : 'BB';
        if (currentCategory === 'C') finalTeam.category = won ? 'C' : 'CC';
      }

      return finalTeam;
    });

    setTeams(updatedTeams);
    setEditingMatchId(null);
  };

  const allMatchesPlayed = matches.length > 0 && matches.every(match => match.played);

  const finalizeDay1AndAssignGroups = () => {
    const ranked = getRankedTeams();
    const totalTeams = ranked.length;

    if (totalTeams < 58) {
      alert("Esta lógica de torneo está diseñada para 58 equipos.");
      return;
    }

    const catASize = 16;
    const catBSize = 16;
    const catCSize = 24;

    const updatedTeams = ranked.map((team, index) => {
      const rank = index + 1;
      let category = null;

      if (rank <= catASize) {
        category = 'A';
      } else if (rank <= catASize + catBSize) {
        category = 'B';
      } else if (rank <= catASize + catBSize + catCSize) {
        category = 'C';
      } else {
        category = 'Eliminado';
      }
      return { ...teams.find(t => t.id === team.id), category, rank };
    });

    setTeams(updatedTeams);
    setTournamentPhase('reclassification_pending');
    setMatches([]);
    setShowRanking(true);
  };

  const generateReclassificationRound = () => {
    const makeMatches = (group, groupName) => {
        const newMatches = [];
        const mid = Math.floor(group.length / 2);
        for (let i = 0; i < mid; i++) {
            newMatches.push({
                id: `reclass-${groupName}-${i}`,
                team1: group[i],
                team2: group[group.length - 1 - i],
                score1: '', score2: '', winnerId: null, played: false,
                roundName: `Reclasificación ${groupName}`
            });
        }
        return newMatches;
    };

    const teamsA = teams.filter(t => t.category === 'A').sort((a, b) => a.rank - b.rank);
    const teamsB = teams.filter(t => t.category === 'B').sort((a, b) => a.rank - b.rank);
    const teamsC = teams.filter(t => t.category === 'C').sort((a, b) => a.rank - b.rank);

    const allNewMatches = [
        ...makeMatches(teamsA, 'A'),
        ...makeMatches(teamsB, 'B'),
        ...makeMatches(teamsC, 'C'),
    ];

    setMatches(allNewMatches);
    setMatchHistory(prev => [...prev, ...allNewMatches]);
    setCurrentRound(prev => prev + 1); // Round 6
    setTournamentPhase('reclassification');
  };

  const generateFinalRound = () => {
    const makeMatches = (group, categoryName) => {
        let pairings = shuffleArray([...group]);
        const newMatches = [];
        for (let i = 0; i < pairings.length; i += 2) {
            if (pairings[i+1]) {
                newMatches.push({
                    id: `final-${categoryName}-${i/2}`,
                    team1: pairings[i],
                    team2: pairings[i+1],
                    score1: '', score2: '', winnerId: null, played: false,
                    roundName: `Final - Cat ${categoryName}`
                });
            }
        }
        return newMatches;
    };

    const categories = ['A', 'AA', 'B', 'BB', 'C', 'CC'];
    let finalMatches = [];

    categories.forEach(cat => {
        const categoryTeams = teams.filter(t => t.category === cat);
        finalMatches.push(...makeMatches(categoryTeams, cat));
    });

    setMatches(finalMatches);
    setMatchHistory(prev => [...prev, ...finalMatches]);
    setCurrentRound(prev => prev + 1); // Round 7
    setTournamentPhase('final_round');
  };

  const handleExport = () => {
    const ranked = getRankedTeams();
    const dataToExport = ranked.map((team, index) => ({
      'Posición': team.rank || index + 1,
      'Equipo': team.name,
      'Capitán': team.captain,
      'Victorias': team.wins,
      'Derrotas': team.losses,
      'Puntos': team.points,
      'Coeficiente': team.coefficient.toFixed(2),
      'Categoría': team.category || 'N/A',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ranking Torneo');
    XLSX.writeFile(workbook, 'RankingPetanca.xlsx');
  };

  const renderMatch = (match) => {
    const isEditing = editingMatchId === match.id;
    const isPlayed = match.played && !isEditing;

    return (
      <motion.div key={match.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
        <div className="flex-1 text-center md:text-left"><p className="font-bold text-lg text-gray-800">{match.team1.name}</p><p className="text-sm text-gray-500">Capitán: {match.team1.captain}</p></div>
        <div className="flex items-center gap-2">
          <Input type="number" value={match.score1} onChange={(e) => handleScoreChange(match.id, 1, e.target.value)} className="w-20 text-center" disabled={isPlayed} />
          <div className="flex flex-col items-center"><span className="font-bold text-xl text-gray-600">vs</span>{match.roundName && <span className="text-xs text-gray-500 -mt-1 capitalize">{match.roundName}</span>}</div>
          <Input type="number" value={match.score2} onChange={(e) => handleScoreChange(match.id, 2, e.target.value)} className="w-20 text-center" disabled={isPlayed} />
        </div>
        <div className="flex-1 text-center md:text-right"><p className="font-bold text-lg text-gray-800">{match.team2.name}</p><p className="text-sm text-gray-500">Capitán: {match.team2.captain}</p></div>
        <div className="w-full md:w-auto flex gap-2">
          {!isPlayed ? (
            <Button onClick={() => recordMatchResult(match.id)} primary={true} className="flex-1"><Play className="w-4 h-4" /> Registrar</Button>
          ) : (
            <div className="text-green-600 font-semibold flex items-center justify-center gap-2 w-full"><span>Ganador: {match.winnerId === match.team1.id ? match.team1.name : match.team2.name}</span></div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div className="container mx-auto p-8 bg-white rounded-3xl shadow-xl my-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Gestión del Torneo</h2>
      {teams.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Por favor, registra los equipos primero para iniciar el torneo.</p>
      ) : (
        <>
          {/* Swiss Phase */}
          {tournamentPhase === 'swiss' && (
            currentRound === 0 ? (
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">¡Listo para la acción!</h3>
                <p className="text-gray-600 mb-6">{teams.length} equipos han confirmado asistencia. Genera los partidos de la primera ronda para empezar.</p>
                <Button onClick={() => { if (teams.length < 2) { alert('Necesitas al menos 2 equipos.'); return; } generateSwissMatches(); }}><Shuffle className="w-5 h-5" /> Generar Primera Ronda</Button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-gray-700 mb-5 text-center">Ronda {currentRound}</h3>
                {byeTeam && <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-r-lg mb-6 flex items-center justify-center gap-3"><UserCheck className="w-6 h-6" /><p className="font-semibold">{byeTeam.name} recibe un BYE esta ronda y gana por defecto.</p></div>}
                <div className="space-y-4 mb-8"><AnimatePresence>{matches.map(renderMatch)}</AnimatePresence></div>
                <div className="flex justify-center gap-4 mb-8">
                  {allMatchesPlayed && currentRound < 5 && <Button onClick={generateSwissMatches}><Shuffle className="w-5 h-5" /> Generar Ronda {currentRound + 1}</Button>}
                  {allMatchesPlayed && currentRound === 5 && <Button onClick={finalizeDay1AndAssignGroups}><ListOrdered className="w-5 h-5" /> Finalizar Día 1 y Asignar Grupos</Button>}
                  <Button onClick={() => setShowRanking(!showRanking)} primary={false}><ListOrdered className="w-5 h-5" /> {showRanking ? 'Ocultar' : 'Mostrar'} Ranking</Button>
                </div>
              </>
            )
          )}

          {/* Reclassification Pending */}
          {tournamentPhase === 'reclassification_pending' && (
            <div className="text-center mt-8 p-6 bg-green-50 rounded-2xl border border-green-200">
              <h3 className="text-2xl font-semibold text-green-800 mb-4">Día 1 Finalizado</h3>
              <p className="text-green-700 mb-6">Los grupos de reclasificación han sido asignados. Los 2 peores equipos han sido eliminados. ¿Listo para la Ronda 6?</p>
              <Button onClick={generateReclassificationRound}><Play className="w-5 h-5" /> Iniciar Ronda 6 (Reclasificación)</Button>
            </div>
          )}

          {/* Reclassification Phase */}
          {tournamentPhase === 'reclassification' && (
            <>
              <h3 className="text-2xl font-semibold text-gray-700 mb-5 text-center">Ronda 6 - Reclasificación</h3>
              <div className="space-y-4 mb-8"><AnimatePresence>{matches.map(renderMatch)}</AnimatePresence></div>
              {allMatchesPlayed && <div className="text-center mt-8"><Button onClick={generateFinalRound}><Award className="w-5 h-5" /> Generar Ronda Final (Ronda 7)</Button></div>}
            </>
          )}

          {/* Final Round Phase */}
          {tournamentPhase === 'final_round' && (
             <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800 text-center">Ronda Final (Ronda 7)</h2>
              <div className="space-y-4 mb-8"><AnimatePresence>{matches.map(renderMatch)}</AnimatePresence></div>
              {allMatchesPlayed &&
                <div className="text-center mt-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-200">
                  <h3 className="text-2xl font-semibold text-yellow-800">¡Torneo Finalizado!</h3>
                  <p className="text-yellow-700 mt-2">Consulta el ranking final para ver los resultados.</p>
                </div>
              }
            </div>
          )}

          {/* Ranking table */}
          <AnimatePresence>
            {showRanking && (
              <motion.div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner mt-8" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="flex justify-center items-center mb-5 relative">
                  <h3 className="text-2xl font-semibold text-gray-700 text-center">Ranking Actual</h3>
                  <Button onClick={handleExport} primary={false} className="absolute right-0"><FileDown className="w-5 h-5" />Exportar</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow-sm">
                    <thead><tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal"><th className="py-3 px-6 text-left">Pos.</th><th className="py-3 px-6 text-left">Equipo</th><th className="py-3 px-6 text-center">Victorias</th><th className="py-3 px-6 text-center">Derrotas</th><th className="py-3 px-6 text-center">Puntos</th><th className="py-3 px-6 text-center">Coeficiente</th><th className="py-3 px-6 text-center">Categoría</th></tr></thead>
                    <tbody className="text-gray-700 text-sm font-light">
                      {getRankedTeams().map((team, index) => (
                        <motion.tr key={team.id} className="border-b border-gray-200 hover:bg-gray-50" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                          <td className="py-3 px-6 text-left whitespace-nowrap font-medium">{team.rank || index + 1}</td>
                          <td className="py-3 px-6 text-left">{team.name}</td>
                          <td className="py-3 px-6 text-center">{team.wins}</td>
                          <td className="py-3 px-6 text-center">{team.losses}</td>
                          <td className="py-3 px-6 text-center font-bold">{team.points}</td>
                          <td className="py-3 px-6 text-center">{team.coefficient.toFixed(2)}</td>
                          <td className="py-3 px-6 text-center"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            team.category === 'A' ? 'bg-blue-100 text-blue-800' :
                            team.category === 'AA' ? 'bg-purple-100 text-purple-800' :
                            team.category === 'B' ? 'bg-green-100 text-green-800' :
                            team.category === 'BB' ? 'bg-yellow-100 text-yellow-800' :
                            team.category === 'C' ? 'bg-red-100 text-red-800' :
                            team.category === 'CC' ? 'bg-orange-100 text-orange-800' :
                            team.category === 'Eliminado' ? 'bg-gray-300 text-gray-900' :
                            'bg-gray-100 text-gray-800'
                          }`}>{team.category || 'N/A'}</span></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default Tournament;