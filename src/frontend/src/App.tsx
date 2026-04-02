import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Facebook,
  GraduationCap,
  Instagram,
  Menu,
  Star,
  Trophy,
  Twitter,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
type Grade = "9" | "12";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface SubjectData {
  id: string;
  name: string;
  color: string;
  g9Percent: number;
  g12Percent: number;
  questions: {
    g9: QuizQuestion[];
    g12: QuizQuestion[];
  };
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface QuizAttempt {
  subject: string;
  grade: Grade;
  score: number;
  date: string;
}

// ────────────────────────────────────────────────────────────
// Data
// ────────────────────────────────────────────────────────────
const ECZ_DATES: Record<Grade, Date> = {
  "9": new Date("2026-11-18T00:00:00"),
  "12": new Date("2026-10-27T00:00:00"),
};

const ECZ_DATE_LABELS: Record<Grade, string> = {
  "9": "18 November 2026",
  "12": "27 October 2026",
};

const SUBJECTS: SubjectData[] = [
  {
    id: "civic",
    name: "Zambian Civic Education",
    color: "#7C3AED",
    g9Percent: 68,
    g12Percent: 55,
    questions: {
      g9: [
        {
          question: "What is the capital city of Zambia?",
          options: ["Ndola", "Livingstone", "Lusaka", "Kitwe"],
          correct: 2,
        },
        {
          question: "Who was Zambia's first president?",
          options: [
            "Frederick Chiluba",
            "Kenneth Kaunda",
            "Levy Mwanawasa",
            "Edgar Lungu",
          ],
          correct: 1,
        },
        {
          question: "In what year did Zambia gain independence?",
          options: ["1963", "1964", "1965", "1966"],
          correct: 1,
        },
        {
          question: "The Zambian constitution guarantees freedom of?",
          options: ["Crime", "Theft", "Corruption", "Expression"],
          correct: 3,
        },
      ],
      g12: [
        {
          question: "Which branch of government makes laws in Zambia?",
          options: ["Executive", "Judiciary", "Military", "Legislature"],
          correct: 3,
        },
        {
          question: "What is the role of the Electoral Commission of Zambia?",
          options: [
            "Tax collection",
            "Making laws",
            "Conducting elections",
            "Defense",
          ],
          correct: 2,
        },
        {
          question: "How many members are in the Zambian National Assembly?",
          options: ["120", "150", "200", "156"],
          correct: 3,
        },
        {
          question:
            "Freedom of association is enshrined in which part of the constitution?",
          options: ["Preamble", "Schedule", "Amendment", "Bill of Rights"],
          correct: 3,
        },
      ],
    },
  },
  {
    id: "biology",
    name: "Zambian Biology",
    color: "#10B981",
    g9Percent: 45,
    g12Percent: 62,
    questions: {
      g9: [
        {
          question: "What is the basic unit of life?",
          options: ["Organ", "Tissue", "Cell", "Organism"],
          correct: 2,
        },
        {
          question: "Which process do plants use to make food?",
          options: ["Respiration", "Digestion", "Photosynthesis", "Absorption"],
          correct: 2,
        },
        {
          question: "The heart pumps blood to which system?",
          options: ["Digestive", "Nervous", "Respiratory", "Circulatory"],
          correct: 3,
        },
        {
          question: "What carries oxygen in red blood cells?",
          options: ["Plasma", "Platelets", "White cells", "Haemoglobin"],
          correct: 3,
        },
      ],
      g12: [
        {
          question: "Which organelle is responsible for ATP production?",
          options: ["Nucleus", "Ribosome", "Vacuole", "Mitochondria"],
          correct: 3,
        },
        {
          question: "What is the role of mRNA in protein synthesis?",
          options: [
            "Energy storage",
            "Digests proteins",
            "Stores amino acids",
            "Carries genetic code from DNA to ribosome",
          ],
          correct: 3,
        },
        {
          question: "Which enzyme breaks down starch in the mouth?",
          options: ["Pepsin", "Lipase", "Amylase", "Trypsin"],
          correct: 2,
        },
        {
          question: "Osmosis is the movement of water from?",
          options: [
            "Low to high solute concentration",
            "High to low pressure",
            "Cell to cell",
            "High to low solute concentration",
          ],
          correct: 3,
        },
      ],
    },
  },
  {
    id: "science",
    name: "Zambian Science",
    color: "#3B82F6",
    g9Percent: 82,
    g12Percent: 77,
    questions: {
      g9: [
        {
          question: "What is the chemical symbol for water?",
          options: ["H2O2", "HO", "OH2", "H2O"],
          correct: 3,
        },
        {
          question: "Which force pulls objects toward Earth?",
          options: ["Magnetism", "Friction", "Tension", "Gravity"],
          correct: 3,
        },
        {
          question: "What is the speed of light?",
          options: ["150,000 km/s", "1000 km/s", "30,000 km/s", "300,000 km/s"],
          correct: 3,
        },
        {
          question: "Sound travels fastest through?",
          options: ["Air", "Vacuum", "Water", "Steel"],
          correct: 3,
        },
      ],
      g12: [
        {
          question: "What is Ohm's Law?",
          options: ["V = I/R", "V = I+R", "V = I-R", "V = IR"],
          correct: 3,
        },
        {
          question: "Nuclear fission involves?",
          options: [
            "Combining nuclei",
            "Electron transfer",
            "Proton removal",
            "Splitting nuclei",
          ],
          correct: 3,
        },
        {
          question: "pH of 7 indicates?",
          options: ["Acid", "Base", "Salt", "Neutral"],
          correct: 3,
        },
        {
          question: "Fleming's left-hand rule determines?",
          options: [
            "Current direction",
            "Voltage",
            "Resistance",
            "Force on conductor in magnetic field",
          ],
          correct: 3,
        },
      ],
    },
  },
  {
    id: "math",
    name: "Mathematics",
    color: "#F59E0B",
    g9Percent: 71,
    g12Percent: 48,
    questions: {
      g9: [
        {
          question: "Solve: 3x + 6 = 15. x = ?",
          options: ["2", "4", "5", "3"],
          correct: 3,
        },
        {
          question: "What is 15% of 200?",
          options: ["25", "35", "40", "30"],
          correct: 3,
        },
        {
          question: "Area of a rectangle 8m × 5m?",
          options: ["13m²", "26m²", "45m²", "40m²"],
          correct: 3,
        },
        {
          question: "What is the HCF of 12 and 18?",
          options: ["3", "9", "12", "6"],
          correct: 3,
        },
      ],
      g12: [
        {
          question: "Differentiate y = 3x²:",
          options: ["3x", "6x²", "3", "6x"],
          correct: 3,
        },
        {
          question: "Log₁₀(100) = ?",
          options: ["1", "10", "100", "2"],
          correct: 3,
        },
        {
          question: "If sin θ = 0.5, θ = ?",
          options: ["45°", "60°", "90°", "30°"],
          correct: 3,
        },
        {
          question: "Expand (x+2)²:",
          options: ["x²+4", "x²+2x+4", "x²+4x+2", "x²+4x+4"],
          correct: 3,
        },
      ],
    },
  },
  {
    id: "history",
    name: "History",
    color: "#EC4899",
    g9Percent: 39,
    g12Percent: 83,
    questions: {
      g9: [
        {
          question: "Zambia gained independence from which country?",
          options: ["France", "Portugal", "Germany", "Britain"],
          correct: 3,
        },
        {
          question: "UNIP stands for?",
          options: [
            "United Nations International Party",
            "Union of National Independent People",
            "United National Industrial Party",
            "United National Independence Party",
          ],
          correct: 3,
        },
        {
          question: "The Copper Belt is known for mining which mineral?",
          options: ["Gold", "Iron", "Diamond", "Copper"],
          correct: 3,
        },
        {
          question: "Dr. Kenneth Kaunda was also known as?",
          options: ["KKK", "KKZ", "ZKK", "KK"],
          correct: 3,
        },
      ],
      g12: [
        {
          question:
            "The Scramble for Africa took place mainly in which century?",
          options: ["17th", "18th", "20th", "19th"],
          correct: 3,
        },
        {
          question: "Cecil Rhodes founded which company?",
          options: [
            "East India Company",
            "Royal Niger Company",
            "Zambezi Company",
            "British South Africa Company",
          ],
          correct: 3,
        },
        {
          question:
            "The Federation of Rhodesia and Nyasaland was dissolved in?",
          options: ["1960", "1964", "1965", "1963"],
          correct: 3,
        },
        {
          question: "Operation Bwezani in 1993 was aimed at?",
          options: [
            "Economic reform",
            "Elections",
            "Constitutional change",
            "Disarming UNIP youth brigade",
          ],
          correct: 3,
        },
      ],
    },
  },
];

const RING_COLORS: Record<string, { from: string; to: string }> = {
  civic: { from: "#7C3AED", to: "#A855F7" },
  biology: { from: "#10B981", to: "#34D399" },
  science: { from: "#3B82F6", to: "#60A5FA" },
  math: { from: "#F59E0B", to: "#FCD34D" },
  history: { from: "#EC4899", to: "#F472B6" },
};

// ────────────────────────────────────────────────────────────
// Textbook Data
// ────────────────────────────────────────────────────────────
interface Textbook {
  title: string;
  cover: string;
}

const TEXTBOOKS: Record<string, Record<string, Textbook>> = {
  "9": {
    biology: {
      title: "Longman Biology for Zambia Grade 9",
      cover: "/assets/generated/textbook-biology-g9.dim_200x280.jpg",
    },
    science: {
      title: "Longman Integrated Science for Zambia Grade 9",
      cover: "/assets/generated/textbook-science-g9.dim_200x280.jpg",
    },
    civic: {
      title: "Longman Civic Education for Zambia Grade 9",
      cover: "/assets/generated/textbook-civic-g9.dim_200x280.jpg",
    },
  },
  "12": {
    biology: {
      title: "Longman Biology for Zambia Grade 12",
      cover: "/assets/generated/textbook-biology-g12.dim_200x280.jpg",
    },
    physics: {
      title: "Longman Physics for Zambia Grade 12",
      cover: "/assets/generated/textbook-physics-g12.dim_200x280.jpg",
    },
    civic: {
      title: "Longman Civic Education for Zambia Grade 12",
      cover: "/assets/generated/textbook-civic-g12.dim_200x280.jpg",
    },
  },
};

const CONFETTI_COLORS = [
  "#7C3AED",
  "#A855F7",
  "#F5B301",
  "#EC4899",
  "#3B82F6",
  "#10B981",
  "#FCD34D",
];
const OPTION_LETTERS = ["A", "B", "C", "D"];

// ────────────────────────────────────────────────────────────
// Storage helpers
// ────────────────────────────────────────────────────────────
const STORAGE_KEY = "chozi_quiz_scores";
const ATTEMPTS_KEY = "chozi_quiz_attempts";

function loadScores(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveScore(subjectId: string, grade: Grade, score: number) {
  const scores = loadScores();
  const key = `${subjectId}_${grade}`;
  if (!scores[key] || score > scores[key]) {
    scores[key] = score;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  }
}

function loadAttempts(): QuizAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAttempt(attempt: QuizAttempt) {
  const attempts = loadAttempts();
  attempts.unshift(attempt);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts.slice(0, 20)));
}

// ────────────────────────────────────────────────────────────
// Confetti
// ────────────────────────────────────────────────────────────
function Confetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3500);
    return () => clearTimeout(timer);
  }, [onDone]);

  const particles = Array.from({ length: 60 }, (_, idx) => ({
    id: idx,
    color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 1.5,
    size: 6 + Math.random() * 8,
    shape: Math.random() > 0.5 ? "50%" : "0%",
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            borderRadius: p.shape,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Progress Ring
// ────────────────────────────────────────────────────────────
interface ProgressRingProps {
  subjectId: string;
  percentage: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
}

function ProgressRing({
  subjectId,
  percentage,
  size = 120,
  strokeWidth = 10,
  animated = true,
}: ProgressRingProps) {
  const [displayed, setDisplayed] = useState(animated ? 0 : percentage);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;
  const colors = RING_COLORS[subjectId] || { from: "#7C3AED", to: "#A855F7" };
  const gradId = `grad-${subjectId}-${size}`;

  useEffect(() => {
    if (!animated) {
      setDisplayed(percentage);
      return;
    }
    setDisplayed(0);
    const timer = setTimeout(() => setDisplayed(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage, animated]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        role="img"
        aria-label={`${subjectId} progress ring`}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.24 0.12 285 / 0.4)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold text-foreground"
          style={{ lineHeight: 1 }}
        >
          {displayed.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Countdown
// ────────────────────────────────────────────────────────────
function useCountdown(target: Date): CountdownTime {
  const calc = useCallback(() => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }, [target]);

  const [time, setTime] = useState<CountdownTime>(() => calc());

  useEffect(() => {
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

function CountdownCard({ grade }: { grade: Grade }) {
  const time = useCountdown(ECZ_DATES[grade]);
  const segments = [
    { label: "Days", value: time.days },
    { label: "Hrs", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ];

  return (
    <div className="card-glass rounded-2xl p-6" data-ocid="countdown.card">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="h-4 w-4 text-gold" />
        <span className="text-xs uppercase tracking-widest text-gold font-semibold">
          Countdown
        </span>
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">
        ECZ Grade {grade} Exams Begin In
      </h3>
      <p className="text-xs text-lavender mb-5">
        Starting {ECZ_DATE_LABELS[grade]}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {segments.map((seg) => (
          <div key={seg.label} className="countdown-segment">
            <div className="text-3xl font-bold gold-gradient-text leading-none">
              {String(seg.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] text-lavender uppercase tracking-wider mt-1">
              {seg.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Quiz Modal
// ────────────────────────────────────────────────────────────
interface QuizModalProps {
  subject: SubjectData;
  grade: Grade;
  open: boolean;
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
}

function QuizModal({
  subject,
  grade,
  open,
  onClose,
  onComplete,
}: QuizModalProps) {
  const questions = subject.questions[`g${grade}` as "g9" | "g12"];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null),
  );
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setSubmitted(true);

    setTimeout(() => {
      if (isLast) {
        const score = newAnswers.filter(
          (a, i) => a === questions[i].correct,
        ).length;
        setShowResult(true);
        onComplete(score, questions.length);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setSubmitted(false);
      }
    }, 800);
  };

  const handleClose = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers(Array(questions.length).fill(null));
    setSubmitted(false);
    setShowResult(false);
    onClose();
  };

  const finalScore = answers.filter(
    (a, i) => a === questions[i]?.correct,
  ).length;
  const finalPct = Math.round((finalScore / questions.length) * 100);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-lg card-glass border-border text-foreground"
        data-ocid="quiz.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5 text-gold" />
            {subject.name}
          </DialogTitle>
        </DialogHeader>

        {!showResult ? (
          <div className="mt-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-lavender">
                Question {current + 1} of {questions.length}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-purple-mid">
                <div
                  className="h-full rounded-full bg-gold transition-all duration-500"
                  style={{
                    width: `${((current + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <p className="text-base font-semibold text-foreground mb-4 leading-snug">
              {q.question}
            </p>

            <div className="space-y-2 mb-6">
              {q.options.map((opt, optIdx) => {
                let cls =
                  "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ";
                if (!submitted) {
                  cls +=
                    selected === optIdx
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-muted/30 text-foreground hover:border-purple-light hover:bg-purple-mid/20";
                } else {
                  if (optIdx === q.correct)
                    cls +=
                      "border-emerald-500 bg-emerald-500/20 text-emerald-300";
                  else if (optIdx === selected)
                    cls += "border-red-500 bg-red-500/20 text-red-300";
                  else cls += "border-border bg-muted/20 text-muted-foreground";
                }
                return (
                  <button
                    type="button"
                    key={opt}
                    className={cls}
                    onClick={() => handleSelect(optIdx)}
                    data-ocid={`quiz.option.${optIdx + 1}`}
                  >
                    <span className="inline-block w-6 h-6 rounded-full border border-current mr-2 text-center text-xs leading-6">
                      {OPTION_LETTERS[optIdx]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <Button
              onClick={handleNext}
              disabled={selected === null || submitted}
              className="w-full bg-gold text-purple-deep hover:bg-gold-light font-bold"
              data-ocid="quiz.submit_button"
            >
              {isLast ? "Submit Quiz" : "Next Question"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <div className="flex justify-center mb-4">
              <ProgressRing
                subjectId={subject.id}
                percentage={finalPct}
                size={140}
                strokeWidth={12}
                animated
              />
            </div>
            <div
              className={`text-3xl font-bold mb-1 ${
                finalPct >= 80
                  ? "text-emerald-400"
                  : finalPct >= 50
                    ? "text-gold"
                    : "text-red-400"
              }`}
            >
              {finalScore}/{questions.length} Correct
            </div>
            <div className="text-lavender mb-2">{finalPct}% Score</div>
            {finalPct >= 80 ? (
              <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-sm px-3 py-1 rounded-full mb-4">
                <Trophy className="h-3.5 w-3.5" /> Excellent! You passed with
                distinction!
              </div>
            ) : finalPct >= 50 ? (
              <div className="inline-flex items-center gap-1 bg-gold/20 text-gold text-sm px-3 py-1 rounded-full mb-4">
                <Star className="h-3.5 w-3.5" /> Good effort — keep practising!
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 text-sm px-3 py-1 rounded-full mb-4">
                Keep studying — you can do it!
              </div>
            )}
            <Button
              onClick={handleClose}
              className="w-full bg-gold text-purple-deep hover:bg-gold-light font-bold"
              data-ocid="quiz.close_button"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────
// Quiz Card
// ────────────────────────────────────────────────────────────
interface QuizCardProps {
  subject: SubjectData;
  grade: Grade;
  bestScore: number | undefined;
  onStart: () => void;
}

function QuizCard({ subject, grade, bestScore, onStart }: QuizCardProps) {
  const difficulty =
    grade === "9"
      ? "Easy"
      : subject.id === "math" || subject.id === "history"
        ? "Hard"
        : "Medium";
  const diffColor =
    difficulty === "Easy"
      ? "text-emerald-400"
      : difficulty === "Medium"
        ? "text-gold"
        : "text-red-400";
  return (
    <div
      className="card-glass rounded-2xl p-5 hover:border-purple-light transition-all duration-300"
      data-ocid={`quiz.${subject.id}.card`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground leading-tight">
            {subject.name}
          </h3>
          <div className="text-xs text-lavender mt-0.5">
            10 Questions • 15 mins
          </div>
        </div>
        <Badge
          className={`text-[10px] border-0 bg-transparent ${diffColor} font-bold`}
        >
          {difficulty}
        </Badge>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: subject.color }}
        />
        <span className="text-xs text-lavender">
          Best:{" "}
          {bestScore !== undefined ? `${bestScore}%` : "Not attempted yet"}
        </span>
      </div>
      <Button
        className="w-full bg-purple hover:bg-purple-light font-bold text-sm text-foreground shadow-glow"
        onClick={onStart}
        data-ocid={`quiz.${subject.id}.button`}
      >
        Take Quiz
      </Button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Social icons config
// ────────────────────────────────────────────────────────────
// Continue Learning Modal
// ────────────────────────────────────────────────────────────
interface ContinueLearningModalProps {
  subject: SubjectData;
  grade: Grade;
  open: boolean;
  onClose: () => void;
}

function ContinueLearningModal({
  subject,
  grade,
  open,
  onClose,
}: ContinueLearningModalProps) {
  const textbook = TEXTBOOKS[grade]?.[subject.id];
  const pct = grade === "9" ? subject.g9Percent : subject.g12Percent;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="card-glass border-border max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gold text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-bright" />
            Continue Learning
          </DialogTitle>
        </DialogHeader>
        <div className="mt-1 space-y-6">
          {/* Subject header */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: subject.color }}
            >
              {subject.name.charAt(0)}
            </div>
            <div>
              <p className="text-foreground font-semibold text-sm">
                {subject.name}
              </p>
              <p className="text-muted-foreground text-xs">
                Grade {grade} &middot; {pct}% mastered
              </p>
            </div>
          </div>

          {/* Study Tips */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold font-bold mb-3">
              Study Tips
            </h4>
            <ul className="space-y-2">
              {[
                "Review your weakest topics first",
                "Practice ECZ past paper questions daily",
                "Create summary notes for each chapter",
              ].map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-purple-bright mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Textbooks */}
          {textbook && (
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gold font-bold mb-3">
                📚 Official ECZ Textbook
              </h4>
              <div className="flex gap-4 items-start p-3 rounded-xl bg-white/5 border border-border hover:border-purple-light transition-colors">
                <img
                  src={textbook.cover}
                  alt={textbook.title}
                  className="w-20 rounded-lg shadow-lg flex-shrink-0 border border-white/10"
                  style={{ aspectRatio: "200/280", objectFit: "cover" }}
                />
                <div className="flex flex-col justify-center gap-2">
                  <p className="text-foreground text-sm font-semibold leading-snug">
                    {textbook.title}
                  </p>
                  <Badge className="w-fit text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    ✓ ECZ Approved
                  </Badge>
                  <p className="text-muted-foreground text-xs">
                    Official curriculum textbook for Grade {grade}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!textbook && (
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gold font-bold mb-3">
                📚 Official ECZ Textbook
              </h4>
              <div className="p-3 rounded-xl bg-white/5 border border-border text-center">
                <p className="text-muted-foreground text-xs">
                  Textbook information coming soon for this subject.
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-foreground border border-border hover:border-purple-light transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────
const SOCIAL_ICONS = [
  { name: "facebook", Icon: Facebook },
  { name: "twitter", Icon: Twitter },
  { name: "instagram", Icon: Instagram },
];

// ────────────────────────────────────────────────────────────
// App
// ────────────────────────────────────────────────────────────
export default function App() {
  const [grade, setGrade] = useState<Grade>("9");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<SubjectData | null>(null);
  const [scores, setScores] = useState<Record<string, number>>(loadScores);
  const [attempts, setAttempts] = useState<QuizAttempt[]>(loadAttempts);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(
    null,
  );

  const handleGradeChange = (g: Grade) => {
    setGrade(g);
    setAnimKey((k) => k + 1);
  };

  const handleQuizComplete = (score: number, total: number) => {
    if (!activeQuiz) return;
    const pct = Math.round((score / total) * 100);
    saveScore(activeQuiz.id, grade, pct);
    const attempt: QuizAttempt = {
      subject: activeQuiz.name,
      grade,
      score: pct,
      date: new Date().toLocaleDateString("en-ZM", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    saveAttempt(attempt);
    setScores(loadScores());
    setAttempts(loadAttempts());
    if (pct >= 80) setShowConfetti(true);
  };

  const navLinks = ["Dashboard", "Subjects", "Resources", "Study Plan"];

  const gradeScoreKeys = Object.keys(scores).filter((k) =>
    k.endsWith(`_${grade}`),
  );
  const bestOverall =
    gradeScoreKeys.length > 0
      ? Math.max(...gradeScoreKeys.map((k) => scores[k]))
      : null;

  return (
    <div className="min-h-screen gradient-bg font-sans">
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

      {/* Header */}
      <header className="sticky top-0 z-50 card-glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple flex items-center justify-center shadow-glow flex-shrink-0">
                <GraduationCap className="h-6 w-6 text-gold" />
              </div>
              <div>
                <div className="text-base font-bold gold-gradient-text leading-tight">
                  Chozi's Exam Prep
                </div>
                <div className="text-[10px] text-purple-bright uppercase tracking-widest font-semibold">
                  Study Smart. Score High.
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link}
                  className="px-3 py-1.5 text-sm text-lavender hover:text-foreground hover:bg-purple-mid/20 rounded-lg transition-colors"
                  data-ocid={`nav.${link.toLowerCase().replace(" ", "_")}.link`}
                >
                  {link}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button
                className="bg-gold text-purple-deep hover:bg-gold-light font-bold text-sm px-4 py-2"
                data-ocid="nav.start_learning.button"
              >
                Start Learning
              </Button>
            </div>

            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-purple-mid/20 text-foreground"
              onClick={() => setMobileMenuOpen((v) => !v)}
              data-ocid="nav.mobile_menu.button"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link}
                className="block w-full text-left px-3 py-2 text-sm text-lavender hover:text-foreground hover:bg-purple-mid/20 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                data-ocid={`nav.mobile.${link.toLowerCase().replace(" ", "_")}.link`}
              >
                {link}
              </button>
            ))}
            <Button
              className="w-full mt-2 bg-gold text-purple-deep hover:bg-gold-light font-bold text-sm"
              data-ocid="nav.mobile.start_learning.button"
            >
              Start Learning
            </Button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <section className="mb-10 animate-slide-up">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-purple/20 text-purple-bright border-purple/40 text-xs uppercase tracking-wider">
                🇿🇲 ECZ Official Syllabus 2026
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
                Master Your{" "}
                <span className="gold-gradient-text">ECZ Exams!</span>
              </h1>
              <p className="text-lg text-lavender mb-6 leading-relaxed">
                Premium Grade 9 &amp; 12 exam preparation with interactive
                quizzes, progress tracking, and Zambia-specific curriculum.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-gold text-purple-deep hover:bg-gold-light font-bold px-6 py-3 text-base shadow-glow-gold"
                  data-ocid="hero.start_learning.primary_button"
                >
                  Start Preparing Now
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-mid text-foreground hover:bg-purple-mid/20 font-semibold px-6 py-3 text-base"
                  data-ocid="hero.view_subjects.secondary_button"
                  onClick={() => {
                    const el = document.getElementById("subjects-section");
                    if (el)
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  View Subjects
                </Button>
              </div>
              <div className="flex gap-6 mt-6">
                {[
                  { value: "5", label: "Subjects" },
                  { value: "50+", label: "Quiz Questions" },
                  { value: "G9/G12", label: "Grades" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold gold-gradient-text">
                      {stat.value}
                    </div>
                    <div className="text-xs text-lavender">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="card-glass rounded-3xl p-8 text-center shadow-glow">
                <div className="text-xs uppercase tracking-widest text-lavender mb-3">
                  Your Overall Progress
                </div>
                <ProgressRing
                  key={`hero-${grade}-${animKey}`}
                  subjectId="biology"
                  percentage={grade === "9" ? 61 : 65}
                  size={180}
                  strokeWidth={16}
                  animated
                />
                <div className="mt-3 text-sm text-lavender">
                  Across all subjects · Grade {grade}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grade Selector */}
        <section className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-sm text-lavender font-medium">
              Select Grade:
            </span>
            <div className="flex gap-2">
              {(["9", "12"] as Grade[]).map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => handleGradeChange(g)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                    grade === g
                      ? "bg-purple text-foreground shadow-glow"
                      : "border border-purple-mid text-lavender hover:border-purple hover:text-foreground"
                  }`}
                  data-ocid={`grade.g${g}.tab`}
                >
                  Grade {g}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Countdown + Stats */}
        <section className="grid md:grid-cols-2 gap-6 mb-10">
          <CountdownCard key={grade} grade={grade} />
          <div className="card-glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-gold" />
              <span className="text-xs uppercase tracking-widest text-gold font-semibold">
                Grade {grade} Quick Stats
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Subjects Tracked", value: "5", icon: "📚" },
                { label: "Quizzes Available", value: "5", icon: "📝" },
                {
                  label: "Best Score",
                  value: bestOverall !== null ? `${bestOverall}%` : "N/A",
                  icon: "🏆",
                },
                {
                  label: "Attempted",
                  value: `${gradeScoreKeys.length}/5`,
                  icon: "✅",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-purple-mid/20 rounded-xl p-3"
                >
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <div className="text-lg font-bold gold-gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-xs text-lavender">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Progress Trackers */}
        <section id="subjects-section" className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-gold font-bold px-3">
              Subject Progress Trackers
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {SUBJECTS.map((subject) => {
              const pct =
                grade === "9" ? subject.g9Percent : subject.g12Percent;
              const mastered = pct >= 80;
              return (
                <div
                  key={subject.id}
                  className="card-glass rounded-2xl p-4 flex flex-col items-center text-center hover:border-purple-light transition-all duration-300 group"
                  data-ocid={`progress.${subject.id}.card`}
                >
                  <ProgressRing
                    key={`${subject.id}-${grade}-${animKey}`}
                    subjectId={subject.id}
                    percentage={pct}
                    size={100}
                    strokeWidth={9}
                    animated
                  />
                  <h3 className="text-xs font-semibold text-foreground mt-3 leading-tight">
                    {subject.name}
                  </h3>
                  <Badge
                    className={`mt-2 text-[10px] px-2 py-0 ${
                      mastered
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-gold/20 text-gold border-gold/30"
                    }`}
                  >
                    {mastered ? "✓ Mastered" : "In Progress"}
                  </Badge>
                  <button
                    type="button"
                    className="mt-3 text-[11px] text-purple-bright hover:text-gold font-semibold transition-colors group-hover:underline"
                    data-ocid={`progress.${subject.id}.button`}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    Continue Learning →
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Practice Quizzes */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-gold font-bold px-3">
              Practice Quizzes
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {SUBJECTS.slice(0, 3).map((subject) => (
              <QuizCard
                key={subject.id}
                subject={subject}
                grade={grade}
                bestScore={scores[`${subject.id}_${grade}`]}
                onStart={() => setActiveQuiz(subject)}
              />
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {SUBJECTS.slice(3).map((subject) => (
              <QuizCard
                key={subject.id}
                subject={subject}
                grade={grade}
                bestScore={scores[`${subject.id}_${grade}`]}
                onStart={() => setActiveQuiz(subject)}
              />
            ))}
          </div>
        </section>

        {/* Recent Attempts */}
        {attempts.length > 0 ? (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-widest text-gold font-bold px-3">
                Recent Quiz Attempts
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div
              className="card-glass rounded-2xl overflow-hidden"
              data-ocid="attempts.table"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-lavender font-semibold">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-lavender font-semibold">
                        Grade
                      </th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-lavender font-semibold">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-lavender font-semibold">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.slice(0, 6).map((a, rowIdx) => (
                      <tr
                        key={`${a.subject}-${a.grade}-${a.date}-${rowIdx}`}
                        className="border-b border-border/50 hover:bg-purple-mid/10 transition-colors"
                        data-ocid={`attempts.item.${rowIdx + 1}`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {a.subject}
                        </td>
                        <td className="px-4 py-3 text-lavender">
                          Grade {a.grade}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-bold ${
                              a.score >= 80
                                ? "text-emerald-400"
                                : a.score >= 50
                                  ? "text-gold"
                                  : "text-red-400"
                            }`}
                          >
                            {a.score}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-lavender text-xs">
                          {a.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          <div
            className="card-glass rounded-2xl p-8 text-center mb-10"
            data-ocid="attempts.empty_state"
          >
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              No quizzes attempted yet
            </h3>
            <p className="text-sm text-lavender">
              Take your first quiz above to track your progress!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-gold" />
                </div>
                <span className="text-base font-bold gold-gradient-text">
                  Chozi's Exam Prep
                </span>
              </div>
              <p className="text-xs text-lavender leading-relaxed">
                Built for Zambian Students · ECZ Exam Success
              </p>
            </div>
            {[
              {
                title: "Resources",
                links: [
                  "Study Guides",
                  "Past Papers",
                  "Model Answers",
                  "Video Lessons",
                ],
              },
              {
                title: "Platform",
                links: [
                  "Leaderboard",
                  "Profile",
                  "Progress Reports",
                  "Notifications",
                ],
              },
              {
                title: "Support",
                links: ["Help Center", "Contact Us", "Feedback", "FAQ"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs uppercase tracking-widest text-gold font-bold mb-3">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        className="text-xs text-lavender hover:text-foreground transition-colors"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
            <p className="text-xs text-lavender">
              © {new Date().getFullYear()}.{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                Built with ❤️ using caffeine.ai
              </a>
            </p>
            <div className="flex gap-3">
              {SOCIAL_ICONS.map(({ name, Icon }) => (
                <a
                  key={name}
                  href="https://caffeine.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-purple-mid/30 flex items-center justify-center text-lavender hover:text-gold hover:bg-purple-mid/60 transition-all"
                  aria-label={name}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Quiz Modal */}
      {activeQuiz && (
        <QuizModal
          subject={activeQuiz}
          grade={grade}
          open={!!activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onComplete={handleQuizComplete}
        />
      )}

      {/* Continue Learning Modal */}
      {selectedSubject && (
        <ContinueLearningModal
          subject={selectedSubject}
          grade={grade}
          open={!!selectedSubject}
          onClose={() => setSelectedSubject(null)}
        />
      )}
    </div>
  );
}
