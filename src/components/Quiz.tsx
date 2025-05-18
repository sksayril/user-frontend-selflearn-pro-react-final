import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Timer, Award, ArrowRight, RotateCcw, BookOpen, CheckCircle, X, AlertTriangle } from 'lucide-react';

const QuizApp = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Fetch quiz data from API using native fetch instead of axios
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.adhyan.guru/api/getall/quiz');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setQuizzes(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch quizzes. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setUserAnswers({});
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setUserAnswers({ ...userAnswers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (selectedAnswer === selectedQuiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1] || null);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setUserAnswers({});
  };

  const returnToQuizList = () => {
    setQuizStarted(false);
    setSelectedQuiz(null);
    setShowResult(false);
  };

  // Calculate pass/fail status
  const calculateGrade = () => {
    const percentage = (score / selectedQuiz.questions.length) * 100;
    if (percentage >= 70) {
      return { status: 'PASSED', color: 'green' };
    } else {
      return { status: 'FAILED', color: 'red' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div 
          className="p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-xl font-semibold text-gray-800">Loading Quizzes...</h2>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div 
          className="p-8 bg-white rounded-2xl shadow-xl max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Quiz Selection Screen
  if (!selectedQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        <motion.div 
  className="text-center mb-12"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <div className="flex items-center justify-center gap-3 mb-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8m-4-4v4m-6.364-7.364A9 9 0 015 9V5a2 2 0 012-2h10a2 2 0 012 2v4a9 9 0 01-1.636 5.636A7.968 7.968 0 0112 17a7.968 7.968 0 01-5.364-2.364z" />
    </svg>
    <div className="text-center mt-6">
  <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-orange-500 hover:to-yellow-400 shadow-xl transition duration-300 ease-in-out">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
    Quiz Time 
  </button>
</div>  </div>
  <p className="text-xl text-gray-600">Select a quiz to test your knowledge</p>
</motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => handleQuizSelect(quiz)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <BookOpen className="w-10 h-10 mb-2" />
                  <h2 className="text-xl font-semibold line-clamp-1">{quiz.title}</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-gray-600 mb-4">
                    <span className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      {quiz.questions.length} questions
                    </span>
                  </div>
                  <button
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuizSelect(quiz);
                    }}
                  >
                    Start Quiz <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Results Screen
  if (showResult) {
    const grade = calculateGrade();
    const questionsWithAnswers = selectedQuiz.questions.map((question, index) => ({
      ...question,
      userAnswer: userAnswers[index] || "Not answered",
      isCorrect: userAnswers[index] === question.correctAnswer
    }));

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2
                }}
              >
                {grade.status === 'PASSED' ? (
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                ) : (
                  <XCircle className="w-16 h-16 mx-auto mb-4" />
                )}
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Quiz Completed - {grade.status}!
              </motion.h2>
              <motion.p 
                className="text-lg opacity-90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {selectedQuiz.title} - Here's how you performed
              </motion.p>
            </div>
            
            <div className="p-6">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="bg-green-50 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-green-600">Correct Answers</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-red-600">{selectedQuiz.questions.length - score}</div>
                  <div className="text-sm text-red-600">Wrong Answers</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-600">{Math.round((score / selectedQuiz.questions.length) * 100)}%</div>
                  <div className="text-sm text-blue-600">Score</div>
                </div>
              </motion.div>

              <motion.div 
                className="mt-8 space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Question Review</h3>
                
                {questionsWithAnswers.map((question, index) => (
                  <motion.div 
                    key={question._id}
                    className="bg-gray-50 rounded-xl p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        {question.isCorrect ? (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="w-5 h-5 text-red-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-800 mb-2">
                          {index + 1}. {question.text}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className={`flex items-center ${question.userAnswer === question.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                            <span className="font-medium mr-2">Your answer:</span> {question.userAnswer}
                          </div>
                          {question.userAnswer !== question.correctAnswer && (
                            <div className="flex items-center text-green-600">
                              <span className="font-medium mr-2">Correct answer:</span> {question.correctAnswer}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="mt-8 flex space-x-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <button
                  onClick={resetQuiz}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={returnToQuizList}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  More Quizzes
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Taking Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Quiz Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Timer className="w-5 h-5 mr-2" />
                <span>Question {currentQuestion + 1} of {selectedQuiz.questions.length}</span>
              </motion.div>
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  Score: {score}
                </span>
              </motion.div>
            </div>
            <motion.div 
              className="w-full bg-white/20 rounded-full h-2 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.div 
                className="bg-white rounded-full h-2"
                initial={{ width: `${((currentQuestion) / selectedQuiz.questions.length) * 100}%` }}
                animate={{ width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          </div>

          {/* Question */}
          <div className="p-6">
            <motion.h2 
              className="text-xl font-semibold text-gray-800 mb-6"
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {selectedQuiz.questions[currentQuestion].text}
            </motion.h2>

            {/* Options */}
            <div className="space-y-3">
              {selectedQuiz.questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={`${currentQuestion}-${index}`}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    selectedAnswer === option
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Navigation */}
            <motion.div 
              className="mt-6 flex justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedAnswer
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentQuestion === selectedQuiz.questions.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizApp;