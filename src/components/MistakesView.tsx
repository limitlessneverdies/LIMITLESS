import { useState, useEffect } from 'react';
import { MistakeLog } from '../types';
import { getMistakeLogs, removeMistakeLog, clearAllMistakes } from '../utils/storage';
import { Trash2, ShieldAlert, Play, CheckCircle2, ChevronRight, XCircle, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from './ConfirmModal';

export default function MistakesView() {
  const [mistakes, setMistakes] = useState<MistakeLog[]>([]);
  
  // Revision study modes
  const [revisionQuizMode, setRevisionQuizMode] = useState<boolean>(false);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Custom Modal States (to avoid window.confirm and alert)
  const [isWipeConfirmOpen, setIsWipeConfirmOpen] = useState<boolean>(false);
  const [alertInfo, setAlertInfo] = useState<{ isOpen: boolean; title: string; message: string } | null>(null);

  useEffect(() => {
    setMistakes(getMistakeLogs());
  }, []);

  const loadMistakes = () => {
    const list = getMistakeLogs();
    setMistakes(list);
    // Adjust quiz index if the current list shrinks while quizing
    if (quizIdx >= list.length && list.length > 0) {
      setQuizIdx(list.length - 1);
    }
  };

  const handleRemoveLog = (id: string) => {
    removeMistakeLog(id);
    loadMistakes();
  };

  const handleClearAllConfirm = () => {
    clearAllMistakes();
    setMistakes([]);
    setRevisionQuizMode(false);
  };

  const startRevisionQuiz = () => {
    setQuizIdx(0);
    setSelectedAns(null);
    setShowExplanation(false);
    setRevisionQuizMode(true);
  };

  const handleQuizSelection = (choice: string) => {
    if (selectedAns) return; // Answer locked
    setSelectedAns(choice);
    setShowExplanation(true);
  };

  const handleNextQuiz = () => {
    if (quizIdx < mistakes.length - 1) {
      setQuizIdx(quizIdx + 1);
      setSelectedAns(null);
      setShowExplanation(false);
    } else {
      setAlertInfo({
        isOpen: true,
        title: "Session Completed!",
        message: "Outstanding work! You have answered all registered mistakes in your revision quiz pool."
      });
      setRevisionQuizMode(false);
    }
  };

  const handleSolveAndRemove = () => {
    if (!mistakes[quizIdx]) return;
    const currentId = mistakes[quizIdx].id;
    removeMistakeLog(currentId);
    
    // Refresh lists
    const updated = mistakes.filter(m => m.id !== currentId);
    setMistakes(updated);

    setSelectedAns(null);
    setShowExplanation(false);

    if (updated.length === 0) {
      setAlertInfo({
        isOpen: true,
        title: "Zero Mistakes Remaining!",
        message: "Incredible feat! Your mistake revision database is now completely clean & mastered."
      });
      setRevisionQuizMode(false);
    } else if (quizIdx >= updated.length) {
      setQuizIdx(updated.length - 1);
    }
  };

  return (
    <div id="mistakes-view-container" className="space-y-6">
      
      {/* Upper Dashboard Widget */}
      <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4 text-left">
            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-red-500 shrink-0">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-gold-brand italic font-medium">
                Your Mistakes Registry
              </h2>
              <p className="text-text-muted mt-1 text-xs sm:text-sm leading-relaxed font-sans">
                Whenever you fail a question in practice sessions or full simulations, it saves here automatically. Re-quiz on error logs to eliminate mistakes and master tricky patterns!
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {mistakes.length > 0 && !revisionQuizMode && (
              <button
                onClick={startRevisionQuiz}
                className="px-5 py-3 bg-gold-brand hover:bg-gold-brand/90 text-black font-extrabold rounded-lg text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-gold-brand/10 uppercase tracking-wider"
              >
                <Play className="w-4 h-4 fill-current animate-pulse" />
                Start Revision
              </button>
            )}
            {mistakes.length > 0 && (
              <button
                onClick={() => setIsWipeConfirmOpen(true)}
                className="px-4 py-3 bg-dark-card hover:bg-dark-hover border border-dark-border text-text-bright font-semibold rounded-lg text-xs sm:text-sm transition-all cursor-pointer"
              >
                Clear Mistakes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NO MISTAKES LOGGED FALLBACK STATE */}
      {mistakes.length === 0 && (
        <div className="text-center py-20 bg-dark-sidebar border border-dark-border rounded-2xl p-8 space-y-4 shadow-xl">
          <span className="w-14 h-14 bg-gold-brand/10 border border-gold-brand/20 rounded-full flex items-center justify-center mx-auto text-gold-brand">
            <CheckCircle2 className="w-8 h-8 font-bold" />
          </span>
          <h3 className="font-serif italic font-medium text-gold-brand text-lg">Your Mistakes Book is Clean!</h3>
          <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed font-sans">
            Outstanding! You have no saved errors right now. Launch the <strong>"Exam Simulator"</strong> or try <strong>"Practice Sets"</strong> to gauge your readiness. Any slip-up will appear here.
          </p>
        </div>
      )}

      {/* REVISION ACTIVE QUIZZING MAIN SCREEN */}
      {revisionQuizMode && mistakes[quizIdx] && (
        <div className="bg-dark-sidebar border border-dark-border rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dark-border pb-4 text-left">
            <div className="space-y-1">
              <span className="px-2.5 py-1 bg-red-950/20 border border-red-900/40 text-red-500 font-mono text-[10px] font-bold rounded uppercase tracking-wider">
                Mistake Revision • Question {quizIdx + 1} of {mistakes.length}
              </span>
              <p className="text-[10px] text-text-muted font-mono mt-1">Origin: Set {mistakes[quizIdx].setNum} • Q.{mistakes[quizIdx].qNum}</p>
            </div>

            <button
              onClick={() => setRevisionQuizMode(false)}
              className="text-xs text-text-muted hover:text-text-bright cursor-pointer font-bold flex items-center gap-1.5 transition-colors"
            >
              Exit Revision
            </button>
          </div>

          <div className="bg-dark-card p-6 md:p-8 rounded-2xl border border-dark-border text-left">
            <p className="text-text-bright font-medium text-base md:text-lg leading-relaxed font-serif">
              {mistakes[quizIdx].questionText}
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(mistakes[quizIdx].options).map(([key, value]) => {
              const uChoice = selectedAns;
              const isSelected = uChoice === key;
              const showCorrect = showExplanation && mistakes[quizIdx].correctAnswer === key;
              const showWrong = showExplanation && isSelected && mistakes[quizIdx].correctAnswer !== key;

              let btnStyle = "border-dark-border bg-dark-card text-text-bright hover:border-gold-brand hover:bg-dark-hover";
              let statusIcon = null;

              if (showCorrect) {
                btnStyle = "border-gold-brand bg-gold-brand/10 text-gold-brand ring-2 ring-gold-brand/20 font-semibold";
                statusIcon = <CheckCircle2 className="w-5 h-5 text-gold-brand shrink-0" />;
              } else if (showWrong) {
                btnStyle = "border-red-650 bg-red-950/20 text-red-405 ring-2 ring-red-600/20";
                statusIcon = <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
              } else if (isSelected) {
                btnStyle = "border-gold-brand bg-dark-hover text-text-bright";
              }

              return (
                <button
                  key={key}
                  disabled={!!uChoice}
                  onClick={() => handleQuizSelection(key)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm pl-7 cursor-pointer transition-all flex items-center justify-between gap-4 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono bg-dark-bg border border-dark-border px-2.5 py-1 text-gold-brand rounded text-xs font-black">
                      {key}
                    </span>
                    <span>{value}</span>
                  </div>
                  {statusIcon}
                </button>
              );
            })}
          </div>

          {/* Solution display box with solver button */}
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-dark-card border-l-4 border-gold-brand p-6 rounded-r-xl space-y-4 text-left border border-dark-border"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-dark-border">
                <div>
                  <p className="font-serif italic text-xs uppercase tracking-wider text-gold-brand">Correct Option: {mistakes[quizIdx].correctAnswer}</p>
                  <p className="text-xs font-mono text-text-bright font-semibold mt-1 bg-dark-bg px-2 py-1 rounded max-w-max border border-dark-border">{mistakes[quizIdx].options[mistakes[quizIdx].correctAnswer]}</p>
                </div>
                
                {/* Delete when solved logic */}
                <button
                  onClick={handleSolveAndRemove}
                  className="px-4 py-2 bg-gold-brand hover:opacity-90 text-black font-extrabold text-xs rounded-lg transition-all cursor-pointer shadow-md shadow-gold-brand/10 uppercase tracking-wider shrink-0"
                  title="Remove this mistake since you answered it correctly!"
                >
                  Solved! Remove from Book
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Step-by-Step Explanation:</p>
                <p className="text-sm leading-relaxed text-text-bright/90 font-sans">{mistakes[quizIdx].explanation}</p>
              </div>
            </motion.div>
          )}

          {/* Navigation panel */}
          <div className="flex justify-between items-center pt-4 border-t border-dark-border">
            <span className="text-xs text-text-muted font-mono">
              Revision Progress: <span className="font-bold text-text-bright">{quizIdx + 1}</span> / {mistakes.length}
            </span>

            <button
              onClick={handleNextQuiz}
              disabled={!selectedAns}
              className="px-5 py-2.5 bg-dark-card border border-dark-border hover:border-gold-brand text-text-bright font-semibold text-xs rounded-lg disabled:opacity-30 cursor-pointer transition-all flex items-center gap-1.5"
            >
              Next Question
              <ChevronRight className="w-4 h-4 text-gold-brand" />
            </button>
          </div>

        </div>
      )}

      {/* STATIC INSTANCE LIST FOR THE LOGGED ERRORS LIST (WHEN NOT IN QUIZZING) */}
      {!revisionQuizMode && mistakes.length > 0 && (
        <div id="mistakes-rendered-list" className="space-y-4 text-left">
          <h3 className="font-serif text-gold-brand italic font-medium text-base tracking-wide border-b border-dark-border pb-2.5">Saved Mistakes Logs ({mistakes.length})</h3>
          <div className="space-y-4">
            {mistakes.map((log) => (
              <div 
                key={log.id} 
                className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-red-950/20 border border-red-900/40 text-red-500 font-mono text-[10px] font-bold rounded">
                      Set {log.setNum} • Q.{log.qNum}
                    </span>
                    <button
                      onClick={() => handleRemoveLog(log.id)}
                      title="Delete log"
                      className="text-text-muted hover:text-red-400 p-1 rounded hover:bg-dark-hover border border-transparent hover:border-dark-border cursor-pointer transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="font-medium text-text-bright text-base select-text leading-relaxed font-serif">{log.questionText}</p>
                </div>

                <div className="text-xs border-l-2 border-gold-brand pl-4 space-y-2 py-0.5">
                  <p className="text-text-muted font-sans text-xs">
                    Your choice: <span className="font-mono font-bold text-red-400">{log.selectedAnswer}</span>
                  </p>
                  <p className="text-text-bright font-sans text-xs">
                    Correct Answer: <span className="font-bold text-gold-brand font-serif italic">{log.correctAnswer}) {log.options[log.correctAnswer]}</span>
                  </p>
                  <div className="pt-2 border-t border-dark-border mt-2 font-sans text-text-bright/80">
                    <strong className="text-gold-brand text-xs uppercase tracking-wider block mb-1">Explanation:</strong>
                    <p className="leading-relaxed">{log.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS REPLACE NATIVE DIALOGS */}
      {/* Wipe registry confirm modal */}
      <ConfirmModal
        isOpen={isWipeConfirmOpen}
        onClose={() => setIsWipeConfirmOpen(false)}
        onConfirm={handleClearAllConfirm}
        title="Wipe Mistakes Registry Book"
        message="Are you sure you want to completely erase all your saved mistake entries? This cannot be undone."
        confirmText="Confirm Clear All"
        cancelText="Cancel"
        type="danger"
      />

      {/* Alert Success Dialog popup */}
      <ConfirmModal
        isOpen={!!alertInfo?.isOpen}
        onClose={() => setAlertInfo(null)}
        onConfirm={() => {}}
        title={alertInfo?.title || "Notification"}
        message={alertInfo?.message || ""}
        confirmText="Perfect"
        cancelText="Close"
        type="info"
      />

    </div>
  );
}
