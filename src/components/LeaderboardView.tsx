import { useState, useEffect } from 'react';
import { getLeaderboard, resetLeaderboard, LeaderboardEntry, getCurrentUser, syncLeaderboardWithServer } from '../utils/storage';
import { Trophy, ShieldCheck, HelpCircle, GraduationCap, Search, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import ConfirmModal from './ConfirmModal';

export default function LeaderboardView() {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedFilterSet, setSelectedFilterSet] = useState<number | "All">("All");
  
  // Custom confirm state to avoid window.confirm
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const activeUser = getCurrentUser();

  useEffect(() => {
    // Load local storage cache first
    setBoard(getLeaderboard());
    
    // Re-verify network with real database dynamically
    syncLeaderboardWithServer().then((latestBoard) => {
      if (latestBoard && Array.isArray(latestBoard)) {
        setBoard(latestBoard);
      }
    }).catch(e => console.error("Could not synch leader data:", e));
  }, []);

  const handleReset = () => {
    resetLeaderboard();
    setBoard(getLeaderboard());
  };

  const filteredBoard = board.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.school.toLowerCase().includes(search.toLowerCase());
    const matchesSet = selectedFilterSet === "All" || item.setNum === selectedFilterSet;
    return matchesSearch && matchesSet;
  });

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-xl">🏆</span>;
      case 2:
        return <span className="text-xl">🥈</span>;
      case 3:
        return <span className="text-xl">🥉</span>;
      default:
        return <span className="font-mono text-xs font-bold text-text-muted">#{rank}</span>;
    }
  };

  return (
    <div id="leaderboard-view" className="space-y-8 text-left">
      {/* Visual Header */}
      <div className="bg-dark-sidebar border border-dark-border rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gold-brand/10 border border-gold-brand/20 rounded-xl text-gold-brand">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1 w-full flex flex-col sm:flex-row justify-between items-start gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-gold-brand italic tracking-tight">
                Global Board of Leaders
              </h2>
              <p className="text-text-muted mt-1 text-xs sm:text-sm leading-relaxed font-sans">
                Real-time competitive standings for Project Limitless members! Solve sets under the the 90-minute strict exam timer inside the simulator to submit your formal results and prove your preparation level.
              </p>
            </div>
            {activeUser?.isAdmin && (
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-4 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 font-extrabold rounded-lg text-xs cursor-pointer transition-all uppercase tracking-wider block shrink-0"
              >
                Reset Scores (Admin Only)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search student or hometown/school..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-bright focus:outline-none focus:border-gold-brand/70 placeholder:text-text-muted font-sans"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
        </div>

        {/* Set filter tab index */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-text-muted whitespace-nowrap font-semibold">Filter:</span>
          {["All", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((sNum) => (
            <button
              key={sNum}
              onClick={() => setSelectedFilterSet(sNum as any)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap ${selectedFilterSet === sNum ? "bg-gold-brand text-black font-black" : "bg-dark-card border border-dark-border text-text-muted hover:text-text-bright"}`}
            >
              {sNum === "All" ? "All Papers" : `Set ${sNum}`}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Grid */}
      <div className="bg-dark-sidebar border border-dark-border rounded-2xl shadow-xl overflow-hidden">
        {filteredBoard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border text-text-muted uppercase tracking-wider text-[10px] font-bold bg-dark-card/40">
                  <th className="py-4 px-6 text-center w-20">Rank</th>
                  <th className="py-4 px-4">Student & Profile</th>
                  <th className="py-4 px-4">Origin / School</th>
                  <th className="py-4 px-4 text-center">Set Attempted</th>
                  <th className="py-4 px-4 text-center">Solve Duration</th>
                  <th className="py-4 px-6 text-right">Entrance Mark</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoard.map((item, idx) => {
                  const isCur = activeUser && activeUser.email === item.email;
                  const minutes = Math.floor(item.timeSpentSeconds / 60);
                  const seconds = item.timeSpentSeconds % 60;
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b border-dark-border/60 transition-colors ${
                        isCur 
                          ? "bg-gold-brand/10 hover:bg-gold-brand/12 border-l-4 border-l-gold-brand" 
                          : "hover:bg-dark-hover/40"
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center">
                          {getRankBadge(idx + 1)}
                        </div>
                      </td>

                      {/* Student info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-dark-card border text-sm font-bold flex items-center justify-center ${isCur ? 'border-gold-brand text-gold-brand ring-2 ring-gold-brand/10' : 'border-dark-border text-text-muted'}`}>
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className={`block text-xs sm:text-sm font-bold ${isCur ? "text-gold-brand" : "text-text-bright"}`}>
                              {item.name}
                              {isCur && <span className="ml-1.5 px-1.5 py-0.5 bg-gold-brand text-black text-[9px] font-black rounded uppercase">You</span>}
                              {(item.email === 'limitlessneverdies369@gmail.com' || item.email === 'bishowdeep@limitless.edu') && <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-550 text-[9px] font-bold rounded uppercase">Creator</span>}
                            </span>
                            <span className="text-[10px] text-text-muted font-mono">{item.date}</span>
                          </div>
                        </div>
                      </td>

                      {/* Hometown or School */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-xs text-text-bright font-sans">
                          <GraduationCap className="w-3.5 h-3.5 text-text-muted" />
                          <span>{item.school}</span>
                        </div>
                      </td>

                      {/* Set attempted */}
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 bg-dark-card border border-dark-border text-text-bright text-xs font-mono rounded font-semibold">
                          Paper Set {item.setNum}
                        </span>
                      </td>

                      {/* Solve time spent */}
                      <td className="py-4 px-4 text-center font-mono text-xs text-text-muted">
                        ⏱️ {minutes}m {seconds}s
                      </td>

                      {/* Entrance Score Percentage */}
                      <td className="py-4 px-6 text-right">
                        <div>
                          <span className={`text-base sm:text-lg font-black font-mono ${item.score >= 85 ? "text-gold-brand" : "text-text-bright"}`}>
                            {item.score}%
                          </span>
                          <span className="text-[10px] text-text-muted block font-mono">({item.correctCount}/100)</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 bg-dark-card/30 space-y-4">
            <HelpCircle className="w-12 h-12 text-text-muted mx-auto animate-pulse" />
            <h3 className="font-serif italic text-gold-brand text-lg">No Submissions Found</h3>
            <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed">
              Solve this set inside the <strong>Exam Simulator</strong> and publish your score to register first on the scoreboard!
            </p>
          </div>
        )}
      </div>

      {/* Confirm modal for clearing scores */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleReset}
        title="Reset Scoreboard Standings"
        message="Are you absolutely sure you want to reset the scoreboard standings? This action will restore the native Nepali student mock profiles and clear user attempts. This cannot be undone."
        confirmText="Reset Leaderboard"
        cancelText="Abort"
        type="danger"
      />
    </div>
  );
}
