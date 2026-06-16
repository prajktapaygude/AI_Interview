import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../admin/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [error, setError] = useState(null);
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);
  const [isRetake, setIsRetake] = useState(false);
  const [retakeNumber, setRetakeNumber] = useState(0);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (timeLeft > 0 && !showResults && !loading && !autoSubmitTriggered && test) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!autoSubmitTriggered) {
              setAutoSubmitTriggered(true);
              handleSubmit();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, showResults, loading, autoSubmitTriggered, test]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to take this test');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      console.log('📡 Fetching test with ID:', testId);
      
      const response = await fetch(`${API_BASE_URL}/user/tests/${testId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load test');
      }
      
      if (data.success && data.test) {
        console.log('✅ Test loaded successfully:', data.test.title);
        
        setTest(data.test);
        setQuestions(data.test.questions);
        setTimeLeft((data.test.duration || 30) * 60);
        setIsRetake(data.isRetake || false);
        setRetakeNumber(data.retakeNumber || 0);
        setAttemptId(data.test.attemptId);  // ✅ store attemptId
        
        const initialAnswers = {};
        data.test.questions.forEach(q => {
          initialAnswers[q._id] = null;
        });
        setAnswers(initialAnswers);
      }
    } catch (err) {
      console.error('Error fetching test:', err);
      setError(err.message || 'Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (questionId, answer) => {
    if (!attemptId) return; // wait until attemptId is known
    
    try {
      const token = localStorage.getItem('token');
      const questionIndex = questions.findIndex(q => q._id === questionId);
      
      if (questionIndex === -1) return;
      
      await fetch(`${API_BASE_URL}/user/tests/${testId}/save-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ attemptId, questionIndex, answer })
      });
    } catch (err) {
      console.error('Error saving answer:', err);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    saveAnswer(questionId, answer);
  };

  const handleSubmit = async () => {
    if (submitting || autoSubmitTriggered) return;
    if (!attemptId) {
      alert('Test not properly initialised. Please refresh and try again.');
      return;
    }
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const answersArray = questions.map(q => answers[q._id] || null);
      
      const response = await fetch(`${API_BASE_URL}/user/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          answers: answersArray,
          attemptId,
          timeSpent: (test?.duration * 60) - timeLeft
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          score: data.score,
          correctAnswers: data.correctAnswers,
          incorrectAnswers: data.incorrectAnswers,
          totalQuestions: data.totalQuestions,
          isPassed: data.isPassed,
          passingScore: data.passingScore,
          detailedResults: data.detailedResults
        });
        setShowResults(true);
      } else {
        alert(data.error || 'Failed to submit test');
      }
    } catch (err) {
      console.error('Error submitting test:', err);
      alert('Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft < 60) return 'text-red-500 animate-pulse';
    if (timeLeft < 300) return 'text-orange-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-md w-full text-center p-8 rounded-2xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <i className="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Cannot Take Test</h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/tests')}
              className="px-6 py-2 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
            >
              Back to Tests
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 rounded-lg border transition-all hover:shadow-md"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && result) {
    const isPassed = result.isPassed;
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className={`text-center p-8 rounded-2xl border-2 ${isPassed ? 'border-green-500' : 'border-red-500'}`}
               style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            
            {isRetake && (
              <div className="mb-4 inline-block px-4 py-1 rounded-full text-sm bg-purple-500 text-white">
                <i className="fas fa-redo-alt mr-2"></i>
                Retake #{retakeNumber}
              </div>
            )}
            
            {isPassed ? (
              <>
                <i className="fas fa-trophy text-6xl text-yellow-500 mb-4"></i>
                <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Congratulations!
                </h1>
                <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  You passed the test!
                </p>
              </>
            ) : (
              <>
                <i className="fas fa-frown text-6xl text-red-500 mb-4"></i>
                <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Test Complete
                </h1>
                <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Keep practicing to improve your score!
                </p>
              </>
            )}
            
            <div className="mb-6">
              <p className="text-2xl font-bold mb-2" style={{ color: isPassed ? '#10b981' : '#ef4444' }}>
                {Math.round(result.score)}%
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {result.correctAnswers} out of {result.totalQuestions} correct
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <p className="text-2xl font-bold text-green-500">{result.correctAnswers}</p>
                <p className="text-sm">Correct</p>
              </div>
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <p className="text-2xl font-bold text-red-500">{result.incorrectAnswers}</p>
                <p className="text-sm">Incorrect</p>
              </div>
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{Math.round(result.score)}%</p>
                <p className="text-sm">Score</p>
              </div>
            </div>
            
            <div className="mb-8">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Passing Score Required: {result.passingScore}%
              </p>
              {!isPassed && (
                <p className="text-sm mt-2" style={{ color: 'var(--color-primary)' }}>
                  Need {Math.ceil(result.passingScore - result.score)}% more to pass
                </p>
              )}
            </div>
            
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm font-medium mb-4 inline-block px-4 py-2 rounded-lg hover:bg-opacity-10"
                       style={{ color: 'var(--color-primary)', backgroundColor: `${'var(--color-primary)'}10` }}>
                <i className="fas fa-list mr-2"></i>
                View Detailed Answers ({result.detailedResults?.length || 0} questions)
              </summary>
              <div className="space-y-4 mt-4 max-h-96 overflow-y-auto">
                {result.detailedResults && result.detailedResults.map((q, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${q.isCorrect ? 'border-green-500' : 'border-red-500'}`}
                       style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        Question {idx + 1}: {q.questionText}
                      </p>
                      <span className={`text-sm font-bold px-2 py-1 rounded ${q.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {q.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Your answer: <span className="font-mono">{q.userAnswer || 'Not answered'}</span>
                    </p>
                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Correct answer: <span className="font-mono text-green-600">{q.correctAnswer}</span>
                    </p>
                    {q.explanation && (
                      <p className="text-sm mt-2 p-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--color-text-secondary)' }}>
                        <span className="font-medium">Explanation:</span> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </details>
            
            <div className="flex gap-3 justify-center mt-8 flex-wrap">
              
              
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 rounded-lg text-white transition-all hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
              >
                <i className="fas fa-home mr-2"></i>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!test || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
          <p style={{ color: 'var(--color-text-secondary)' }}>No test data available</p>
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter(a => a !== null).length;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              {isRetake && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 bg-purple-500 text-white">
                  <i className="fas fa-redo-alt mr-1"></i>
                  Retake #{retakeNumber} - Fresh Questions
                </span>
              )}
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{test?.title}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{test?.description}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-mono text-xl font-bold ${getTimeColor()}`} 
                 style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <i className="far fa-clock mr-2"></i>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span><i className="fas fa-question-circle mr-1"></i>{questions.length} Questions</span>
            <span><i className="fas fa-check-circle mr-1 text-green-500"></i>{answeredCount} Answered</span>
            <span><i className="fas fa-chart-line mr-1"></i>Pass: {test?.passingScore}%</span>
            <span><i className="fas fa-tag mr-1"></i>{test?.difficulty}</span>
            <span><i className="fas fa-hourglass-half mr-1"></i>{test?.duration} minutes</span>
            {isRetake && (
              <span><i className="fas fa-magic mr-1 text-purple-500"></i>Brand new questions this attempt!</span>
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--color-text-secondary)' }}>Progress</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Question {currentQuestion + 1} of {questions.length}
              {answers[questions[currentQuestion]?._id] && ' ✓ Answered'}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${((currentQuestion + 1) / questions.length) * 100}%`, 
                background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))` 
              }}
            />
          </div>
        </div>

        {questions[currentQuestion] && (
          <div className="rounded-2xl border p-6 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                    style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
                Question {currentQuestion + 1} • {questions[currentQuestion].difficulty || test?.difficulty}
              </span>
              <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {questions[currentQuestion].text}
              </h3>
            </div>

            <div className="space-y-3">
              {questions[currentQuestion].options?.map((option, idx) => {
                const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                const formattedOption = option.startsWith(optionLetter) ? option : `${optionLetter}. ${option}`;
                
                return (
                  <label
                    key={idx}
                    className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                      answers[questions[currentQuestion]._id] === option ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''
                    }`}
                    style={{ 
                      borderColor: answers[questions[currentQuestion]._id] === option ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: 'var(--color-bg-primary)'
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${questions[currentQuestion]._id}`}
                      value={option}
                      checked={answers[questions[currentQuestion]._id] === option}
                      onChange={() => handleAnswer(questions[currentQuestion]._id, option)}
                      className="w-4 h-4 mr-3 mt-0.5 accent-primary"
                    />
                    <span style={{ color: 'var(--color-text-primary)' }} className="flex-1">{formattedOption}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between gap-3">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-2 rounded-lg border disabled:opacity-50 transition-all hover:shadow-md"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <i className="fas fa-arrow-left mr-2"></i> Previous
          </button>
          
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="px-6 py-2 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
            >
              Next <i className="fas fa-arrow-right ml-2"></i>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 rounded-lg text-white transition-all hover:shadow-lg disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, #10b981, #059669)` }}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Submit Test ({answeredCount}/{questions.length} Answered)
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            <i className="fas fa-grid-2 mr-1"></i>
            Jump to Question:
          </p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  currentQuestion === idx 
                    ? 'text-white' 
                    : answers[q._id] 
                      ? 'border-green-500 text-green-600' 
                      : ''
                }`}
                style={{
                  backgroundColor: currentQuestion === idx 
                    ? 'var(--color-primary)' 
                    : answers[q._id] 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'var(--color-bg-secondary)',
                  border: `1px solid ${currentQuestion === idx 
                    ? 'var(--color-primary)' 
                    : answers[q._id] 
                      ? '#10b981' 
                      : 'var(--color-border)'}`,
                  color: currentQuestion === idx 
                    ? 'white' 
                    : answers[q._id] 
                      ? '#10b981' 
                      : 'var(--color-text-primary)'
                }}
              >
                {idx + 1}
                {answers[q._id] && currentQuestion !== idx && (
                  <i className="fas fa-check text-[8px] ml-0.5"></i>
                )}
              </button>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <span><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span> Answered</span>
            <span><span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></span> Current</span>
            <span><span className="inline-block w-2 h-2 rounded-full border mr-1" style={{ borderColor: 'var(--color-border)' }}></span> Unanswered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;