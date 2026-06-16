import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import LoadingSpinner from './LoadingSpinner';
import BackButton from '../components/BackButton';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminTakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { token } = useAdmin();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tests/${testId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load test');
      const data = await response.json();
      
      if (data.success) {
        setTest(data.test);
        setQuestions(data.test.questions);
      }
    } catch (err) {
      console.error('Error fetching test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const detailedResults = [];
    
    questions.forEach((question, idx) => {
      const userAnswer = answers[question._id];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;
      
      detailedResults.push({
        questionText: question.text,
        userAnswer: userAnswer || 'Not answered',
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation
      });
    });
    
    const score = (correctCount / questions.length) * 100;
    const isPassed = score >= (test?.passingScore || 70);
    
    setResult({
      score: Math.round(score),
      correctAnswers: correctCount,
      incorrectAnswers: questions.length - correctCount,
      totalQuestions: questions.length,
      isPassed,
      passingScore: test?.passingScore,
      detailedResults
    });
    
    setShowResults(true);
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setResult(null);
  };

  if (loading) return <LoadingSpinner />;

  if (showResults && result) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <BackButton fallbackPath="/admin/subjects" />
          
          <div className={`mt-6 text-center p-8 rounded-2xl border-2 ${result.isPassed ? 'border-green-500' : 'border-red-500'}`}
               style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            
            {result.isPassed ? (
              <i className="fas fa-trophy text-6xl text-yellow-500 mb-4"></i>
            ) : (
              <i className="fas fa-chalkboard-teacher text-6xl text-blue-500 mb-4"></i>
            )}
            
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              {result.isPassed ? 'Great Job!' : 'Test Preview Complete'}
            </h1>
            
            <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              You scored {result.score}% ({result.correctAnswers} out of {result.totalQuestions} correct)
            </p>
            
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
                <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{result.score}%</p>
                <p className="text-sm">Score</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="mb-6 px-4 py-2 rounded-lg border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <i className="fas fa-eye mr-2"></i>
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
            
            {showAnswers && (
              <div className="mt-6 text-left">
                <h3 className="text-xl font-bold mb-4">Question Answers</h3>
                <div className="space-y-4">
                  {result.detailedResults.map((q, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${q.isCorrect ? 'border-green-500' : 'border-red-500'}`}
                         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium">Question {idx + 1}: {q.questionText}</p>
                        <span className={`text-sm font-bold ${q.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                          {q.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      <p className="text-sm mb-1">Your answer: <span className="font-mono">{q.userAnswer}</span></p>
                      <p className="text-sm mb-1">Correct answer: <span className="font-mono text-green-600">{q.correctAnswer}</span></p>
                      {q.explanation && (
                        <p className="text-sm mt-2 p-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                          <span className="font-medium">Explanation:</span> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 justify-center mt-8">
              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-lg border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                <i className="fas fa-redo mr-2"></i>
                Take Again
              </button>
              <button
                onClick={() => navigate('/admin/subjects')}
                className="px-6 py-2 rounded-lg text-white"
                style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Subjects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <BackButton fallbackPath="/admin/subjects" />
        
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {test?.title} - Admin Preview
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Take this test to review questions and answers
          </p>
          <div className="flex gap-4 mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span><i className="fas fa-question-circle mr-1"></i>{test?.totalQuestions} Questions</span>
            <span><i className="fas fa-chart-line mr-1"></i>Passing: {test?.passingScore}%</span>
            <span><i className="fas fa-tag mr-1"></i>{test?.difficulty}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{currentQuestion + 1} of {questions.length}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
            <div 
              className="h-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%`, background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))` }}
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
              {questions[currentQuestion].options?.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                    answers[questions[currentQuestion]._id] === option ? 'border-primary' : ''
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
                    className="w-4 h-4 mr-3"
                  />
                  <span style={{ color: 'var(--color-text-primary)' }}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-2 rounded-lg border disabled:opacity-50 transition-all"
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
              className="px-6 py-2 rounded-lg text-white transition-all hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, #10b981, #059669)` }}
            >
              Submit for Review
            </button>
          )}
        </div>
        
        <div className="mt-6 p-4 rounded-lg text-center" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
          <i className="fas fa-info-circle mr-2" style={{ color: 'var(--color-primary)' }}></i>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            This is an admin preview. Take the test to verify question quality before publishing to users.
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminTakeTest;