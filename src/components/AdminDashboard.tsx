import { useState, useEffect, FormEvent } from 'react';
import { getLeaderboard, adminRemoveLeaderboardEntry, adminAddLeaderboardEntry, resetLeaderboard } from '../utils/storage';
import { allQuestions } from '../data/questions';
import { Shield, Users, BadgeAlert, Trash2, Library, PlusCircle, Sparkles, Filter, CheckCircle } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function AdminDashboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedSet, setSelectedSet] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Simulated stats
  const totalQuestionsList = allQuestions;
  
  // New Competitor state
  const [newCompName, setNewCompName] = useState<string>("");
  const [newCompSchool, setNewCompSchool] = useState<string>("");
  const [newCompScore, setNewCompScore] = useState<number>(85);
  const [newCompSet, setNewCompSet] = useState<number>(1);
  const [newCompTime, setNewCompTime] = useState<number>(3200);

  // States for Confirm Modals
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);

  const [isAddSuccessOpen, setIsAddSuccessOpen] = useState(false);

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  const handleDeleteScoreClick = (id: string) => {
    setActiveDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (activeDeleteId) {
      adminRemoveLeaderboardEntry(activeDeleteId);
      setLeaderboard(getLeaderboard());
      setActiveDeleteId(null);
    }
  };

  const handleCreateCompetitor = (e: FormEvent) => {
    e.preventDefault();
    if (!newCompName || !newCompSchool) {
      alert("Please fill in competitor credentials");
      return;
    }
    const fakeComp = {
      id: 'leader-fake-' + Math.random().toString(36).substr(2, 9),
      name: newCompName,
      email: newCompName.toLowerCase().replace(/\s+/g, '') + '@gmail.com',
      score: Number(newCompScore),
      correctCount: Number(newCompScore),
      timeSpentSeconds: Number(newCompTime),
      setNum: Number(newCompSet),
      school: newCompSchool,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    adminAddLeaderboardEntry(fakeComp);
    setLeaderboard(getLeaderboard());
    
    // Clear inputs
    setNewCompName("");
    setNewCompSchool("");
    
    setIsAddSuccessOpen(true);
  };

  // Filter questions for browsing
  const questionsFilter = totalQuestionsList.filter(q => {
    const sMatches = q.setNum === selectedSet;
    const qMatches = searchQuery === "" || 
                     q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return sMatches && qMatches;
  });

  return (
    <div id="admin-dashboard-container" className="space-y-8 text-left">
      
      {/* Intro Welcome Widget */}
      <div className="bg-dark-sidebar border border-gold-brand/35 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gold-brand/10 border border-gold-brand/20 rounded-xl text-gold-brand shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-gold-brand font-mono text-[10px] tracking-[0.22em] uppercase font-bold block">Developer Credentials Verified</span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif italic text-gold-brand tracking-tight">
                Welcome, Commander BISHOWDEEP!
              </h2>
              <p className="text-text-muted mt-1 text-xs leading-relaxed font-sans max-w-xl">
                You are currently in the <strong>Project Limitless Portal Manager Controls</strong>. Audit the index of the 1,100 questions, moderate scoreboard logs, and simulate competitors across Mahanagar MET mocks.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono bg-dark-card border border-dark-border px-4 py-3 rounded-2xl">
            <span className="text-gold-brand font-bold">• Active Session:</span> Admin Role
          </div>
        </div>
      </div>

      {/* Stats Counter Bar Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-sidebar border border-dark-border p-5 rounded-2xl flex items-center gap-4 shadow-xl">
          <Library className="w-10 h-10 text-gold-brand shrink-0" />
          <div>
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider block">Total Dataset</span>
            <span className="text-xl sm:text-2xl font-black text-text-bright font-mono">1,100 Qs</span>
          </div>
        </div>

        <div className="bg-dark-sidebar border border-dark-border p-5 rounded-2xl flex items-center gap-4 shadow-xl">
          <PlusCircle className="w-10 h-10 text-gold-brand shrink-0" />
          <div>
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider block">Exam Mocks</span>
            <span className="text-xl sm:text-2xl font-black text-text-bright font-mono">11 Sets</span>
          </div>
        </div>

        <div className="bg-dark-sidebar border border-dark-border p-5 rounded-2xl flex items-center gap-4 shadow-xl">
          <Users className="w-10 h-10 text-gold-brand shrink-0" />
          <div>
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider block">Board Standing</span>
            <span className="text-xl sm:text-2xl font-black text-text-bright font-mono">{leaderboard.length} Entries</span>
          </div>
        </div>

        <div className="bg-dark-sidebar border border-dark-border p-5 rounded-2xl flex items-center gap-4 shadow-xl">
          <BadgeAlert className="w-10 h-10 text-red-400 shrink-0" />
          <div>
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider block">Admin Access</span>
            <span className="text-xl sm:text-2xl font-black text-red-400 font-mono">Bishowdeep</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Mock Competitor simulator & Score moderator */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Form: Inject simulated competitor score to build student benchmarks */}
          <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif italic text-gold-brand text-base flex items-center gap-2 border-b border-dark-border pb-3">
              <Sparkles className="w-4 h-4 text-gold-brand animate-spin" />
              Publish Simulated Student Competitor
            </h3>
            <p className="text-text-muted text-xs leading-relaxed font-sans pb-1">
              Inject highly realistic student profiles from colleges and schools across Nepal. This builds high competition benchmarks so your portal users strive harder.
            </p>

            <form onSubmit={handleCreateCompetitor} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-muted font-bold mb-1 uppercase tracking-wider text-[10px]">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Niranjan Basnet"
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border pl-3 pr-3 py-2.5 rounded-lg text-text-bright focus:outline-none focus:border-gold-brand/80 placeholder:text-text-muted font-sans text-xs"
                  />
                </div>
                <div>
                  <label className="block text-text-muted font-bold mb-1 uppercase tracking-wider text-[10px]">School / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Budhanilkantha School"
                    value={newCompSchool}
                    onChange={(e) => setNewCompSchool(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border pl-3 pr-3 py-2.5 rounded-lg text-text-bright focus:outline-none focus:border-gold-brand/80 placeholder:text-text-muted font-sans text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-text-muted font-bold mb-1 uppercase tracking-wider text-[10px]">Entrance Mark (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newCompScore}
                    onChange={(e) => setNewCompScore(Number(e.target.value))}
                    className="w-full bg-dark-card border border-dark-border pl-3 pr-3 py-2 rounded-lg text-text-bright focus:outline-none focus:border-gold-brand/80 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-text-muted font-bold mb-1 uppercase tracking-wider text-[10px]">For Set Paper</label>
                  <select
                    value={newCompSet}
                    onChange={(e) => setNewCompSet(Number(e.target.value))}
                    className="w-full bg-dark-card border border-dark-border pl-3 pr-3 py-2 rounded-lg text-text-bright focus:outline-none focus:border-gold-brand/80 font-semibold cursor-pointer text-xs h-[34px]"
                  >
                    {Array.from({ length: 11 }, (_, i) => i + 1).map((sNum) => (
                      <option key={sNum} value={sNum}>Set {sNum}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text-muted font-bold mb-1 uppercase tracking-wider text-[10px]">Duration (secs)</label>
                  <input
                    type="number"
                    min="100"
                    max="5400"
                    required
                    value={newCompTime}
                    onChange={(e) => setNewCompTime(Number(e.target.value))}
                    className="w-full bg-dark-card border border-dark-border pl-3 pr-3 py-2 rounded-lg text-text-bright focus:outline-none focus:border-gold-brand/80 font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gold-brand hover:opacity-90 text-black font-black font-sans uppercase text-xs rounded-lg transition-all cursor-pointer shadow shadow-gold-brand/10"
              >
                Publish Score to Board
              </button>
            </form>
          </div>

          {/* Moderate Score Board entries */}
          <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif italic text-gold-brand text-base border-b border-dark-border pb-3">
              Moderate Score Board Standings
            </h3>
            <p className="text-text-muted text-xs font-sans pb-1 leading-relaxed">
              Delete suspicious submissions or custom entries instantly using the garbage control buttons.
            </p>
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
              {leaderboard.map((item) => (
                <div 
                  key={item.id}
                  className="bg-dark-card border border-dark-border/80 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="block font-bold text-text-bright">
                      {item.name} 
                      <span className="text-[10px] text-gold-brand font-black ml-1 font-mono">({item.score}%)</span>
                    </span>
                    <span className="block text-[10px] text-text-muted leading-none">Paper Set {item.setNum} • {item.school}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteScoreClick(item.id)}
                    className="p-1.5 hover:bg-red-950/20 text-text-muted hover:text-red-400 border border-transparent hover:border-dark-border rounded-lg cursor-pointer transition-all shrink-0"
                    title="Delete registration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Question Syllabus browser finder */}
        <div className="lg:col-span-6 bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-3.5">
            <h3 className="font-serif italic text-gold-brand text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-gold-brand" />
              1,100 Questions Database Browser
            </h3>
            
            {/* Set selection mapping dropdown */}
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(Number(e.target.value))}
              className="bg-dark-card border border-dark-border rounded-lg px-3 py-1.5 text-xs text-gold-brand font-bold focus:outline-none focus:border-gold-brand cursor-pointer outline-none font-mono"
            >
              {Array.from({ length: 11 }, (_, i) => i + 1).map((sNum) => (
                <option key={sNum} value={sNum}>Set paper {sNum}</option>
              ))}
            </select>
          </div>

          <p className="text-text-muted text-xs leading-relaxed font-sans">
            Quickly lookup any test syllabus items, verify correct answers, or inspect logic explanations.
          </p>

          <input
            type="text"
            placeholder="Search matching questions in Set..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-xs text-text-bright focus:outline-none focus:border-gold-brand placeholder:text-text-muted"
          />

          {/* Table display */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
            {questionsFilter.slice(0, 30).map((q) => (
              <div 
                key={q.id}
                className="bg-dark-card border border-dark-border/80 p-4 rounded-xl space-y-3 font-sans text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-dark-bg text-gold-brand font-mono font-bold border border-dark-border rounded text-[10px]">
                    Set {q.setNum} • Q.{q.qNum}
                  </span>
                  <span className="text-[10px] text-text-muted font-bold font-mono">ID: {q.id}</span>
                </div>
                
                <p className="text-text-bright font-medium text-xs leading-relaxed">{q.question}</p>
                
                <div className="text-[10px] text-text-muted space-y-1">
                  <div>✓ Correct Code: <strong className="text-gold-brand font-mono">{q.correct}</strong> - {q.options[q.correct]}</div>
                  <div className="pt-2 border-t border-dark-border/40 mt-1 block">
                    <strong className="text-text-bright font-serif italic font-semibold">Explanation:</strong> {q.explanation}
                  </div>
                </div>
              </div>
            ))}
            {questionsFilter.length > 30 && (
              <p className="text-center font-mono text-[10px] text-text-muted pt-2 animate-bounce">
                And {questionsFilter.length - 30} more matched records...
              </p>
            )}
            {questionsFilter.length === 0 && (
              <p className="text-center text-text-muted text-xs py-10">No questions found matching your filter criteria.</p>
            )}
          </div>
        </div>

      </div>

      {/* MODALS */}
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Board Submission deletion"
        message="Are you sure you want to delete this candidate standings record from the global database scoreboard? This action is immediate."
        confirmText="Confirm Delete"
        cancelText="Abort"
        type="danger"
      />

      {/* Success Notification Modal */}
      <ConfirmModal
        isOpen={isAddSuccessOpen}
        onClose={() => setIsAddSuccessOpen(false)}
        onConfirm={() => {}}
        title="Standing Published Successfully"
        message="The simulated student candidate record has been successfully written into the dynamic global database. Standard rankings updated accordingly."
        confirmText="Acknowledged"
        cancelText="Dismiss"
        type="info"
      />

    </div>
  );
}
