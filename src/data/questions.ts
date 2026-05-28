import { Question } from '../types';
import { set1Raw, set2Raw, set3Raw } from './sets/set1_3';
import { set4Raw, set5Raw, set6Raw } from './sets/set4_6';
import { set7Raw, set8Raw, set9Raw } from './sets/set7_9';
import { set10Raw, set11Raw } from './sets/set10_11';

export function parseSetRaw(rawText: string, setNum: number): Question[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const parsedQuestions: Question[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Check if it starts with "SX-QY:" or similar
    if (line.match(/^S\d+-Q\d+:/i)) {
      const idMatch = line.match(/^(S\d+-Q\d+):/i);
      if (!idMatch) {
         i++;
         continue;
      }
      const id = idMatch[1].toUpperCase();
      const questionText = line.replace(/^S\d+-Q\d+:\s*/i, '').trim();
      
      // Next line should be choices: A) ... | B) ... | C) ... | D) ...
      i++;
      if (i >= lines.length) break;
      const choicesLine = lines[i];
      
      // Next line should be correct option: ✓ B: 8 or similar
      i++;
      if (i >= lines.length) break;
      const correctLine = lines[i];
      
      // Next line should be explanation: » explanation or similar
      i++;
      if (i >= lines.length) break;
      const explanationLine = lines[i];
      
      // Parse options
      let optionA = "";
      let optionB = "";
      let optionC = "";
      let optionD = "";
      
      const parts = choicesLine.split('|').map(p => p.trim());
      for (const p of parts) {
        if (p.startsWith('A)')) optionA = p.replace(/^A\)\s*/, '');
        else if (p.startsWith('B)')) optionB = p.replace(/^B\)\s*/, '');
        else if (p.startsWith('C)')) optionC = p.replace(/^C\)\s*/, '');
        else if (p.startsWith('D)')) optionD = p.replace(/^D\)\s*/, '');
      }
      
      // Parse correct answer
      let correctAnswerLetter = "A";
      let correctAnswerText = "";
      const correctMatch = correctLine.match(/^✓\s*([A-D]):?\s*(.*)$/i);
      if (correctMatch) {
        correctAnswerLetter = correctMatch[1].toUpperCase();
        correctAnswerText = correctMatch[2].trim();
      } else {
        // Fallback search
        const singleLetterMatch = correctLine.match(/([A-D])/);
        if (singleLetterMatch) {
          correctAnswerLetter = singleLetterMatch[1].toUpperCase();
        }
      }
      
      // Parse explanation
      const explanationText = explanationLine.startsWith('»') ? explanationLine.substring(1).trim() : explanationLine;
      
      const qNumMatch = id.match(/-Q(\d+)$/i);
      const qNum = qNumMatch ? parseInt(qNumMatch[1], 10) : 1;
      
      parsedQuestions.push({
        id,
        setNum,
        qNum,
        question: questionText,
        options: {
          A: optionA || "Option A",
          B: optionB || "Option B",
          C: optionC || "Option C",
          D: optionD || "Option D",
        },
        correct: correctAnswerLetter,
        correctText: correctAnswerText,
        explanation: explanationText,
      });
    }
    i++;
  }
  return parsedQuestions;
}

// Map of set numbers to raw contents
export const allSetsRaw: { [setNum: number]: string } = {
  1: set1Raw,
  2: set2Raw,
  3: set3Raw,
  4: set4Raw,
  5: set5Raw,
  6: set6Raw,
  7: set7Raw,
  8: set8Raw,
  9: set9Raw,
  10: set10Raw,
  11: set11Raw,
};

// Unified parsed questions collection
export const allQuestions: Question[] = [];

// Populate questions across all 11 sets
for (let s = 1; s <= 11; s++) {
  if (allSetsRaw[s]) {
    const parsed = parseSetRaw(allSetsRaw[s], s);
    allQuestions.push(...parsed);
  }
}
