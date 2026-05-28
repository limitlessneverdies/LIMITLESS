import { useState } from 'react';
import { calculateByHand, decimalGuides } from '../data/learningContent';
import { Sparkles, Calculator, Disc } from 'lucide-react';
import { motion } from 'motion/react';

export default function MathAssistant() {
  const [num1, setNum1] = useState<string>("1.54");
  const [num2, setNum2] = useState<string>("1.4");
  const [operation, setOperation] = useState<"multiply" | "divide">("divide");
  const [calculatedSteps, setCalculatedSteps] = useState<{ steps: string[]; finalResult: string } | null>(null);

  const presets = [
    { n1: "1.25", n2: "0.8", op: "multiply" as const, label: "1.25 × 0.8  (Decimals Multiplication)" },
    { n1: "15.4", n2: "7", op: "divide" as const, label: "15.4 ÷ 7  (Decimal Divided by Whole (by hand))" },
    { n1: "12", n2: "0.03", op: "divide" as const, label: "12 ÷ 0.03  (Whole Number Divided by Decimal)" },
    { n1: "1.54", n2: "1.4", op: "divide" as const, label: "1.54 ÷ 1.4  (Decimal Divided by Decimal)" },
    { n1: "0.125", n2: "0.05", op: "divide" as const, label: "0.125 ÷ 0.05 (Double Decimal Division)" }
  ];

  const handleCalculate = () => {
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);
    if (isNaN(n1) || isNaN(n2)) {
      alert("Please enter valid numbers");
      return;
    }
    if (operation === "divide" && n2 === 0) {
      alert("Cannot divide by zero!");
      return;
    }
    const result = calculateByHand(n1, n2, operation);
    setCalculatedSteps(result);
  };

  const loadPreset = (n1: string, n2: string, op: "multiply" | "divide") => {
    setNum1(n1);
    setNum2(n2);
    setOperation(op);
    const result = calculateByHand(parseFloat(n1), parseFloat(n2), op);
    setCalculatedSteps(result);
  };

  return (
    <div id="math-assistant-section" className="space-y-8 text-left">
      {/* Introduction Card */}
      <div className="bg-dark-sidebar border border-dark-border text-text-bright rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gold-brand/10 border border-gold-brand/20 rounded-xl text-gold-brand">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-gold-brand italic tracking-tight flex flex-wrap items-center gap-2">
              Learn "By-Hand" Calculation Methods
              <span className="text-[10px] bg-red-950/40 border border-red-900/40 text-red-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans">
                No Calculators Allowed!
              </span>
            </h2>
            <p className="text-text-muted mt-2 text-xs sm:text-sm leading-relaxed font-sans">
              At the **Mahanagar Entrance Test (MET)**, bringing calculators is strictly prohibited. You must execute all divisions, multiplications, and decimal manipulations completely by hand. Master these step-by-step mental tricks to lock in your score!
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Playground & Static Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Playground: Solve Any Decimals Here */}
        <div className="lg:col-span-7 bg-dark-sidebar border border-dark-border rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-dark-border pb-3.5">
            <h3 className="font-serif italic text-gold-brand text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-brand" />
              Interactive "By Hand" Calculus Simulator
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-text-muted mb-2.5 uppercase tracking-wider font-mono">Number 1</label>
              <input 
                type="text" 
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                placeholder="e.g. 15.4"
                className="w-full text-text-bright bg-dark-card border border-dark-border rounded-xl px-4 py-3 font-mono text-center focus:border-gold-brand focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 flex justify-center py-2 md:py-0">
              <div className="bg-dark-bg p-1 rounded-xl border border-dark-border inline-flex w-full">
                <button
                  onClick={() => setOperation("multiply")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${operation === "multiply" ? "bg-gold-brand text-black font-black" : "text-text-muted hover:text-text-bright"}`}
                >
                  Multiply (×)
                </button>
                <button
                  onClick={() => setOperation("divide")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${operation === "divide" ? "bg-gold-brand text-black font-black" : "text-text-muted hover:text-text-bright"}`}
                >
                  Divide (÷)
                </button>
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-text-muted mb-2.5 uppercase tracking-wider font-mono">Number 2</label>
              <input 
                type="text" 
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                placeholder="e.g. 0.05"
                className="w-full text-text-bright bg-dark-card border border-dark-border rounded-xl px-4 py-3 font-mono text-center focus:border-gold-brand focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full py-3.5 bg-gold-brand hover:opacity-90 text-black font-black rounded-lg shadow-lg shadow-gold-brand/10 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
          >
            Show Step-by-Step Calculus
          </button>

          {/* Preset Buttons */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Try Standard Exam Presets:</h4>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, index) => (
                <button
                  key={index}
                  onClick={() => loadPreset(p.n1, p.n2, p.op)}
                  className="px-3 py-2 text-xs font-semibold text-text-bright bg-dark-card border border-dark-border hover:border-gold-brand rounded-lg cursor-pointer transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step list results */}
          {calculatedSteps && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-card border border-gold-brand/35 rounded-2xl p-5 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-dark-border pb-3">
                <span className="text-xs font-bold text-gold-brand uppercase tracking-wider font-mono">Handmade Solutions Panel</span>
                <span className="font-mono text-sm sm:text-base font-black text-gold-brand">
                  Result = {calculatedSteps.finalResult}
                </span>
              </div>

              <div className="space-y-4">
                {calculatedSteps.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 text-sm leading-relaxed">
                    <div className="text-gold-brand shrink-0 font-bold font-mono text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-text-bright/95 font-medium whitespace-pre-line">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="border-t border-dark-border pt-5">
            <h4 className="font-serif italic text-gold-brand text-sm mb-3">Nepal Exam Preparation Mindset:</h4>
            <ul className="list-none pl-0 text-text-muted text-xs space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-gold-brand block mt-0.5 font-bold">•</span>
                <span>Maintain clean scratchpad rows on your exam handout sheet.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-brand block mt-0.5 font-bold">•</span>
                <span>Always double-check decimal point shifts when multiplying by powers of 10.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-brand block mt-0.5 font-bold">•</span>
                <span>When dividing decimal by decimal, convert the divisor into a whole integer first to prevent silly calculation errors.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Static Cheat Sheet Tabs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-dark-sidebar border border-dark-border rounded-2xl p-6 shadow-xl">
            <h3 className="font-serif italic text-gold-brand text-lg mb-4 flex items-center gap-2 border-b border-dark-border pb-3.5">
              <Disc className="w-5 h-5 text-gold-brand" />
              Decimal Operation Rulebooks
            </h3>
            
            {/* Guide Loop */}
            <div id="static-math-guides" className="space-y-6">
              {Object.entries(decimalGuides).map(([key, steps]) => (
                <div key={key} className="border-b border-dark-border/60 pb-5 last:border-b-0 last:pb-0">
                  <h4 className="font-serif italic text-gold-brand text-sm capitalize mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold-brand rounded-full inline-block"></span>
                    {key.replace(/([A-Z])/g, ' $1')} Guide
                  </h4>
                  <div className="space-y-4 pl-3.5 border-l border-gold-brand/20">
                    {steps.slice(0, 3).map((st, sIdx) => (
                      <div key={sIdx} className="space-y-1.5">
                        <h5 className="text-xs font-bold text-text-bright">{st.title}</h5>
                        <div className="font-mono text-xs text-gold-brand bg-dark-bg border border-dark-border px-2.5 py-1 rounded inline-block">
                          {st.expression}
                        </div>
                        <p className="text-text-muted text-xs leading-relaxed font-sans">{st.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
