import { useState, useMemo } from 'react';
import { allQuestions } from '../data/questions';
import { Question } from '../types';
import { saveMistakeLog } from '../utils/storage';
import { CheckCircle, XCircle, Search, Flag, HelpCircle, RefreshCw, Eye, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import ConfirmModal from './ConfirmModal';

export default function PracticeView() {
  const [selectedSet, setSelectedSet] = useState<number>(1);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  
  // Track state of user answers for each question in practice session (key is question ID)
  const [userSelections, setUserSelections] = useState<{ [qId: string]: string }>({});
  const [flaggedQs, setFlaggedQs] = useState<{ [qId: string]: boolean }>({});
  const [guessedQs, setGuessedQs] = useState<{ [qId: string]: boolean }>({});

  const originalSetQuestions = useMemo(() => {
    return allQuestions.filter(q => q.setNum === selectedSet);
  }, [selectedSet]);

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return originalSetQuestions;
    const query = searchQuery.toLowerCase();
    return originalSetQuestions.filter(q => 
      q.question.toLowerCase().includes(query) || 
      q.explanation.toLowerCase().includes(query) ||
      Object.values(q.options).some(opt => String(opt).toLowerCase().includes(query))
    );
  }, [originalSetQuestions, searchQuery]);

  const currentQ: Question | undefined = filteredQuestions[currentQIndex];

  const handleSelection = (optionKey: string) => {
    if (!currentQ) return;
    const qId = currentQ.id;
    if (userSelections[qId]) return; // Answer locked once selected
    
    // Save to practice selections
    const updated = { ...userSelections, [qId]: optionKey };
    setUserSelections(updated);
    setShowAnswer(true);

    // If answer is incorrect, log as a mistake in storage
    if (optionKey !== currentQ.correct) {
      saveMistakeLog({
        questionId: currentQ.id,
        setNum: currentQ.setNum,
        qNum: currentQ.qNum,
        questionText: currentQ.question,
        options: currentQ.options,
        correctAnswer: currentQ.correct,
        selectedAnswer: optionKey,
        explanation: currentQ.explanation,
      });
    }
  };

  const toggleFlag = () => {
    if (!currentQ) return;
    const qId = currentQ.id;
    setFlaggedQs(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const toggleGuess = () => {
    if (!currentQ) return;
    const qId = currentQ.id;
    setGuessedQs(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const nextQuestion = () => {
    if (currentQIndex < filteredQuestions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
      setShowAnswer(false);
    }
  };

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Reset progress logic
  const resetPractice = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    const remainingUserSelections = { ...userSelections };
    filteredQuestions.forEach(q => {
      delete remainingUserSelections[q.id];
    });
    setUserSelections(remainingUserSelections);
    setShowAnswer(false);
  };

  const setPercentProgress = Math.round(
    (originalSetQuestions.filter(q => userSelections[q.id]).length / originalSetQuestions.length) * 100
  );

  return (
    <div id="practice-view-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Sidebar: Set Selection & Quick Navigation */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Practice Set Dropdown Cards */}
        <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="font-serif italic font-medium text-gold-brand text-base tracking-wide border-b border-dark-border pb-3.5">Practice Sets</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
            {Array.from({ length: 11 }, (_, i) => i + 1).map((sNum) => (
              <button
                key={sNum}
                onClick={() => {
                  setSelectedSet(sNum);
                  setCurrentQIndex(0);
                  setShowAnswer(false);
                }}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${selectedSet === sNum ? "bg-gold-brand text-black shadow-lg shadow-gold-brand/10 font-bold" : "bg-dark-card border border-dark-border text-text-bright hover:border-gold-brand/40"}`}
              >
                Set {sNum}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-dark-border/60 space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-semibold text-text-bright">Set {selectedSet} Progress</span>
              <span className="font-extrabold text-gold-brand font-mono">{setPercentProgress}% solved</span>
            </div>
            <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden border border-dark-border/40">
              <div className="bg-gold-brand h-full transition-all duration-500" style={{ width: `${setPercentProgress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Global Search inside Select Set */}
        <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-serif italic font-medium text-gold-brand text-base tracking-wide pb-2">Subject Search</h3>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentQIndex(0);
                setShowAnswer(false);
              }}
              placeholder="Search e.g. VAT, Force, SAARC..."
              className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-3 text-xs text-text-bright focus:outline-none focus:border-gold-brand/70 placeholder:text-text-muted font-sans"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
          </div>
          {searchQuery && (
            <p className="text-[11px] text-gold-brand font-mono">
              Found {filteredQuestions.length} matched questions in Set {selectedSet}.
            </p>
          )}
        </div>

        {/* Dynamic 100 questions grid scroll list for selection */}
        <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
            <h3 className="font-bold text-text-bright text-xs uppercase tracking-wider">Set Questions Map</h3>
            <button
              onClick={resetPractice}
              title="Reset practice progress on this set"
              className="text-[11px] text-text-muted hover:text-red-400 cursor-pointer flex items-center gap-1 font-bold transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Set
            </button>
          </div>
          
          <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-10 lg:grid-cols-5 gap-1.5 max-h-56 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-dark-border">
            {filteredQuestions.map((q, idx) => {
              const answered = userSelections[q.id];
              const isCorrect = answered === q.correct;
              let btnClass = "bg-dark-card hover:bg-dark-hover text-text-bright border border-dark-border";
              
              if (currentQIndex === idx) {
                btnClass = "bg-gold-brand text-black border border-gold-brand font-black z-10 shadow";
              } else if (answered) {
                btnClass = isCorrect
                  ? "bg-gold-brand/10 text-gold-brand border border-gold-brand/35 font-semibold"
                  : "bg-red-950/20 text-red-450 border border-red-900/40";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQIndex(idx);
                    setShowAnswer(false);
                  }}
                  className={`py-2 text-xs font-mono rounded cursor-pointer transition-all flex flex-col items-center justify-center relative ${btnClass}`}
                >
                  <span>{q.qNum}</span>
                  {flaggedQs[q.id] && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-[10px] text-text-muted justify-center border-t border-dark-border/40 pt-3">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gold-brand/20 border border-gold-brand/35 block"></span> Correct</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-950/40 border border-red-900/40 block"></span> Incorrect</span>
            <span className="flex items-center gap-1"><span className="w-2 rounded-full h-2 bg-amber-500 block"></span> Flagged</span>
          </div>
        </div>

      </div>

      {/* Main Panel: Interactive Question Board */}
      <div className="lg:col-span-8 bg-dark-sidebar border border-dark-border rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header toolbar for active question */}
        {currentQ ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dark-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-dark-card border border-dark-border text-gold-brand font-mono text-[11px] font-bold rounded">
                    SET {selectedSet} • Q.{currentQ.qNum}
                  </span>
                  <span className="text-xs text-text-muted font-mono">{currentQ.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Flag toggle */}
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${flaggedQs[currentQ.id] ? "bg-amber-500/10 border-amber-500/45 text-amber-500" : "bg-dark-card border-dark-border text-text-muted hover:border-amber-500/50 hover:text-amber-500"}`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {flaggedQs[currentQ.id] ? "Flagged" : "Flag Q"}
                </button>

                {/* Guess Check */}
                <button
                  onClick={toggleGuess}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${guessedQs[currentQ.id] ? "bg-purple-950/20 border-purple-800/45 text-purple-400" : "bg-dark-card border-dark-border text-text-muted hover:border-purple-550/50 hover:text-purple-400"}`}
                >
                  <Star className="w-3.5 h-3.5" />
                  {guessedQs[currentQ.id] ? "Marked Guess" : "Guessing?"}
                </button>
              </div>
            </div>

            {/* Question Text Box with high end custom dark background */}
            <div className="bg-dark-card p-6 md:p-8 rounded-2xl border border-dark-border">
              <p className="text-text-bright font-medium text-base md:text-lg leading-relaxed select-text font-serif">
                {currentQ.question}
              </p>
            </div>

            {/* Choice Option Buttons */}
            <div className="space-y-3 pt-2">
              {Object.entries(currentQ.options).map(([key, value]) => {
                const userChoice = userSelections[currentQ.id];
                const isSelected = userChoice === key;
                const showCorrect = showAnswer && currentQ.correct === key;
                const showWrong = showAnswer && isSelected && currentQ.correct !== key;

                let rowClass = "border-dark-border bg-dark-card text-text-bright hover:border-gold-brand hover:bg-dark-hover";
                let checkIcon = null;

                if (showCorrect) {
                  rowClass = "border-gold-brand bg-gold-brand/10 text-gold-brand ring-2 ring-gold-brand/20 font-semibold";
                  checkIcon = <CheckCircle className="w-5 h-5 text-gold-brand shrink-0" />;
                } else if (showWrong) {
                  rowClass = "border-red-600 bg-red-950/20 text-red-500 ring-2 ring-red-600/20 font-medium";
                  checkIcon = <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
                } else if (isSelected) {
                  rowClass = "border-gold-brand bg-dark-hover text-text-bright";
                }

                return (
                  <button
                    key={key}
                    disabled={!!userChoice} // Disable options once answered
                    onClick={() => handleSelection(key)}
                    className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm pl-5 cursor-pointer transition-all flex items-center justify-between gap-4 ${rowClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black shrink-0 bg-dark-bg border border-dark-border text-gold-brand px-2.5 py-1 rounded text-xs select-none">
                        {key}
                      </span>
                      <span>{value}</span>
                    </div>
                    {checkIcon}
                  </button>
                );
              })}
            </div>

            {/* Action Bottom Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-dark-border">
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="px-4 py-2 bg-dark-card border border-dark-border hover:border-gold-brand text-text-bright text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                title="Directly reveal the correct answer and explanation"
              >
                <Eye className="w-4 h-4 text-gold-brand" />
                {showAnswer ? "Hide Solution" : "Reveal Solution"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevQuestion}
                  disabled={currentQIndex === 0}
                  className="p-2.5 bg-dark-card border border-dark-border hover:border-gold-brand rounded-lg text-text-bright disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-text-muted font-mono px-1">
                  {currentQIndex + 1} / {filteredQuestions.length}
                </span>
                <button
                  onClick={nextQuestion}
                  disabled={currentQIndex === filteredQuestions.length - 1}
                  className="p-2.5 bg-dark-card border border-dark-border hover:border-gold-brand rounded-lg text-text-bright disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Explanation / Notes Block with Sophisticated Dark serif headers */}
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-dark-card border-l-4 border-gold-brand text-text-bright p-6 rounded-r-xl space-y-3 mt-4"
              >
                <p className="font-serif italic text-xs uppercase tracking-wider text-gold-brand">Correct Answer: Option {currentQ.correct}</p>
                <p className="text-xs font-mono font-semibold text-text-bright bg-dark-bg/60 p-2.5 rounded border border-dark-border max-width-max">✓ {currentQ.options[currentQ.correct]}</p>
                
                <div className="pt-2 border-t border-dark-border/80">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Step-by-Step Explanation:</p>
                  <p className="text-sm leading-relaxed font-sans text-text-bright/90">{currentQ.explanation}</p>
                </div>
              </motion.div>
            )}

          </div>
        ) : (
          <div className="text-center py-20 space-y-4 bg-dark-card/50 border border-dark-border rounded-xl">
            <HelpCircle className="w-12 h-12 text-text-muted mx-auto animate-pulse" />
            <h3 className="font-serif italic text-lg text-gold-brand">No Questions Match Filter</h3>
            <p className="text-text-muted text-xs">Clear your search bar to reload Set {selectedSet} questions.</p>
          </div>
        )}

      </div>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Practicing Progress"
        message="Are you sure you want to completely clear your marked choices for this practice paper? This allows you to re-answer everything from scratch."
        confirmText="Confirm Reset"
        cancelText="Abort"
        type="warning"
      />

    </div>
  );
}
