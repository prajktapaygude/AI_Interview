import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchQuestionsByLanguage, languageCategories, fetchAdminTest, submitAdminTest } from '../services/quizApi';
import { useTheme } from '../ThemeContext';
import { useAdmin } from '../admin/AdminContext'; // Use your existing admin context for user token
import BASE_URL from '../config';

const QuizPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = useParams(); // For admin tests
  const { isDarkMode } = useTheme();
  const { token, user } = useAdmin(); // Get token from your admin context
  
  const language = location.state?.language || 'javascript';
  const isAdminTest = !!testId; // Check if this is a test from admin
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [testInfo, setTestInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Timer for admin tests
  useEffect(() => {
    if (timeLeft > 0 && !showResults && isAdminTest) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, showResults, isAdminTest]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isAdminTest && token) {
        // Load admin-created test
        console.log(`Loading admin test: ${testId}`);
        const testData = await fetchAdminTest(testId, token);
        setTestInfo(testData.testInfo);
        setQuestions(testData.questions);
        setTimeLeft(testData.testInfo.duration * 60);
        console.log('Loaded admin test:', testData.testInfo.title);
      } else {
        // Load static questions from quiz API
        console.log(`Loading static questions for language: ${language}`);
        const data = await fetchQuestionsByLanguage(language, 20);
        
        if (!data || data.length === 0) {
          setError(`No questions found for ${languageCategories[language] || language}. Please try another language.`);
        } else {
          setQuestions(data);
          console.log(`Successfully loaded ${data.length} static questions`);
        }
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      const errorMessage = err.message || 'Failed to load questions. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [language, retryCount, testId, token]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setResult(null);
  };

  const handleAnswerSelect = (answerKey) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerKey
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = questions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0 && !showConfirmSubmit) {
      setShowConfirmSubmit(true);
      return;
    }
    
    if (isAdminTest && token) {
      // Submit admin test
      setSubmitting(true);
      try {
        const resultData = await submitAdminTest(testId, selectedAnswers, (testInfo.duration * 60) - timeLeft, token);
        setResult(resultData);
        setShowResults(true);
      } catch (err) {
        console.error('Failed to submit test:', err);
        alert('Failed to submit test. Please try again.');
      } finally {
        setSubmitting(false);
      }
    } else {
      // Submit static quiz
      setShowResults(true);
    }
  };

  const forceSubmit = () => {
    setShowConfirmSubmit(false);
    handleSubmit();
  };

  const calculateScore = () => {
    if (isAdminTest && result) {
      return {
        score: result.score,
        correct: result.correctAnswers,
        incorrect: result.incorrectAnswers,
        total: result.totalQuestions,
        percentage: result.score,
        isPassed: result.isPassed,
        results: result.results
      };
    }
    
    // Static quiz scoring
    let correct = 0;
    questions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      if (selectedAnswer && question.correct_answers && question.correct_answers[selectedAnswer] === "true") {
        correct++;
      } else if (selectedAnswer && question.correctAnswer === selectedAnswer) {
        correct++;
      }
    });
    const percentage = Math.round((correct / questions.length) * 100);
    return {
      score: percentage,
      correct,
      incorrect: questions.length - correct,
      total: questions.length,
      percentage,
      isPassed: percentage >= (testInfo?.passingScore || 70),
      results: []
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLanguageColor = (lang) => {
    const colors = {
      javascript: '#f7df1e',
      python: '#3776ab',
      java: '#007396',
      react: '#61dafb',
      sql: '#4479a1',
      cpp: '#00599c',
      angular: '#dd0031',
      vue: '#4fc08d',
      php: '#777bb4',
      typescript: '#3178c6',
      swift: '#fa7343',
      kotlin: '#7f52ff'
    };
    return colors[lang] || 'var(--color-primary)';
  };

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  const getAnswerKeys = (question) => {
    if (isAdminTest) {
      return question.options;
    }
    // For static questions
    return Object.keys(question.answers).filter(key => question.answers[key]);
  };

  const getQuestionText = (question) => {
    if (isAdminTest) {
      return question.question;
    }
    return question.question;
  };

  const getAnswerText = (question, answerKey) => {
    if (isAdminTest) {
      return answerKey;
    }
    return question.answers[answerKey];
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center"
           style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-code text-3xl" style={{ color: 'var(--color-primary)' }}></i>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {isAdminTest ? 'Loading Test...' : 'Loading Questions'}
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {isAdminTest ? 'Preparing your quiz...' : `Preparing your ${languageCategories[language] || language} quiz...`}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4"
           style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <i className="fas fa-exclamation-circle text-5xl text-red-500"></i>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Oops! Something went wrong
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={handleRetry}
              className="px-6 py-3 rounded-full text-white font-medium transition-all hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2"
              style={{ 
                background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
              }}
            >
              <i className="fas fa-redo"></i>
              Try Again
            </button>
            <button 
              onClick={() => navigate('/practice')}
              className="px-6 py-3 rounded-full font-medium transition-all hover:-translate-y-1 border flex items-center justify-center gap-2"
              style={{ 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-secondary)'
              }}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const scoreData = calculateScore();
    const isPassed = scoreData.isPassed;
    const scorePercentage = scoreData.percentage;

    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4"
           style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-2xl w-full">
          <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-8 transition-all duration-500 hover:shadow-3xl animate-slideUp"
               style={{ 
                 backgroundColor: 'var(--color-bg-secondary)',
                 border: `1px solid ${'var(--color-primary)'}20`,
                 boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
               }}>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black mb-2"
                  style={{ color: 'var(--color-text-primary)' }}>
                Quiz <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Complete!</span>
              </h2>
              {testInfo && (
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {testInfo.title}
                </p>
              )}
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mt-4"></div>
            </div>

            {/* Score Circle */}
            <div className="relative w-40 h-40 mx-auto mb-8">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={`${'var(--color-primary)'}10`}
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={`url(#gradient)`}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${scorePercentage * 2.83} 283`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-secondary)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black" style={{ color: 'var(--color-text-primary)' }}>{Math.round(scorePercentage)}%</span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Score</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
                <span className="block text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>{scoreData.correct}</span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Correct</span>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${'var(--color-secondary)'}10` }}>
                <span className="block text-2xl font-bold mb-1" style={{ color: 'var(--color-secondary)' }}>{scoreData.incorrect}</span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Incorrect</span>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${'var(--color-accent)'}10` }}>
                <span className="block text-2xl font-bold mb-1" style={{ color: 'var(--color-accent)' }}>{scoreData.total}</span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total</span>
              </div>
            </div>

            {/* Pass/Fail Message */}
            <div className={`text-center mb-8 p-4 rounded-xl ${
              isPassed ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              <p className="text-lg font-medium" style={{ 
                color: isPassed ? '#10b981' : '#ef4444'
              }}>
                {isPassed 
                  ? (testInfo?.passingScore 
                      ? `🎉 Congratulations! You passed with ${Math.round(scorePercentage)}% (Required: ${testInfo.passingScore}%)` 
                      : '🎉 Excellent work! You\'ve mastered this topic!')
                  : (testInfo?.passingScore
                      ? `📚 You scored ${Math.round(scorePercentage)}%. Need ${testInfo.passingScore}% to pass. Keep practicing!`
                      : '📚 Keep learning! Practice more to get better.')}
              </p>
            </div>

            {/* Question Review for Admin Tests */}
            {isAdminTest && result?.results && (
              <div className="mb-8 max-h-96 overflow-y-auto space-y-4">
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Question Review
                </h3>
                {result.results.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: q.isCorrect ? '#10b981' : '#ef4444' }}>
                    <p className="font-medium mb-2">{idx + 1}. {q.questionText}</p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Your answer:</span>{' '}
                      <span style={{ color: q.isCorrect ? '#10b981' : '#ef4444' }}>{q.userAnswer || 'Not answered'}</span>
                    </p>
                    {!q.isCorrect && (
                      <p className="text-sm text-green-600">
                        <span className="font-medium">Correct answer:</span> {q.correctAnswer}
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-xs mt-2 opacity-70">{q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={handleRetry}
                className="px-6 py-3 rounded-full text-white font-medium transition-all hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2"
                style={{ 
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                }}
              >
                <i className="fas fa-redo"></i>
                {isAdminTest ? 'Retry Test' : 'Retry Quiz'}
              </button>
              <button 
                onClick={() => navigate(isAdminTest ? '/dashboard' : '/practice')}
                className="px-6 py-3 rounded-full font-medium transition-all hover:-translate-y-1 border flex items-center justify-center gap-2"
                style={{ 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-bg-secondary)'
                }}
              >
                <i className="fas fa-arrow-left"></i>
                Back to {isAdminTest ? 'Dashboard' : 'Practice'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const answerKeys = getAnswerKeys(currentQ);

  return (
    <div className="min-h-screen bg-bg-primary transition-colors duration-300 p-4 md:p-6 lg:p-8"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="max-w-md w-full rounded-2xl shadow-2xl p-6 animate-slideUp"
               style={{ 
                 backgroundColor: 'var(--color-bg-secondary)',
                 border: `1px solid ${'var(--color-primary)'}20`
               }}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${'var(--color-accent)'}10` }}>
                <i className="fas fa-question-circle text-3xl" style={{ color: 'var(--color-accent)' }}></i>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Submit {isAdminTest ? 'Test' : 'Quiz'}?
              </h3>
              <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                You have {questions.length - answeredCount} unanswered question{questions.length - answeredCount !== 1 ? 's' : ''}. 
                Are you sure you want to submit?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-6 py-2 rounded-full font-medium transition-all border"
                  style={{ 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={forceSubmit}
                  disabled={submitting}
                  className="px-6 py-2 rounded-full text-white font-medium transition-all disabled:opacity-50"
                  style={{ 
                    background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                  }}
                >
                  {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Submit Anyway'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <button 
            onClick={() => navigate(isAdminTest ? '/dashboard' : '/practice')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:-translate-x-1 group border"
            style={{ 
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-secondary)'
            }}
          >
            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"
               style={{ color: 'var(--color-primary)' }}></i>
            <span>Back to {isAdminTest ? 'Dashboard' : 'Practice'}</span>
          </button>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Test Title for Admin Tests */}
            {testInfo && (
              <div className="px-4 py-2 rounded-full" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {testInfo.title}
                </span>
              </div>
            )}

            {/* Timer for Admin Tests */}
            {isAdminTest && timeLeft > 0 && (
              <div className={`px-4 py-2 rounded-full ${timeLeft < 300 ? 'animate-pulse' : ''}`}
                   style={{ backgroundColor: timeLeft < 300 ? '#ef444420' : `${'var(--color-primary)'}10` }}>
                <span className="text-sm font-medium" style={{ color: timeLeft < 300 ? '#ef4444' : 'var(--color-primary)' }}>
                  <i className="far fa-clock mr-2"></i>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}

            {/* Progress */}
            <div className="px-4 py-2 rounded-full" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                <span style={{ color: 'var(--color-primary)' }}>{currentQuestion + 1}</span>/{questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 rounded-full mb-8" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
          <div 
            className="h-full rounded-full transition-all duration-300 relative group"
            style={{ 
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`,
            }}
          >
            <span className="absolute -top-6 right-0 text-xs font-medium px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
        </div>

        {/* Answered Counter */}
        <div className="flex justify-end mb-2">
          <span className="text-sm px-3 py-1 rounded-full"
                style={{ backgroundColor: `${'var(--color-primary)'}10`, color: 'var(--color-primary)' }}>
            {answeredCount} of {questions.length} answered
          </span>
        </div>

        {/* Question Card */}
        <div className="backdrop-blur-xl rounded-[40px] shadow-2xl p-6 md:p-8 mb-6 transition-all duration-500 hover:shadow-3xl"
             style={{ 
               backgroundColor: 'var(--color-bg-secondary)',
               border: `1px solid ${'var(--color-primary)'}20`,
               boxShadow: `0 20px 40px ${'var(--color-primary)'}20`
             }}>
          
          {/* Question Number */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${'var(--color-primary)'}10`, color: 'var(--color-primary)' }}>
              Question {currentQuestion + 1}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl md:text-2xl font-bold mb-6 leading-relaxed"
              style={{ color: 'var(--color-text-primary)' }}>
            <span dangerouslySetInnerHTML={{ __html: getQuestionText(currentQ) }}></span>
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {answerKeys.map((answerKey, index) => {
              const isSelected = selectedAnswers[currentQuestion] === answerKey;
              return (
                <button
                  key={answerKey}
                  onClick={() => handleAnswerSelect(answerKey)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 group hover:-translate-y-0.5 ${
                    isSelected ? 'selected scale-[1.02]' : ''
                  }`}
                  style={{ 
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: isSelected ? `${'var(--color-primary)'}10` : 'transparent',
                    boxShadow: isSelected ? `0 10px 20px -10px var(--color-primary)` : 'none'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                      isSelected ? 'text-white' : ''
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? 'var(--color-primary)' : `${'var(--color-primary)'}10`,
                      color: isSelected ? 'white' : 'var(--color-primary)'
                    }}>
                      {getOptionLetter(index)}
                    </span>
                    <span className="flex-1 text-base" style={{ color: 'var(--color-text-primary)' }}>
                      <span dangerouslySetInnerHTML={{ __html: getAnswerText(currentQ, answerKey) }}></span>
                    </span>
                    {isSelected && (
                      <i className="fas fa-check-circle text-xl" style={{ color: 'var(--color-primary)' }}></i>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-8">
          <button 
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            className="px-6 py-3 rounded-full font-medium transition-all duration-300 hover:-translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border"
            style={{ 
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-secondary)'
            }}
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 rounded-full text-white font-medium transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              style={{ 
                background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
              }}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Submitting...
                </>
              ) : (
                <>
                  Submit {isAdminTest ? 'Test' : 'Quiz'}
                  <i className="fas fa-check-circle"></i>
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={handleNextQuestion}
              className="px-6 py-3 rounded-full font-medium transition-all duration-300 hover:translate-x-1 flex items-center justify-center gap-2 border"
              style={{ 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-secondary)'
              }}
            >
              Next
              <i className="fas fa-chevron-right"></i>
            </button>
          )}
        </div>

        {/* Question Dots */}
        <div className="flex flex-wrap justify-center gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentQuestion ? 'scale-125' : ''
              }`}
              style={{ 
                backgroundColor: index === currentQuestion ? 'var(--color-primary)' : 
                               selectedAnswers[index] ? 'var(--color-secondary)' : 
                               'var(--color-border)',
                boxShadow: index === currentQuestion ? `0 0 10px var(--color-primary)` : 'none'
              }}
              title={`Go to question ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes selectedPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease forwards;
        }
        
        .selected {
          animation: selectedPulse 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default QuizPage;