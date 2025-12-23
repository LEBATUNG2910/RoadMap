import React, { useState, useEffect, useCallback } from 'react';

// --- Types & Data ---
interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

const QUIZ_DATA: Question[] = [
  {
    id: 1,
    text: "Which hook is used for side effects in React?",
    options: ["useState", "useEffect", "useReducer", "useMemo"],
    correctAnswer: "useEffect",
  },
  {
    id: 2,
    text: "What does JSX stand for?",
    options: ["JavaScript XML", "Java Syntax Extension", "JSON Xylophone", "JavaScript Xerography"],
    correctAnswer: "JavaScript XML",
  },
  {
    id: 3,
    text: "Which company developed React?",
    options: ["Google", "Twitter", "Meta (Facebook)", "Microsoft"],
    correctAnswer: "Meta (Facebook)",
  },
];

const TIMER_LIMIT = 60; // 60 seconds per question

// --- Main Component ---
export default function QuizApp() {
  // Game Flow State
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // Interaction State
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_LIMIT);
  const [results, setResults] = useState<{question: string, userAns: string | null, correct: boolean}[]>([]);

  const currentQuestion = QUIZ_DATA[currentIndex];

  // Logic: Transition to next question
  const nextQuestion = useCallback((skipped: boolean = false) => {
    // If skipped, user loses a point per requirements
    if (skipped) {
      setScore(prev => prev - 1);
      setResults(prev => [...prev, { 
        question: currentQuestion.text, 
        userAns: "Timed Out", 
        correct: false 
      }]);
    }

    if (currentIndex < QUIZ_DATA.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(TIMER_LIMIT);
    } else {
      setGameState('finished');
    }
  }, [currentIndex, currentQuestion]);

  // Logic: Timer Effect
  useEffect(() => {
    if (gameState !== 'playing' || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          nextQuestion(true); // Automatically skip if time runs out
          return TIMER_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, selectedAnswer, nextQuestion]);

  // Logic: Answer Selection
  const handleAnswer = (option: string) => {
    if (selectedAnswer !== null) return; // Prevent double-clicking

    setSelectedAnswer(option);
    const isCorrect = option === currentQuestion.correctAnswer;
    
    if (isCorrect) setScore(prev => prev + 1);
    
    setResults(prev => [...prev, { 
      question: currentQuestion.text, 
      userAns: option, 
      correct: isCorrect 
    }]);

    // Small delay to show feedback before moving on
    setTimeout(() => {
      nextQuestion(false);
    }, 1500);
  };

  const startQuiz = () => {
    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    setResults([]);
    setTimeLeft(TIMER_LIMIT);
    setSelectedAnswer(null);
  };

  // --- UI Views ---

  // 1. Welcome View
  if (gameState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">React Mastery Quiz</h1>
          <p className="text-slate-600 mb-6">Test your knowledge of the React ecosystem! You have 60 seconds per question. Careful: skipping costs -1 point.</p>
          <button 
            onClick={startQuiz}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // 2. Quiz Playing View
  if (gameState === 'playing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        {/* Progress & Timer */}
        <div className="max-w-xl w-full flex justify-between items-center mb-4 text-sm font-medium text-slate-500">
          <span>Question {currentIndex + 1} of {QUIZ_DATA.length}</span>
          <span className={`px-3 py-1 rounded-full ${timeLeft < 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 text-slate-700'}`}>
            0:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl w-full border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-8 leading-tight">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              // Styling Logic
              let btnStyle = "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50";
              
              if (selectedAnswer) {
                if (option === currentQuestion.correctAnswer) {
                  btnStyle = "bg-green-500 text-white border-green-500 shadow-md scale-[1.02]";
                } else if (option === selectedAnswer) {
                  btnStyle = "bg-red-500 text-white border-red-500 shadow-md";
                } else {
                  btnStyle = "bg-slate-50 text-slate-400 border-slate-100 opacity-60";
                }
              }

              return (
                <button
                  key={option}
                  disabled={!!selectedAnswer}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-200 ${btnStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        
        <p className="mt-8 text-slate-400 text-sm">Score: {score}</p>
      </div>
    );
  }

  // 3. Results View
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Quiz Complete!</h2>
        <p className="text-center text-indigo-600 text-xl font-semibold mb-8">Your Score: {score} / {QUIZ_DATA.length}</p>

        <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
          {results.map((res, i) => (
            <div key={i} className={`p-4 rounded-lg border-l-4 ${res.correct ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
              <p className="text-sm font-bold text-slate-700">{res.question}</p>
              <p className="text-sm text-slate-600">Your Answer: <span className="italic">{res.userAns}</span></p>
              {!res.correct && (
                <p className="text-xs text-green-700 font-semibold mt-1">
                  Correct: {QUIZ_DATA[i].correctAnswer}
                </p>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={startQuiz}
          className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}