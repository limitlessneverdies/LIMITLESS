import { useState } from 'react';
import { mathTricks, repeatingPatterns } from '../data/learningContent';
import { Lightbulb, BookOpen, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function MathTricks() {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const filterSubjects = ["All", "Math", "Physics", "Chemistry", "Biology", "GK"];

  const filteredPatterns = selectedSubject === "All"
    ? repeatingPatterns
    : repeatingPatterns.filter(p => p.subject === selectedSubject);

  return (
    <div id="math-tricks-section" className="space-y-8 text-left">
      {/* Short Top Alert */}
      <div className="bg-dark-sidebar border border-amber-500/30 text-text-bright rounded-2xl p-5 flex items-start gap-4 shadow-xl">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
        <p className="text-sm font-sans leading-relaxed font-medium">
          <strong className="text-gold-brand font-serif italic text-base">Revision Strategy: </strong> Practice these formulas inside the simulator to build lightning fast muscle memory and make calculations perfectly "by hand".
        </p>
      </div>

      {/* Part 1: Crucial Shortcuts */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-dark-border pb-3">
          <Lightbulb className="w-5 h-5 text-gold-brand" />
          <h2 className="text-xl font-bold font-serif italic text-gold-brand tracking-tight">
            Entrance Exam Shortcuts & Chemistry Mnemonics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mathTricks.map((trick, idx) => (
            <div 
              key={idx}
              className="bg-dark-sidebar border border-dark-border hover:border-gold-brand/40 rounded-2xl p-6 shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <span className="text-[10px] bg-gold-brand/10 text-gold-brand border border-gold-brand/35 font-bold px-2.5 py-1 rounded-full block w-max uppercase tracking-wider">
                  Shortcut Trick
                </span>
                <h3 className="font-bold font-serif text-gold-brand text-lg">{trick.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed font-sans">{trick.concept}</p>
                
                <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                  <div className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">Shortcut Rule:</div>
                  <div className="text-gold-brand font-bold text-sm font-mono whitespace-pre-line bg-dark-bg p-3.5 rounded border border-dark-border/80 inline-block w-full">
                    {trick.shortcut}
                  </div>
                </div>
              </div>

              <div className="border-t border-dark-border mt-5 pt-4 space-y-2 bg-dark-card/40 rounded-xl p-4 border border-dark-border">
                <div className="text-text-bright text-xs font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gold-brand rounded-full"></span>
                  Solved Practical Case:
                </div>
                <div className="text-text-muted text-xs leading-relaxed font-mono whitespace-pre-line">
                  <strong>Example:</strong> {trick.example}
                  <div className="mt-2.5 text-text-bright bg-dark-bg p-3 rounded border border-dark-border">
                    {trick.derivation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Part 2: Repeating Patterns */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-3.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold-brand" />
            <h2 className="text-xl font-bold font-serif italic text-gold-brand tracking-tight">
              Top Repeating Concepts Cheat Sheet
            </h2>
          </div>

          {/* Subjects Filter */}
          <div className="flex flex-wrap gap-1 bg-dark-card border border-dark-border p-1 rounded-xl w-max">
            {filterSubjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${selectedSubject === subject ? 'bg-gold-brand text-black shadow font-black' : 'text-text-muted hover:text-text-bright'}`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Display Filtered List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatterns.map((pat, index) => (
            <div 
              key={index}
              className="bg-dark-sidebar border border-dark-border hover:border-gold-brand/35 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-gold-brand/10 text-gold-brand border border-gold-brand/30 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {pat.subject}
                  </span>
                  <span className="text-[10px] bg-red-950/25 border border-red-900/35 text-red-400 font-bold px-2.5 py-1 rounded-full">
                    {pat.frequency} Freq
                  </span>
                </div>

                <h3 className="font-bold text-text-bright text-base font-serif">{pat.topic}</h3>
                <p className="text-text-muted text-xs leading-relaxed font-sans">{pat.summary}</p>
                
                <div className="space-y-2 border-t border-dark-border pt-4">
                  <div className="text-xs font-bold text-gold-brand flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-gold-brand" />
                    Key Points to Memorize:
                  </div>
                  <ul className="space-y-2 pl-0.5 list-none">
                    {pat.keyPoints.map((kp, kIdx) => (
                      <li key={kIdx} className="text-text-muted text-xs flex items-start gap-2 font-sans">
                        <span className="text-gold-brand font-black text-xs shrink-0 mt-0.5">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
