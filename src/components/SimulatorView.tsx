import { useState, useEffect, useMemo, useRef } from 'react';
import { allQuestions } from '../data/questions';
import { Question, ExamAttempt } from '../types';
import { 
  saveExamAttempt, 
  saveMistakeLog, 
  getExamAttempts, 
  clearExamAttempts, 
  getCurrentUser, 
  saveLeaderboardEntry, 
  getLocks,
  LeaderboardEntry
} from '../utils/storage';
import { Timer, ShieldCheck, HelpCircle, ArrowLeft, ArrowRight, Flag, Star, Trophy, RotateCcw, Scroll } from 'lucide-react';
import { motion } from 'motion/react';
import ConfirmModal from './ConfirmModal';

export default function SimulatorView() {
  const [selectedSet, setSelectedSet] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [currentQIdx, setCurrentQIdx] = useState<number>(0);
  
  // Quiz selections
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [flagged, setFlagged] = useState<{ [qId: string]: boolean }>({});
  const [guessed, setGuessed] = useState<{ [qId: string]: boolean }>({});
  
  // Timer State
  const [timeRemaining, setTimeRemaining] = useState<number>(90 * 60); // 90 minutes in seconds
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(90 * 60);

  // Score report state
  const [showReport, setShowReport] = useState<boolean>(false);
  const [activeReportTab, setActiveReportTab] = useState<"summary" | "review">("summary");
  const [lastAttemptResult, setLastAttemptResult] = useState<Omit<ExamAttempt, 'id' | 'date'> & { id?: string } | null>(null);
  const [pastAttempts, setPastAttempts] = useState<ExamAttempt[]>([]);

  // Custom Modal States (to avoid window.confirm popup blocking)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState<boolean>(false);
  const [isClearHistoryConfirmOpen, setIsClearHistoryConfirmOpen] = useState<boolean>(false);
  
  // Leaderboard Locks details
  const [setLocks, setSetLocks] = useState<number[]>([]);
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  const activeUser = getCurrentUser();

  useEffect(() => {
    setPastAttempts(getExamAttempts());
    setSetLocks(getLocks());
  }, []);

  const examQuestions = useMemo(() => {
    if (selectedSet === null) return [];
    return allQuestions.filter(q => q.setNum === selectedSet);
  }, [selectedSet]);

  const currentQ: Question | undefined = examQuestions[currentQIdx];

  const unansweredCount = useMemo(() => {
    return examQuestions.length - Object.keys(answers).length;
  }, [examQuestions, answers]);

  // Timer run effect
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            // Auto submit when time hits zero!
            executeCompletedSubmission(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeRemaining]);

  const handleStartExam = (setNum: number) => {
    setSelectedSet(setNum);
    setAnswers({});
    setFlagged({});
    setGuessed({});
    setCurrentQIdx(0);
    setTimeRemaining(90 * 60); // Reset timer 90 mins
    startTimeRef.current = 90 * 60;
    setExamStarted(true);
    setTimerActive(true);
    setShowReport(false);
    setScoreSubmitted(false);
  };

  const handleSelectOption = (optionKey: string) => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionKey }));
  };

  const toggleFlag = () => {
    if (!currentQ) return;
    setFlagged(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const toggleGuess = () => {
    if (!currentQ) return;
    setGuessed(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  // Triggers when user clicks "Submit & Complete"
  const handleExamCompleted = () => {
    setIsSubmitConfirmOpen(true);
  };

  // Performs the actual score calculation, save file logs, and mistakes registry writes
  const executeCompletedSubmission = async (forced: boolean = false) => {
    setTimerActive(false);

    // Compute results
    let correctCount = 0;
    const mistakesList: string[] = [];

    examQuestions.forEach(q => {
      const pChoice = answers[q.id];
      if (pChoice === q.correct) {
        correctCount++;
      } else {
        mistakesList.push(q.id);
        // Log mistake to mistakes book dynamically sorted per student
        saveMistakeLog({
          questionId: q.id,
          setNum: q.setNum,
          qNum: q.qNum,
          questionText: q.question,
          options: q.options,
          correctAnswer: q.correct,
          selectedAnswer: pChoice || "Skipped / Unanswered",
          explanation: q.explanation,
        });
      }
    });

    const timeSpentSeconds = startTimeRef.current - timeRemaining;
    const flaggedCount = Object.keys(flagged).filter(k => flagged[k]).length;
    const guessCount = Object.keys(guessed).filter(k => guessed[k]).length;
    
    // Percent score marks
    const score = Math.round((correctCount / examQuestions.length) * 100);

    const attemptResult = {
      score,
      totalQuestions: examQuestions.length,
      timeSpentSeconds,
      flaggedCount,
      guessCount,
      correctCount,
      mistakes: mistakesList,
    };

    await saveExamAttempt(attemptResult);
    setLastAttemptResult(attemptResult);
    
    // Automatically publish to leaderboard to preserve integrity and make it instant!
    if (selectedSet !== null && activeUser) {
      await saveLeaderboardEntry({
        name: activeUser.name,
        email: activeUser.email,
        score: attemptResult.score,
        correctCount: attemptResult.correctCount,
        timeSpentSeconds: attemptResult.timeSpentSeconds,
        setNum: selectedSet,
        school: activeUser.school
      });
      setScoreSubmitted(true);
    }
    
    // Reload attempts list and locks list
    setPastAttempts(getExamAttempts());
    setSetLocks(getLocks());
    
    setShowReport(true);
    setExamStarted(false);
  };

  const formatTimer = (secondsLeft: number): string => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClearAttempts = () => {
    setIsClearHistoryConfirmOpen(true);
  };

  const handleConfirmClearAttempts = () => {
    clearExamAttempts();
    setPastAttempts([]);
  };

  const formatSpentTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const isCurrentSetLocked = selectedSet !== null && setLocks.includes(selectedSet);

  return (
    <div id="exam-simulator-section" className="space-y-8">
      
      {/* 1. SELECT EXAM MODAL / VIEW */}
      {!examStarted && !showReport && (
        <div className="space-y-8 animate-fade-in text-left">
          {/* Welcome Dashboard */}
          <div className="bg-dark-sidebar border border-dark-border text-text-bright rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="text-gold-brand font-mono text-[10px] tracking-[0.2em] uppercase font-bold block">Nepal Mahanagar MET Prep Elite</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif italic text-gold-brand tracking-tight">Mahanagar MET Exam Engine</h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Experience full-length, real-time exam simulations! The simulator follows explicit Nepal Prep syllabus criteria to gauge your real-world readiness.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3.5 text-xs">
                <div className="bg-dark-card border border-dark-border/60 p-3.5 rounded-xl">
                  <span className="block text-text-muted font-mono uppercase tracking-wider text-[9px]">Time Limit</span>
                  <span className="font-bold text-text-bright text-sm">90 Minutes</span>
                </div>
                <div className="bg-dark-card border border-dark-border/60 p-3.5 rounded-xl">
                  <span className="block text-text-muted font-mono uppercase tracking-wider text-[9px]">Questions</span>
                  <span className="font-bold text-text-bright text-sm">100 Multiple-Choice</span>
                </div>
                <div className="bg-dark-card border border-dark-border/60 p-3.5 rounded-xl col-span-2">
                  <span className="block text-text-muted font-mono uppercase tracking-wider text-[9px]">Rules</span>
                  <span className="font-bold text-gold-brand text-xs">🔒 No calculators allowed. Scoreboards lock on first files!</span>
                </div>
              </div>
            </div>
          </div>

          {/* List of 11 exam sets papers with leaderboard submitted flags */}
          <section className="space-y-4">
            <h3 className="font-serif italic text-gold-brand text-lg border-b border-dark-border pb-2">Entrance Mock Exam papers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 11 }, (_, i) => i + 1).map((sNum) => {
                const isLocked = setLocks.includes(sNum);
                return (
                  <div 
                    key={sNum}
                    className="bg-dark-sidebar border border-dark-border hover:border-gold-brand/40 transition-all rounded-2xl p-6 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-dark-card border border-dark-border text-gold-brand font-mono font-bold px-2.5 py-1 rounded">MET mock Paper #{sNum}</span>
                        {isLocked ? (
                          <span className="text-[9px] bg-red-950/20 border border-red-900/40 text-red-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Submitted</span>
                        ) : (
                          <span className="text-[9px] bg-gold-brand/10 border border-gold-brand/20 text-gold-brand font-bold px-2 py-0.5 rounded uppercase">Board Open</span>
                        )}
                      </div>
                      <h4 className="font-bold text-text-bright text-lg font-serif">Mahanagar MET Paper Set {sNum}</h4>
                      <p className="text-text-muted text-xs leading-relaxed font-sans">
                        Comprehensive test including multiple-choice questions across Mathematics, Science, General Knowledge, and Language syntax.
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartExam(sNum)}
                      className="w-full mt-6 py-2.5 bg-gold-brand hover:opacity-90 text-black font-extrabold rounded-lg text-xs tracking-wider uppercase transition-all shadow shadow-gold-brand/5 cursor-pointer"
                    >
                      Launch Exam {sNum}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Past Attempts history logs */}
          {pastAttempts.length > 0 && (
            <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-dark-border pb-3">
                <h3 className="font-serif italic text-gold-brand text-base">Your Simulator History Logs</h3>
                <button
                  type="button"
                  onClick={handleClearAttempts}
                  className="text-xs text-text-muted hover:text-red-400 cursor-pointer font-bold transition-colors"
                >
                  Clear All History
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-dark-border text-text-muted uppercase tracking-wider font-bold">
                      <th className="py-3">Date & Time</th>
                      <th className="py-3">Score</th>
                      <th className="py-3">Time Spent</th>
                      <th className="py-3">Mistakes Logged</th>
                      <th className="py-3">Flagged / Guessed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastAttempts.map((att, idx) => (
                      <tr key={idx} className="border-b border-dark-border text-text-bright">
                        <td className="py-3.5 font-medium">{att.date}</td>
                        <td className="py-3.5">
                          <span className={`font-black font-mono text-sm ${att.score >= 60 ? "text-gold-brand" : "text-text-bright"}`}>
                            {att.score}%
                          </span> 
                          <span className="text-[10px] text-text-muted ml-1.5">({att.correctCount}/100)</span>
                        </td>
                        <td className="py-3.5 font-mono text-text-muted">{formatSpentTime(att.timeSpentSeconds)}</td>
                        <td className="py-3.5">
                          <span className="bg-red-950/20 text-red-400 px-2 py-0.5 rounded-full border border-red-900/40 text-[10px] font-bold">
                            {att.mistakes.length} errors
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-text-muted">
                          🚩 {att.flaggedCount} | ⭐️ {att.guessCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
 
      {/* 2. ACTIVE EXAM RUNNING INTERFACE */}
      {examStarted && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in text-left">
          
          {/* Active Left Sidebar: Grid Map representing 1-100 Questions & Live Clock Timer */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Sticky Progress Bar Timer and Submit Block */}
            <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-xs font-bold uppercase tracking-widest">Time Remaining</span>
                <span className={`font-mono text-xl font-bold flex items-center gap-1.5 ${timeRemaining < 10 * 60 ? "text-red-500 animate-pulse border-red-900" : "text-gold-brand"}`}>
                  <Timer className="w-5 h-5 text-gold-brand" />
                  {formatTimer(timeRemaining)}
                </span>
              </div>
              <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden border border-dark-border/40">
                <div 
                  className={`h-full transition-all duration-1000 ${timeRemaining < 10 * 60 ? "bg-red-600" : "bg-gold-brand"}`} 
                  style={{ width: `${(timeRemaining / (90 * 60)) * 100}%` }}
                ></div>
              </div>

              <div className="pt-3 border-t border-dark-border/50 flex items-center justify-between text-xs text-text-muted font-sans">
                <span>Completed Questions:</span>
                <span className="font-extrabold text-text-bright font-mono">{Object.keys(answers).length} / 100</span>
              </div>

              <button
                onClick={handleExamCompleted}
                className="w-full py-3 bg-red-950/40 hover:bg-red-950/60 border border-red-900/50 text-red-400 font-extrabold rounded-lg text-xs shadow-md cursor-pointer transition-all uppercase tracking-wider"
              >
                Finish & Submit Exam
              </button>
            </div>

            {/* Grid Map containing Question Buttons 1-100 */}
            <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-text-bright text-xs uppercase tracking-wider pb-1 border-b border-dark-border">Questions Tracker Grid</h3>
              
              <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-10 lg:grid-cols-5 gap-1.5 max-h-60 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-dark-border">
                {examQuestions.map((q, idx) => {
                  const hasAnswered = !!answers[q.id];
                  const isFlagged = !!flagged[q.id];
                  const isCurrent = currentQIdx === idx;

                  let btnClass = "bg-dark-card hover:bg-dark-hover text-text-bright border border-dark-border";

                  if (isCurrent) {
                    btnClass = "bg-gold-brand text-black border border-gold-brand font-black font-mono z-10 shadow";
                  } else if (hasAnswered) {
                    btnClass = "bg-dark-hover border-gold-brand/40 text-gold-brand font-bold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIdx(idx)}
                      className={`py-1.5 text-xs font-mono rounded cursor-pointer transition-all flex items-center justify-center relative ${btnClass}`}
                    >
                      {q.qNum}
                      {isFlagged && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 text-[10px] text-text-muted justify-center border-t border-dark-border/40 pt-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-dark-hover border border-gold-brand/40 block"></span> 
                  Answered
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 block"></span> 
                  Flagged
                </span>
              </div>
            </div>

          </div>

          {/* Active Right Main Panel: Display Active Question without solution check */}
          <div className="lg:col-span-8 bg-dark-sidebar border border-dark-border rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dark-border pb-4 text-left">
              <span className="px-2.5 py-1 bg-dark-card border border-dark-border text-gold-brand font-mono text-[11px] font-bold rounded">
                SET {selectedSet} • QUESTION {currentQ.qNum} OF 100
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${flagged[currentQ.id] ? "bg-amber-500/10 border-amber-500/40 text-amber-550" : "bg-dark-card border-dark-border text-text-muted hover:border-amber-500/40"}`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {flagged[currentQ.id] ? "Flagged for Review" : "Flag Question"}
                </button>

                <button
                  onClick={toggleGuess}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${guessed[currentQ.id] ? "bg-purple-950/20 border-purple-800/40 text-purple-400" : "bg-dark-card border-dark-border text-text-muted hover:border-purple-800/40"}`}
                >
                  <Star className="w-3.5 h-3.5" />
                  {guessed[currentQ.id] ? "Marked Guess" : "Guess"}
                </button>
              </div>
            </div>

            {/* Realistic Question Text Box */}
            <div className="bg-dark-card p-6 md:p-8 rounded-2xl border border-dark-border">
              <p className="text-text-bright font-medium text-base leading-relaxed select-text font-serif">
                {currentQ.question}
              </p>
            </div>

            {/* Options Selection */}
            <div className="space-y-3 pt-2">
              {Object.entries(currentQ.options).map(([key, value]) => {
                const isSelected = answers[currentQ.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectOption(key)}
                    className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm pl-5 cursor-pointer transition-all flex items-center justify-between gap-4 ${isSelected ? "border-gold-brand bg-gold-brand/10 text-gold-brand font-semibold ring-2 ring-gold-brand/10" : "border-dark-border bg-dark-card text-text-bright hover:border-gold-brand"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono bg-dark-bg border border-dark-border text-gold-brand px-2.5 py-1 rounded text-xs select-none font-bold">
                        {key}
                      </span>
                      <span>{value}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-dark-border">
              <span className="text-text-muted text-xs">
                Answers logged: <span className="font-bold text-text-bright font-mono">{Object.keys(answers).length}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => currentQIdx > 0 && setCurrentQIdx(currentQIdx - 1)}
                  disabled={currentQIdx === 0}
                  className="p-2.5 bg-dark-card border border-dark-border hover:border-gold-brand rounded-lg text-text-bright disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-text-muted font-mono px-1">
                  {currentQIdx + 1} / 100
                </span>
                <button
                  onClick={() => currentQIdx < 99 && setCurrentQIdx(currentQIdx + 1)}
                  disabled={currentQIdx === 99}
                  className="p-2.5 bg-dark-card border border-dark-border hover:border-gold-brand rounded-lg text-text-bright disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. SIMULATOR COMPLETED SCORE ANALYTICS BOARD REPORT */}
      {showReport && lastAttemptResult && (
        <div className="space-y-8 animate-fade-in text-left">
          
          <div className="bg-dark-sidebar border border-dark-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dark-border pb-5">
              <div>
                <h3 className="text-2xl font-bold font-serif italic text-gold-brand flex items-center gap-2.5">
                  <Trophy className="w-7 h-7 text-gold-brand" />
                  Mahanagar MET Simulator Report Card
                </h3>
                <p className="text-text-muted text-xs mt-1">Excellent performance analysis. Read your mistake details below!</p>
              </div>

              {/* Back to Home Button */}
              <button
                onClick={() => setShowReport(false)}
                className="px-5 py-2.5 bg-dark-card hover:bg-dark-hover border border-dark-border text-text-bright rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Return to Simulator Dashboard
              </button>
            </div>

            {/* Score Grid & Circular Percent Gauge */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Circular percentage gauge & Leaderboard submit button */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 border-r border-dark-border/50 text-center space-y-5">
                <div className="relative w-36 h-36 flex items-center justify-center mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="72" cy="72" r="64" fill="transparent" stroke="#1A1A1F" strokeWidth="12" />
                    <circle 
                      cx="72" 
                      cy="72" 
                      r="64" 
                      fill="transparent" 
                      stroke="#D4AF37" 
                      strokeWidth="12" 
                      strokeDasharray={402}
                      strokeDashoffset={402 - (402 * lastAttemptResult.score) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute text-center space-y-0.5">
                    <span className="block text-3xl font-black text-gold-brand font-mono">{lastAttemptResult.score}%</span>
                    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Marks</span>
                  </div>
                </div>

                <div className="text-center">
                  <span className={`text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${lastAttemptResult.score >= 50 ? "bg-dark-card text-gold-brand border-gold-brand/40" : "bg-red-950/20 text-red-400 border border-red-900/40"}`}>
                    {lastAttemptResult.score >= 60 ? "Admitted! (Scholarship Qualified)" : lastAttemptResult.score >= 40 ? "Borderline Safe Pass" : "Needs Revision!"}
                  </span>
                </div>

                {/* Score Locked Submission element */}
                <div className="pt-3 w-full border-t border-dark-border/50">
                  <div className="bg-dark-card border border-gold-brand/20 p-3 rounded-xl text-center">
                    <span className="text-gold-brand font-black text-[10px] uppercase font-mono block">🏆 SCORE AUTO-FILED ON BOARD</span>
                    <p className="text-[10px] text-text-muted mt-1 leading-snug font-sans">
                      This session's standing has been automatically logged on the Global Scoreboard. Set attempts lock indefinitely to maintain competitive integrity!
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Columns */}
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-dark-card p-4 rounded-xl border border-dark-border">
                  <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider block">Correct Answers</span>
                  <span className="text-xl sm:text-2xl font-black text-gold-brand font-mono block mt-1">{lastAttemptResult.correctCount} / 100</span>
                </div>
                <div className="bg-dark-card p-4 rounded-xl border border-dark-border">
                  <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider block">Time Spent</span>
                  <span className="text-xl sm:text-2xl font-black text-text-bright font-mono block mt-1">{formatSpentTime(lastAttemptResult.timeSpentSeconds)}</span>
                </div>
                <div className="bg-dark-card p-4 rounded-xl border border-dark-border">
                  <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider block">Average Speed Per Q</span>
                  <span className="text-xl sm:text-2xl font-black text-text-bright font-mono block mt-1">
                    {Math.round(lastAttemptResult.timeSpentSeconds / 100)} seconds
                  </span>
                </div>
                <div className="bg-dark-card p-4 rounded-xl border border-dark-border">
                  <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider block">Incorrect Answers</span>
                  <span className="text-xl sm:text-2xl font-black text-red-400 font-mono block mt-1">{lastAttemptResult.mistakes.length} errors</span>
                </div>
                <div className="bg-dark-card p-4 rounded-xl border border-dark-border">
                  <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider block">Reviewed/Flagged</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-500 font-mono block mt-1">
                    🚩 {lastAttemptResult.flaggedCount}
                  </span>
                </div>
                <div className="bg-dark-card p-4 rounded-xl border border-dark-border">
                  <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider block">Estimated Guesses</span>
                  <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono block mt-1">
                    ⭐️ {lastAttemptResult.guessCount} choices
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Quick Tabs to toggle Summary vs Question-by-Question review */}
          <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl">
            <div className="flex border-b border-dark-border pb-3.5 mb-6">
              <button
                onClick={() => setActiveReportTab("summary")}
                className={`px-4.5 py-2.5 text-xs font-bold rounded-lg cursor-pointer transition-all border ${activeReportTab === "summary" ? "bg-gold-brand border-gold-brand text-black animate-none" : "bg-transparent text-text-muted border-transparent hover:text-text-bright"}`}
              >
                Mock Summary Notes
              </button>
              <button
                onClick={() => setActiveReportTab("review")}
                className={`ml-2 px-4.5 py-2.5 text-xs font-bold rounded-lg cursor-pointer transition-all border ${activeReportTab === "review" ? "bg-gold-brand border-gold-brand text-black animate-none" : "bg-transparent text-text-muted border-transparent hover:text-text-bright"}`}
              >
                Question-by-Question Active Review
              </button>
            </div>

            {activeReportTab === "summary" ? (
              <div className="space-y-4 font-sans text-text-bright/90 text-sm">
                <h4 className="font-serif italic text-gold-brand text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold-brand" />
                  Your Fast-Track Admission Roadmap
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Every incorrect answer has been logged in your <strong>"My Mistakes Book"</strong>! Access the Mistakes Book to re-quiz only on your incorrect answers. This is the single layout system shown to improve performance by 15-20% before the entrance exam block.
                </p>
                <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-3">
                  <div className="text-xs font-bold text-gold-brand uppercase tracking-wider flex items-center gap-1.5">
                    <Scroll className="w-4 h-4 text-gold-brand" /> Let's check:
                  </div>
                  <ul className="text-xs list-disc list-inside text-text-muted space-y-1.5 pl-1.5">
                    <li>How did you do on Nepali & GK? (Requires simple quick retention)</li>
                    <li>Did you do calculations by hand? (Try verifying decimals shift rules on our calculator)</li>
                    <li>Always pay attention to Science (especially heart blood vessels, pH scales, and resistor series combinations).</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h4 className="font-serif italic text-gold-brand text-base">Full Paper Review & Explanations:</h4>
                <div className="space-y-6">
                  {examQuestions.map((q, idx) => {
                    const uAns = answers[q.id];
                    const isCorrect = uAns === q.correct;
                    return (
                      <div 
                        key={idx}
                        className={`p-6 rounded-2xl border ${isCorrect ? "bg-gold-brand/5 border-gold-brand/10" : "bg-red-950/10 border-red-900/20"} space-y-3.5 text-left`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-dark-bg border border-dark-border px-2.5 py-1 rounded text-gold-brand font-bold">
                            Q.{q.qNum}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${isCorrect ? "bg-gold-brand/10 text-gold-brand border-gold-brand/20" : "bg-red-950/20 text-red-500 border-red-900/30"}`}>
                            {isCorrect ? "Correct answer" : "Incorrect / Skipped"}
                          </span>
                        </div>

                        <p className="font-medium text-text-bright text-base select-text font-serif">{q.question}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pl-1">
                          {Object.entries(q.options).map(([key, rawText]) => (
                            <div 
                              key={key} 
                              className={`p-3 rounded border text-left flex items-center gap-2 ${q.correct === key ? "bg-gold-brand/10 border-gold-brand/35 text-gold-brand font-bold" : uAns === key ? "bg-red-950/20 border-red-900/30 text-red-400" : "border-transparent text-text-muted"}`}
                            >
                              <span className="font-bold font-mono text-gold-brand">{key})</span> 
                              <span>{rawText}</span>
                            </div>
                          ))}
                        </div>

                        <div className="bg-dark-card p-5 rounded-xl space-y-1.5 text-xs border border-dark-border">
                          <p className="font-bold text-gold-brand">Quick Answer Key: {q.correct}</p>
                          <p className="text-text-muted leading-relaxed font-sans pt-1">
                            <strong className="text-gold-brand font-serif italic">Explanation: </strong> {q.explanation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* OVERLAY CONFIRM MODALS REPLACE THE WINDOW.CONFIRMS */}
      {/* Submit Exam Modal */}
      <ConfirmModal
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        onConfirm={() => executeCompletedSubmission(false)}
        title="Submit Simulator Session Paper"
        message={
          unansweredCount > 0 
            ? `Warning: You have ${unansweredCount} unanswered questions remaining in this mock set! Are you sure you are ready to transmit and lock in your score result?`
            : "Are you sure you want to finish, transmit and compile this 100-question Mahanagar MET mock entrance session?"
        }
        confirmText="Confirm Submit"
        cancelText="Keep Answering"
        type={unansweredCount > 0 ? "warning" : "info"}
      />

      {/* Clear History Modal */}
      <ConfirmModal
        isOpen={isClearHistoryConfirmOpen}
        onClose={() => setIsClearHistoryConfirmOpen(false)}
        onConfirm={handleConfirmClearAttempts}
        title="Clear Simulator Historical Attempts"
        message="Are you sure you want to completely sweep clean your stored simulation history card? Your mistake book remains safe."
        confirmText="Purge History"
        cancelText="Abort"
        type="danger"
      />

    </div>
  );
}
