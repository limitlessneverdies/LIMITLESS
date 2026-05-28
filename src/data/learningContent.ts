export interface MathGuideStep {
  title: string;
  expression: string;
  explanation: string;
  tips: string[];
}

export interface MathTrick {
  title: string;
  concept: string;
  shortcut: string;
  example: string;
  derivation: string;
}

export interface RepeatingPattern {
  subject: "Physics" | "Chemistry" | "Biology" | "Math" | "GK" | "English" | "Nepali";
  topic: string;
  summary: string;
  frequency: "Extremely High" | "High" | "Medium";
  keyPoints: string[];
}

export const decimalGuides: { [key: string]: MathGuideStep[] } = {
  multiplication: [
    {
      title: "Step 1: Ignore the Decimal Points",
      expression: "1.25 × 0.8  ➜  125 × 8",
      explanation: "Temporarily completely remove the decimal points. Treat both numbers as simple integers and perform regular multiplication.",
      tips: ["Don't worry about lining up the decimals.", "Use basic table facts: 125 × 8 is exactly 1000."]
    },
    {
      title: "Step 2: Count Total Decimal Places",
      expression: "1.25 (2 places) + 0.8 (1 place) = 3 places",
      explanation: "Count the total number of digits to the right of the decimal point in both of your starting numbers.",
      tips: ["1.25 has two digits after the dot (2, 5).", "0.8 has one digit after the dot (8).", "Combined, we have 2 + 1 = 3 decimal places."]
    },
    {
      title: "Step 3: Place the Decimal in the Result",
      expression: "1000  ➜  1.000  ➜  1",
      explanation: "Start at the far right of your integer product (1000) and jump the decimal point to the left by the total number of places you counted (3 places).",
      tips: ["Moving 3 spaces left in '1000.' gives '1.000'.", "Trailing zeros after a decimal point can be discarded: 1.000 = 1."]
    }
  ],
  divisionByInteger: [
    {
      title: "Step 1: Place the Decimal Point Directly Up",
      expression: "15.4 ÷ 7  ➜  Place decimal in quotient above 15.4",
      explanation: "Set up the division normally. Place the decimal point in your answer (quotient) directly above the decimal point in the dividend (15.4).",
      tips: ["Then divide exactly as you would with whole numbers.", "Do not shift any points yet!"]
    },
    {
      title: "Step 2: Divide the Whole Number Part",
      expression: "15 ÷ 7 = 2 with remainder 1",
      explanation: "Divide 15 by 7. 7 goes into 15 two times (2 × 7 = 14). Subtract 14 from 15 to get a remainder of 1.",
      tips: ["Write '2' in the quotient before the decimal point: 2."]
    },
    {
      title: "Step 3: Pull Down and Complete",
      expression: "Pull down 4 ➜ 14. Divide 14 ÷ 7 = 2",
      explanation: "Pull down the 4 next to the remainder 1 to make it 14. Divide 14 by 7. 7 goes into 14 exactly 2 times with zero remainder.",
      tips: ["Write '2' after the decimal point in your answer.", "Final Quotient = 2.2."]
    }
  ],
  divisionByDecimal: [
    {
      title: "Step 1: Make Divisor a Whole Number",
      expression: "12 ÷ 0.03  ➜  Divisor 0.03 becomes 3 (Shift 2 places right)",
      explanation: "We cannot divide easily by a decimal divisor. Eliminate it by moving the decimal point to the far right. Count how many places you moved it.",
      tips: ["Ex: 0.03 requires shifting 2 places to the right to make it 3.", "Ex: 1.4 requires shifting 1 place right to make it 14."]
    },
    {
      title: "Step 2: Apply Same Shift to Dividend",
      expression: "Dividend 12.00 is shifted 2 places right  ➜  1200",
      explanation: "Balance the fraction by shifting the decimal point of the dividend (the number being divided) by the exact same number of places to the right.",
      tips: ["For whole numbers like 12, add virtual zeros (12.00) and shift to get 1200.", "For decimals like 1.54, shifting 2 places right makes it 154."]
    },
    {
      title: "Step 3: Solve Simple Long Division",
      expression: "1200 ÷ 3 = 400",
      explanation: "Divide your new dividend by the new whole number divisor. The result is the exact final answer!",
      tips: ["The value remains identical because we multiplied both numbers by 100.", "12 ÷ 0.03 is exactly 1200 ÷ 3 = 400."]
    }
  ]
};

export const mathTricks: MathTrick[] = [
  {
    title: "1. The 3-Year Compounding Power (Cube Root)",
    concept: "Compound Interest yields an exact ratio over 3 years.",
    shortcut: "If amount becomes K times principal in 3 years, then (1 + R/100) = ∛K.",
    example: "A sum amounts to 27/8 times itself in 3 years. Find rate R.",
    derivation: "A = P(1 + R/100)³ ➜ 27/8 = (1 + R/100)³ \nTake cube root of both sides:\n∛(27/8) = 1.5 ➜ 1 + R/100 = 1.5 ➜ R/100 = 0.5 ➜ R = 50%!"
  },
  {
    title: "2. The '6 Men, 8 Days' Inverse Proportion Trick",
    concept: "Time and Work are inversely proportional: more people = fewer days.",
    shortcut: "Total Work = Men × Days = Constant (Man-Days). \nNew Days = (Original Men × Original Days) ÷ New Men.",
    example: "If 6 men complete a task in 8 days, how long do 12 men take?",
    derivation: "Total Work = 6 × 8 = 48 man-days.\nDays for 12 men = 48 ÷ 12 = 4 days!"
  },
  {
    title: "3. Percentage Scale Expansion (Area vs Volume)",
    concept: "Linear dimensions, Areas, and Volumes scale exponentially.",
    shortcut: "If side multiplies by factor X, then Area multiplies by X², and Volume multiplies by X³.",
    example: "A cube's edge is increased by 50%. Find percentage increase in Area and Volume.",
    derivation: "Side scale factor X = 1.50 (100% + 50%).\n• New Area = (1.5)² = 2.25 times ➜ 125% increase.\n• New Volume = (1.5)³ = 3.375 times ➜ 237.5% increase!"
  },
  {
    title: "4. Simple Interest Doubling/Tripling Cheat Sheet",
    concept: "In Simple Interest, Interest grows linearly with years.",
    shortcut: "• Doubles: Interest = P ➜ T × R = 100 \n• Triples: Interest = 2P ➜ T × R = 200 \n• Quadruples: Interest = 3P ➜ T × R = 300.",
    example: "A sum becomes 4 times itself in 20 years. Find rate R.",
    derivation: "Interest must equal 3P. So T × R = 300 ➜ 20 × R = 300 ➜ R = 15%!"
  },
  {
    title: "5. Harmonic Average Speed Shortcut",
    concept: "When equal distances are covered with different speeds, the average speed is the Harmonic Mean, not the arithmetic mean.",
    shortcut: "Average Speed = 2v₁v₂ / (v₁ + v₂)",
    example: "Travel first half of journey at 40 km/h, second half at 60 km/h. Find average speed.",
    derivation: "V_avg = 2 × 40 × 60 / (40 + 60) = 4800 / 100 = 48 km/h!"
  },
  {
    title: "6. Quadratic Sum and Product of Roots",
    concept: "Roots α and β of ax² + bx + c = 0 can be analyzed without solving.",
    shortcut: "• Sum (α + β) = -b/a \n• Product (αβ) = c/a \n• Form: x² - (Sum)x + Product = 0.",
    example: "Find the quadratic equation whose roots are 2 and -5.",
    derivation: "• Sum = 2 + (-5) = -3. \n• Product = 2 × (-5) = -10. \n• Equation: x² - (-3)x + (-10) = 0 ➜ x² + 3x - 10 = 0!"
  },
  {
    title: "7. Parallel Resistance Shortcuts",
    concept: "Instead of writing 1/R = 1/R₁ + 1/R₂, use direct products.",
    shortcut: "• Two resistors: R_eq = (R₁ × R₂) ÷ (R₁ + R₂)\n• If equal size R in parallel: R_eq = R/2 (or R/N for N equal resistors).",
    example: "Find equivalent resistance of 6 Ω and 3 Ω in parallel.",
    derivation: "R_eq = (6 × 3) ÷ (6 + 3) = 18 ÷ 9 = 2 Ω!"
  }
];

export const repeatingPatterns: RepeatingPattern[] = [
  {
    subject: "GK",
    topic: "Nepal's Federal Structure & Provinces",
    summary: "High frequency questions about districts, borders, and capitals of provinces.",
    frequency: "Extremely High",
    keyPoints: [
      "Koshi Province has the most districts (14).",
      "Karnali Province is the largest in area but has the lowest population.",
      "Bagmati Province is landlocked internally (no external borders with China or India).",
      "Bhaktapur is the smallest district (119 km²), Dolpa is the largest (7889 km²)."
    ]
  },
  {
    subject: "Math",
    topic: "Compound & Simple Interest",
    summary: "Comparing rates, differences between CI and SI, and doubling years.",
    frequency: "Extremely High",
    keyPoints: [
      "Formula SI: I = PRT / 100",
      "Formula CI: A = P(1 + R/100)^T",
      "Difference for 2 years: CI - SI = P(R/100)²",
      "Half-yearly compounding uses R/2 and 2T."
    ]
  },
  {
    subject: "Physics",
    topic: "Motion and Equations of Kinematics",
    summary: "Solving velocities or distances for falling bodies or accelerating cars.",
    frequency: "High",
    keyPoints: [
      "First law: v = u + at",
      "Second law: s = ut + ½at²",
      "Third law: v² = u² + 2as",
      "Vertically upward motion: maximum height h = u² / 2g. Speed at peak is 0."
    ]
  },
  {
    subject: "Chemistry",
    topic: "Periodic Table & Configurations",
    summary: "Deducing period, group, and chemical bonding from configuration.",
    frequency: "High",
    keyPoints: [
      "Number of electron shells = Period number. Ex: (2, 8, 8, 1) has 4 shells -> Period 4.",
      "Valence electrons determines Group. Ex: 1 valence e- -> Group I.",
      "Metals combine with non-metals via ionic bonds. Non-metals share via covalent bonds."
    ]
  },
  {
    subject: "Biology",
    topic: "Double Circulation in Human Heart",
    summary: "Tracking oxygenated vs deoxygenated bloodstream pathways.",
    frequency: "Extremely High",
    keyPoints: [
      "Aorta is the largest artery carrying oxygenated blood to body.",
      "Vena Cava is the largest vein carrying deoxygenated blood to heart.",
      "Pulmonary Vein is a critical exception: carries oxygenated blood from lungs to left atrium.",
      "Pulmonary Artery carries deoxygenated blood from right ventricle to lungs."
    ]
  },
  {
    subject: "GK",
    topic: "Historical Milestones of Nepal",
    summary: "Rana regime starts, major treaties, and system abolitions.",
    frequency: "High",
    keyPoints: [
      "Sugouli Treaty was signed in 1816 AD.",
      "Sati system and Slavery abolished by Prime Minister Chandra Shumsher.",
      "Multilateral peace accord (Comprehensive Peace Accord) was signed on Mangsir 5, 2063 BS.",
      "First constitution of Nepal was Nepal Government Act 2004 BS."
    ]
  }
];

export function calculateByHand(num1: number, num2: number, operation: "multiply" | "divide"): {
  steps: string[];
  finalResult: string;
} {
  const steps: string[] = [];
  
  if (operation === "multiply") {
    steps.push(`Original problem: ${num1} × ${num2}`);
    
    // Check if either is decimal
    const num1Str = num1.toString();
    const num2Str = num2.toString();
    const d1 = num1Str.includes(".") ? num1Str.split(".")[1].length : 0;
    const d2 = num2Str.includes(".") ? num2Str.split(".")[1].length : 0;
    const totalD = d1 + d2;
    
    if (totalD > 0) {
      steps.push(`Identify decimals: ${num1} has ${d1} decimal places, ${num2} has ${d2} decimal places.`);
      steps.push(`Total decimal places value: ${d1} + ${d2} = ${totalD} places.`);
      
      const int1 = Math.round(num1 * Math.pow(10, d1));
      const int2 = Math.round(num2 * Math.pow(10, d2));
      const intProduct = int1 * int2;
      
      steps.push(`Step 1: Multiply whole numbers ignoring decimal points: \n   ${int1} × ${int2} = ${intProduct}`);
      
      const factor = Math.pow(10, totalD);
      const finalVal = intProduct / factor;
      
      steps.push(`Step 2: Place the decimal point back. We move the decimal point ${totalD} places to the left starting from the end of ${intProduct}.`);
      steps.push(`Calculation: ${intProduct} ÷ 10^${totalD} = ${finalVal}`);
      
      return {
        steps,
        finalResult: finalVal.toString()
      };
    } else {
      steps.push(`Both numbers are integers. Just perform basic long multiplication:`);
      steps.push(`Calculation: ${num1} × ${num2} = ${num1 * num2}`);
      return {
        steps,
        finalResult: (num1 * num2).toString()
      };
    }
  } else {
    steps.push(`Original problem: ${num1} ÷ ${num2}`);
    
    const num2Str = num2.toString();
    const d2 = num2Str.includes(".") ? num2Str.split(".")[1].length : 0;
    
    if (d2 > 0) {
      steps.push(`The divisor (${num2}) is a decimal with ${d2} places. Let's make it a whole number.`);
      steps.push(`Multiply divisor by 10^${d2}: ${num2} × ${Math.pow(10, d2)} = ${Math.round(num2 * Math.pow(10, d2))}`);
      
      const shiftedDivisor = Math.round(num2 * Math.pow(10, d2));
      const shiftedDividend = num1 * Math.pow(10, d2);
      
      steps.push(`Must do the same to dividend! Multiply dividend by 10^${d2}: ${num1} × ${Math.pow(10, d2)} = ${shiftedDividend}`);
      steps.push(`New simplified problem: ${shiftedDividend} ÷ ${shiftedDivisor}`);
      
      const ans = shiftedDividend / shiftedDivisor;
      
      steps.push(`Perform standard division by hand: ${shiftedDividend} divided by ${shiftedDivisor} = ${ans}`);
      return {
        steps,
        finalResult: ans.toString()
      };
    } else {
      // Divisor is integer
      steps.push(`The divisor ${num2} is already an integer.`);
      const ans = num1 / num2;
      steps.push(`Perform division normally. Place the decimal point in the quotient directly above it if needed.`);
      steps.push(`Calculation: ${num1} ÷ ${num2} = ${ans}`);
      return {
        steps,
        finalResult: ans.toString()
      };
    }
  }
}
