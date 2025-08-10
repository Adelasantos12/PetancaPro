import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { Shuffle, Play, ListOrdered, Award, UserCheck, FileDown, Pencil } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Bracket from '../components/Bracket';
import { useLocalStorage } from '../hooks/useLocalStorage';

const Tournament = () => {
  const [teams, setTeams] = useLocalStorage('petanca-teams', []);
  const [currentRound, setCurrentRound] = useLocalStorage('petanca-round', 0);
  const [matches, setMatches] = useLocalStorage('petanca-matches', []);
  const [showRanking, setShowRanking] = useLocalStorage('petanca-show-ranking', false);
  const [byeTeam, setByeTeam] = useLocalStorage('petanca-bye', null);
  const [tournamentPhase, setTournamentPhase] = useLocalStorage('petanca-phase', 'swiss');
  const [knockoutBrackets, setKnockoutBrackets] = useLocalStorage('petanca-knockout', null);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [matchHistory, setMatchHistory] = useLocalStorage('petanca-match-history', []);

  useEffect(() => {
    const handleGoBack = () => {
      if (currentRound > 1) {
        const previousRound = currentRound - 1;
        const roundMatches = matchHistory.filter(match => match.id.includes(`match-${previousRound}-`));
        setMatches(roundMatches);
        setCurrentRound(previousRound);
      } else {
        console.log("Cannot go back from round 1.");
      }
    };

    window.addEventListener('petanca-back-button-clicked', handleGoBack);
    return () => {
      window.removeEventListener('petanca-back-button-clicked', handleGoBack);
    };
  }, [currentRound, matchHistory, setMatches, setCurrentRound]);

  useEffect(() => {
    // When the component mounts, check if a tournament is already in progress.
    // If not (i.e., round is 0), initialize the tournament teams
    // from the list of registered teams in localStorage.
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
            day1Rank: 0,
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
    const categoryOrder = { 'A': 1, 'AA': 2, 'B': 3, 'BB': 4, 'C': 5 };

    // After reclassification, group by category first
    if (tournamentPhase === 'reclassification_pending' || tournamentPhase === 'reclassification' || tournamentPhase === 'knockout') {
      sortedTeams.sort((a, b) => {
        const orderA = categoryOrder[a.category] || 99;
        const orderB = categoryOrder[b.category] || 99;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // If in the same category, sort by day1Rank
        return a.day1Rank - b.day1Rank;
      });
    } else {
      // Standard ranking for Swiss rounds
      sortedTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.coefficient - a.coefficient;
      });
    }
    return sortedTeams;
  };

  const generateMatches = () => {
    setByeTeam(null);
    const rankedTeams = getRankedTeams();
    let pairingPool = rankedTeams.filter(t => t.attended);

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
        newMatches.push({ id: `match-${currentRound + 1}-${i / 2}`, team1: pairingPool[i], team2: pairingPool[i + 1], score1: '', score2: '', winnerId: null, played: false });
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
              newMatches.push({ id: `match-${currentRound + 1}-${newMatches.length}`, team1, team2, score1: '', score2: '', winnerId: null, played: false });
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

    if (tournamentPhase === 'knockout') {
      const updatedBrackets = { ...knockoutBrackets };
      for (const category in updatedBrackets) {
        const matchIndex = updatedBrackets[category].findIndex(m => m.id === matchId);
        if (matchIndex > -1) {
          updatedBrackets[category][matchIndex][`score${teamNum}`] = value;
          break;
        }
      }
      setKnockoutBrackets(updatedBrackets);
    }
  };

  const recordMatchResult = (matchId, isEditing = false) => {
    // Find the match in the current round's matches
    const currentMatchIndex = matches.findIndex(m => m.id === matchId);
    if (currentMatchIndex === -1) return;

    let matchToUpdate = { ...matches[currentMatchIndex] };

    // Validate scores
    if (matchToUpdate.score1 === '' || matchToUpdate.score2 === '') { alert('Por favor, introduce una puntuación para ambos equipos.'); return; }
    const score1 = parseInt(matchToUpdate.score1, 10);
    const score2 = parseInt(matchToUpdate.score2, 10);
    if (isNaN(score1) || isNaN(score2)) { alert('Por favor, introduce puntuaciones válidas.'); return; }
    if (score1 === score2) { alert('Empate no permitido en petanca. Debe haber un ganador.'); return; }

    // Update the match details
    const winnerId = score1 > score2 ? matchToUpdate.team1.id : matchToUpdate.team2.id;
    matchToUpdate.winnerId = winnerId;
    matchToUpdate.played = true;

    // Update the match in the current round's state
    const updatedCurrentMatches = [...matches];
    updatedCurrentMatches[currentMatchIndex] = matchToUpdate;
    setMatches(updatedCurrentMatches);

    // Update the match in the persistent history
    const historyIndex = matchHistory.findIndex(m => m.id === matchId);
    const updatedHistory = [...matchHistory];
    if (historyIndex > -1) {
      updatedHistory[historyIndex] = matchToUpdate;
    } else {
      // This should not happen if generation logic is correct, but as a fallback
      updatedHistory.push(matchToUpdate);
    }
    setMatchHistory(updatedHistory);

    // Get the IDs of the teams whose stats need recalculation
    const teamsToUpdateIds = [matchToUpdate.team1.id, matchToUpdate.team2.id];

    // Recalculate stats from the single source of truth: the updated match history
    const updatedTeams = teams.map(team => {
      if (!teamsToUpdateIds.includes(team.id)) {
        return team;
      }

      // Reset stats for recalculation
      let newWins = 0, newLosses = 0, newPoints = 0, newScoreDifference = 0;
      let newPastOpponents = [];

      // Recalculate using the full, updated history
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
          if(!isNaN(s1) && !isNaN(s2)) {
            newScoreDifference += isTeam1 ? (s1 - s2) : (s2 - s1);
          }
        }
      });
      
      const updatedTeam = {
        ...team,
        wins: newWins,
        losses: newLosses,
        points: newPoints,
        scoreDifference: newScoreDifference,
        coefficient: newPoints + newScoreDifference,
        pastOpponents: newPastOpponents,
      };

      // Handle reclassification category update
      if (tournamentPhase === 'reclassification' && matchToUpdate.roundName === 'Reclasificación') {
        const won = team.id === winnerId;
        if (team.category === 'A') updatedTeam.category = won ? 'A' : 'AA';
        if (team.category === 'B') updatedTeam.category = won ? 'B' : 'BB';
      }

      return updatedTeam;
    });

    setTeams(updatedTeams);
    
    // Update knockout brackets if necessary
    if (tournamentPhase === 'knockout') {
      const updatedBrackets = { ...knockoutBrackets };
      for (const category in updatedBrackets) {
        const idx = updatedBrackets[category].findIndex(m => m.id === matchId);
        if (idx > -1) {
          updatedBrackets[category][idx] = matchToUpdate;
          break;
        }
      }
      setKnockoutBrackets(updatedBrackets);
    }

    setEditingMatchId(null); // Exit editing mode
  };

  const allMatchesPlayed = matches.length > 0 && matches.every(match => match.played);

  const handleExport = () => {
    const ranked = getRankedTeams();
    const dataToExport = ranked.map((team, index) => ({
      'Posición': index + 1,
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

  const assignCategories = () => {
    const ranked = getRankedTeams();
    const updatedTeams = teams.map((team) => {
      const rankIndex = ranked.findIndex(t => t.id === team.id);
      let category = null;
      if (rankIndex < 16) category = 'A';
      else if (rankIndex < 32) category = 'B';
      else category = 'C';
      return { ...team, category, day1Rank: rankIndex + 1 };
    });
    setTeams(updatedTeams);
    setTournamentPhase('reclassification_pending');
    setMatches([]);
    setShowRanking(true); // Automatically show ranking for Day 2 start
  };

  const startDay2 = () => {
    const teamsA = teams.filter(t => t.category === 'A').sort((a, b) => a.day1Rank - b.day1Rank);
    const teamsB = teams.filter(t => t.category === 'B').sort((a, b) => a.day1Rank - b.day1Rank);
    const teamsC = teams.filter(t => t.category === 'C').sort((a, b) => a.day1Rank - b.day1Rank);

    const makeMatches = (group, type, roundName) => {
      const newMatches = [];
      const mid = group.length / 2;
      for (let i = 0; i < mid; i++) {
        newMatches.push({
          id: `${type}-${group[i].category}-${i}`,
          team1: group[i],
          team2: group[group.length - 1 - i],
          score1: '', score2: '', winnerId: null, played: false,
          roundName: roundName
        });
      }
      return newMatches;
    };

    const reclassMatches = makeMatches(teamsA, 'reclass', 'Reclasificación');
    const reclassMatchesB = makeMatches(teamsB, 'reclass', 'Reclasificación');
    const cQuarterFinals = makeMatches(teamsC, 'knockout-C', 'C - Cuartos');
    
    const allNewMatches = [...reclassMatches, ...reclassMatchesB, ...cQuarterFinals];

    setMatches(allNewMatches);
    setMatchHistory(prev => [...prev, ...allNewMatches]);
    setTournamentPhase('reclassification');
  };
  
  const generateKnockoutBrackets = () => {
    const finalBrackets = {};
    const finalMatches = [];
    const mainCategories = ['A', 'AA', 'B', 'BB'];

    // Generate Quarterfinals for A, AA, B, BB
    mainCategories.forEach(category => {
      const categoryTeams = teams.filter(t => t.category === category).sort((a, b) => a.day1Rank - b.day1Rank);
      const newMatches = [];
      if (categoryTeams.length >= 2) {
        const mid = categoryTeams.length / 2;
        for (let i = 0; i < mid; i++) {
          newMatches.push({ id: `knockout-${category}-qf-${i}`, team1: categoryTeams[i], team2: categoryTeams[categoryTeams.length - 1 - i], score1: '', score2: '', winnerId: null, played: false, roundName: `${category} - Cuartos` });
        }
      }
      finalBrackets[category] = newMatches;
      finalMatches.push(...newMatches);
    });

    // Generate Semifinals for C
    const cQuarterFinalMatches = matchHistory.filter(m => m.id.startsWith('knockout-C'));
    const cWinners = cQuarterFinalMatches.map(m => m.winnerId ? teams.find(t => t.id === m.winnerId) : null).filter(Boolean);
    
    const cSemifinals = [];
    if (cWinners.length >= 2) {
       cSemifinals.push({ id: 'knockout-C-sf-0', team1: cWinners[0], team2: cWinners[1], score1: '', score2: '', winnerId: null, played: false, roundName: 'C - Semifinal' });
    }
    if (cWinners.length >= 4) {
       cSemifinals.push({ id: 'knockout-C-sf-1', team1: cWinners[2], team2: cWinners[3], score1: '', score2: '', winnerId: null, played: false, roundName: 'C - Semifinal' });
    }
    
    finalBrackets['C'] = [...cQuarterFinalMatches, ...cSemifinals];
    finalMatches.push(...cSemifinals);

    setKnockoutBrackets(finalBrackets);
    setTournamentPhase('knockout');
    setMatches(finalMatches);
    setMatchHistory(prev => [...prev, ...cSemifinals]); // Only add the new semi-final matches
  };

  const renderMatch = (match) => {
    const isEditing = editingMatchId === match.id;
    const isPlayed = match.played && !isEditing;

    return (
      <motion.div key={match.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
        <div className="flex-1 text-center md:text-left"><p className="font-bold text-lg text-gray-800">{match.team1.name}</p><p className="text-sm text-gray-500">Capitán: {match.team1.captain}</p></div>
        <div className="flex items-center gap-2">
          <Input type="number" value={match.score1} onChange={(e) => handleScoreChange(match.id, 1, e.target.value)} className="w-20 text-center" disabled={isPlayed} />
          <div className="flex flex-col items-center">
            <span className="font-bold text-xl text-gray-600">vs</span>
            {match.roundName && <span className="text-xs text-gray-500 -mt-1 capitalize">{match.roundName}</span>}
          </div>
          <Input type="number" value={match.score2} onChange={(e) => handleScoreChange(match.id, 2, e.target.value)} className="w-20 text-center" disabled={isPlayed} />
        </div>
        <div className="flex-1 text-center md:text-right"><p className="font-bold text-lg text-gray-800">{match.team2.name}</p><p className="text-sm text-gray-500">Capitán: {match.team2.captain}</p></div>
        
        <div className="w-full md:w-auto flex gap-2">
          {!match.played || isEditing ? (
            <>
              <Button onClick={() => recordMatchResult(match.id, isEditing)} primary={true} className="flex-1">
                <Play className="w-4 h-4" /> {isEditing ? 'Guardar' : 'Registrar'}
              </Button>
              {isEditing && (
                <Button onClick={() => setEditingMatchId(null)} primary={false} className="flex-1">
                  Cancelar
                </Button>
              )}
            </>
          ) : (
            <div className="text-green-600 font-semibold flex items-center justify-center gap-4 w-full">
              <span>Ganador: {match.winnerId === match.team1.id ? match.team1.name : match.team2.name}</span>
              <Button onClick={() => setEditingMatchId(match.id)} primary={false} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div className="container mx-auto p-8 bg-white rounded-3xl shadow-xl my-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Gestión del Torneo</h2>
      {teams.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Por favor, registra los equipos primero para iniciar el torneo.</p>
      ) : (
        <>
          {/* Swiss Phase */}
          {tournamentPhase === 'swiss' && (
            currentRound === 0 ? (
              <motion.div className="text-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">¡Listo para la acción!</h3>
                <p className="text-gray-600 mb-6">{teams.length} equipos han confirmado asistencia. Genera los partidos de la primera ronda para empezar.</p>
                <Button onClick={() => {
                  if (teams.length < 2) { alert('Necesitas al menos 2 equipos con asistencia confirmada.'); return; }
                  generateMatches();
                }}><Shuffle className="w-5 h-5" /> Generar Primera Ronda</Button>
              </motion.div>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-gray-700 mb-5 text-center">Ronda {currentRound}</h3>
                {byeTeam && <motion.div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-r-lg mb-6 flex items-center justify-center gap-3" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}><UserCheck className="w-6 h-6" /><p className="font-semibold">{byeTeam.name} recibe un BYE esta ronda y gana por defecto.</p></motion.div>}
                <div className="space-y-4 mb-8"><AnimatePresence>{matches.map(renderMatch)}</AnimatePresence></div>
                <div className="flex justify-center gap-4 mb-8">
                  {allMatchesPlayed && currentRound < 5 && <Button onClick={generateMatches}><Shuffle className="w-5 h-5" /> Generar Ronda {currentRound + 1}</Button>}
                  {allMatchesPlayed && currentRound === 5 && <Button onClick={assignCategories}><ListOrdered className="w-5 h-5" /> Finalizar Día 1 y Asignar Categorías</Button>}
                  <Button onClick={() => setShowRanking(!showRanking)} primary={false}><ListOrdered className="w-5 h-5" /> {showRanking ? 'Ocultar' : 'Mostrar'} Ranking</Button>
                </div>
              </>
            )
          )}

          {/* Reclassification Pending Phase */}
          {tournamentPhase === 'reclassification_pending' && (
            <motion.div className="text-center mt-8 p-6 bg-green-50 rounded-2xl border border-green-200" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
              <h3 className="text-2xl font-semibold text-green-800 mb-4">¡Listo para el Día 2!</h3>
              <p className="text-green-700 mb-6">Las categorías iniciales han sido asignadas. Es hora del partido de reclasificación y los cuartos de final de la Categoría C.</p>
              <Button onClick={startDay2}><Play className="w-5 h-5" /> Iniciar Partidos del Día 2</Button>
            </motion.div>
          )}

          {/* Reclassification Phase */}
          {tournamentPhase === 'reclassification' && (
            <>
              <h3 className="text-2xl font-semibold text-gray-700 mb-5 text-center">Día 2 - Partidos de Avance</h3>
              <div className="space-y-4 mb-8">
                <AnimatePresence>
                  {matches.map(renderMatch)}
                </AnimatePresence>
              </div>
              {knockoutBrackets?.C && (
                <div className="mt-8">
                   <Bracket title="Categoría C - Cuartos de Final" matches={knockoutBrackets.C} color="red" />
                </div>
              )}
              {allMatchesPlayed && <div className="text-center mt-8"><Button onClick={generateKnockoutBrackets}><Award className="w-5 h-5" /> Generar Brackets Finales</Button></div>}
            </>
          )}

          {/* Knockout Phase */}
          {tournamentPhase === 'knockout' && knockoutBrackets && (
             <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-3xl font-bold text-gray-800 text-center">Fase de Eliminatorias Finales</h2>
              <p className="text-center text-gray-600">Registra los resultados de los cuartos de final a continuación.</p>
              <div className="space-y-4 mb-8"><AnimatePresence>{matches.map(renderMatch)}</AnimatePresence></div>
              <hr className="my-8"/>
              <h3 className="text-2xl font-semibold text-gray-700 mb-5 text-center">Brackets de Eliminatorias</h3>
              <Bracket title="Principal A - Cuartos de Final" matches={knockoutBrackets.A || []} color="blue" />
              <Bracket title="Principal AA - Cuartos de Final" matches={knockoutBrackets.AA || []} color="purple" />
              <Bracket title="Consolación B - Cuartos de Final" matches={knockoutBrackets.B || []} color="green" />
              <Bracket title="Consolación BB - Cuartos de Final" matches={knockoutBrackets.BB || []} color="yellow" />
              <Bracket title="Categoría C - Cuartos de Final" matches={knockoutBrackets.C || []} color="red" />
            </motion.div>
          )}

          {/* Ranking table, can be shown anytime */}
          <AnimatePresence>
            {showRanking && (
              <motion.div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner mt-8" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }}>
                <div className="flex justify-center items-center mb-5 relative">
                  <h3 className="text-2xl font-semibold text-gray-700 text-center">Ranking Actual</h3>
                  <Button onClick={handleExport} primary={false} className="absolute right-0">
                    <FileDown className="w-5 h-5" />
                    Exportar
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow-sm">
                    <thead><tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal"><th className="py-3 px-6 text-left">Pos.</th><th className="py-3 px-6 text-left">Equipo</th><th className="py-3 px-6 text-center">Victorias</th><th className="py-3 px-6 text-center">Derrotas</th><th className="py-3 px-6 text-center">Puntos</th><th className="py-3 px-6 text-center">Coeficiente</th><th className="py-3 px-6 text-center">Categoría</th></tr></thead>
                    <tbody className="text-gray-700 text-sm font-light">
                      {getRankedTeams().map((team, index) => (
                        <motion.tr key={team.id} className="border-b border-gray-200 hover:bg-gray-50" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                          <td className="py-3 px-6 text-left whitespace-nowrap font-medium">{index + 1}</td>
                          <td className="py-3 px-6 text-left">{team.name}</td>
                          <td className="py-3 px-6 text-center">{team.wins}</td>
                          <td className="py-3 px-6 text-center">{team.losses}</td>
                          <td className="py-3 px-6 text-center font-bold">{team.points}</td>
                          <td className="py-3 px-6 text-center">{team.coefficient.toFixed(2)}</td>
                          <td className="py-3 px-6 text-center"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${team.category === 'A' ? 'bg-blue-100 text-blue-800' : team.category === 'AA' ? 'bg-purple-100 text-purple-800' : team.category === 'B' ? 'bg-green-100 text-green-800' : team.category === 'BB' ? 'bg-yellow-100 text-yellow-800' : team.category === 'C' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{team.category || 'N/A'}</span></td>
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
