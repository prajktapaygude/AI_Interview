// import React, { useEffect, useState, useRef } from "react";
// import {
//   generateContinuousQuestion,
//   textToSpeech,
//   analyzeReport
// } from "../services/aiApi";

// const LiveInterview = ({ interviewData, user, onFinish }) => {
//   // Refs
//   const audioRef = useRef(null);
//   const typingIntervalRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const micStreamRef = useRef(null);
//   const askedQuestionsRef = useRef([]);
//   const questionHistoryRef = useRef(new Set());
//   const timerIntervalRef = useRef(null);
//   const startTimeRef = useRef(null);
//   const currentQuestionStartTimeRef = useRef(null);

//   // Strict sequential TTS queue
//   const isAudioPlayingRef = useRef(false);
//   const audioQueueRef = useRef([]);

//   // State
//   const [currentQuestion, setCurrentQuestion] = useState(null);
//   const [typedQuestion, setTypedQuestion] = useState("");
//   const [currentFeedback, setCurrentFeedback] = useState("");
//   const [typedFeedback, setTypedFeedback] = useState("");
//   const [questionsReady, setQuestionsReady] = useState(false);
//   const [currentAnswer, setCurrentAnswer] = useState("");
//   const [allAnswers, setAllAnswers] = useState([]);
//   const [generatingNext, setGeneratingNext] = useState(false);
//   const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [totalTimeSeconds, setTotalTimeSeconds] = useState(parseInt(interviewData?.duration || 30) * 60);
//   const [timeRemaining, setTimeRemaining] = useState(parseInt(interviewData?.duration || 30) * 60);
//   const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isSpeakingFeedback, setIsSpeakingFeedback] = useState(false);
//   const [startTime] = useState(Date.now());
//   const [interviewActive, setInterviewActive] = useState(true);
//   const [showTimeWarning, setShowTimeWarning] = useState(false);
//   const [questionCount, setQuestionCount] = useState(0);
//   const [isWaitingForQuestion, setIsWaitingForQuestion] = useState(false);
//   const [averageResponseTime, setAverageResponseTime] = useState(0);
//   const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
//   const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
//   const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
//   const [conversationHistory, setConversationHistory] = useState([]);

//   // Constants
//   const TIME_WARNING_THRESHOLD = 60;
//   const CRITICAL_TIME_THRESHOLD = 30;

//   // Timer effect
//   useEffect(() => {
//     if (!questionsReady || !interviewActive) return;
//     startTimeRef.current = Date.now();
//     timerIntervalRef.current = setInterval(() => {
//       setTimeRemaining(prev => {
//         const newTime = prev - 1;
//         if (currentQuestionStartTimeRef.current && currentQuestion) {
//           const elapsed = Math.floor((Date.now() - currentQuestionStartTimeRef.current) / 1000);
//           setCurrentQuestionTime(elapsed);
//         }
//         if (newTime <= 0) {
//           clearInterval(timerIntervalRef.current);
//           endInterview();
//           return 0;
//         }
//         if (newTime === TIME_WARNING_THRESHOLD) {
//           setShowTimeWarning(true);
//           setTimeout(() => setShowTimeWarning(false), 5000);
//         }
//         return newTime;
//       });
//     }, 1000);
//     return () => {
//       if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
//     };
//   }, [questionsReady, interviewActive, currentQuestion]);

//   // Generate first question when interview starts
//   useEffect(() => {
//     if (questionsReady && interviewActive && !currentQuestion && !generatingNext && !isWaitingForQuestion && !isProcessingAnswer) {
//       generateNextQuestion();
//     }
//   }, [questionsReady, interviewActive, currentQuestion, generatingNext, isWaitingForQuestion, isProcessingAnswer]);

//   // Cleanup typing interval on unmount
//   useEffect(() => {
//     return () => {
//       if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
//     };
//   }, []);

//   // ========== ULTRA SHORT FALLBACK QUESTIONS ==========
//   const getShortFallbackQuestion = () => {
//     const techStack = interviewData?.techStack || '';
//     const role = interviewData?.role || '';
//     const shortQuestions = {
//       react: ["What is React?", "Explain useState hook.", "What is virtual DOM?", "How do props work?", "What is JSX?", "Explain useEffect hook.", "What are React fragments?", "How does context work?"],
//       python: ["What are decorators?", "Explain list comprehension.", "What is the GIL?", "Explain async/await.", "What are generators?", "What is lambda function?", "Explain Python classes.", "What is pip?"],
//       javascript: ["What are closures?", "Explain event loop.", "Let vs var?", "Explain promises.", "What is hoisting?", "What is 'this' keyword?", "Explain arrow functions.", "What is destructuring?"],
//       html: ["What are semantic elements?", "Explain <article> tag.", "What is the DOCTYPE?", "Explain alt attribute.", "What is meta tag?", "What is canvas element?", "Explain local storage.", "What are web workers?"],
//       css: ["What is Flexbox?", "Explain CSS Grid.", "What are media queries?", "What is box model?", "Explain CSS specificity.", "What is z-index?", "Explain pseudo-classes.", "What is CSS variables?"],
//       default: [`Tell me about your ${role || 'technical'} experience.`, `What's your biggest technical challenge?`, `How do you debug code?`, `What are your best practices?`, `How do you learn new tech?`, `What tools do you use?`, `Describe your workflow.`, `How do you handle pressure?`]
//     };
//     let questionsArray = shortQuestions.default;
//     const techLower = (techStack + ' ' + role).toLowerCase();
//     for (const [key, questions] of Object.entries(shortQuestions)) {
//       if (techLower.includes(key)) {
//         questionsArray = questions;
//         break;
//       }
//     }
//     const available = questionsArray.filter(q => !questionHistoryRef.current.has(q.toLowerCase().trim()));
//     if (available.length > 0) return available[Math.floor(Math.random() * available.length)];
//     return shortQuestions.default[Math.floor(Math.random() * shortQuestions.default.length)];
//   };

//   // ========== LOCAL FALLBACK FORMATTER (used only if backend doesn't provide recruiter_feedback) ==========
//   const formatRecruiterFeedback = (evaluation, answer, question) => {
//     const score = evaluation.score || 5;
//     const strengths = evaluation.strengths || [];
//     const weaknesses = evaluation.weaknesses || [];
//     const improvements = evaluation.improvement || [];
//     if (score >= 8) {
//       const strength = strengths[0] || "Your answer is clear and correct.";
//       return `${strength} Keep it up.`;
//     } else if (score >= 5) {
//       const weakness = weaknesses[0] || "Your answer is partially correct but missing some details.";
//       const suggestion = improvements[0] || "Try to elaborate with examples.";
//       return `${weakness} ${suggestion}`;
//     } else {
//       const weakness = weaknesses[0] || "Your answer is not accurate.";
//       const suggestion = improvements[0] || "Please review the concept again.";
//       return `${weakness} ${suggestion}`;
//     }
//   };

//   // ====== Audio queue runner ======
//   const enqueueAudioJob = (jobFn) => {
//     return new Promise((resolve) => {
//       audioQueueRef.current.push({ jobFn, resolve });
//       runAudioQueue();
//     });
//   };

//   const runAudioQueue = async () => {
//     if (isAudioPlayingRef.current) return;
//     const nextJob = audioQueueRef.current[0];
//     if (!nextJob) return;
//     isAudioPlayingRef.current = true;
//     try {
//       await nextJob.jobFn();
//     } finally {
//       audioQueueRef.current.shift();
//       nextJob.resolve();
//       isAudioPlayingRef.current = false;
//       if (audioQueueRef.current.length > 0) runAudioQueue();
//     }
//   };

//   // ====== Play audio AND type simultaneously (for questions) ======
//   const playAudioAndType = (text) => {
//     if (!text) return Promise.resolve();
//     setIsPlaying(true);
//     return enqueueAudioJob(async () => {
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }

//       setTypedQuestion("");
//       let i = 0;
//       const totalLength = text.length;
//       let audioFinished = false;
//       let typingFinished = false;

//       // Start audio playback
//       let audioPromise;
//       try {
//         const { audioUrl } = await textToSpeech(text);
//         const audio = new Audio(audioUrl);
//         audioRef.current = audio;
//         audioPromise = new Promise((resolve) => {
//           audio.onended = () => {
//             audioFinished = true;
//             resolve();
//           };
//           audio.onerror = () => resolve();
//           audio.play();
//         });
//       } catch (err) {
//         console.warn("TTS error:", err);
//         audioPromise = Promise.resolve();
//         audioFinished = true;
//       }

//       // Start typing animation (fixed speed ~30ms per char)
//       const typingPromise = new Promise((resolve) => {
//         const typingSpeed = 30;
//         const interval = setInterval(() => {
//           if (i < totalLength) {
//             setTypedQuestion(text.slice(0, i + 1));
//             i++;
//           }
//           if (i >= totalLength) {
//             clearInterval(interval);
//             typingFinished = true;
//             resolve();
//           }
//         }, typingSpeed);

//         if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
//         typingIntervalRef.current = interval;
//       });

//       // Wait for both to finish
//       await Promise.all([audioPromise, typingPromise]);
//       setIsPlaying(false);
//     });
//   };

//   // ====== Display feedback with typing AND speak simultaneously ======
//   const displayAndSpeakFeedback = (text) => {
//     if (!text) return Promise.resolve();
//     setIsSpeakingFeedback(true);
//     return enqueueAudioJob(async () => {
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }

//       setCurrentFeedback(text);
//       setTypedFeedback("");
//       let i = 0;
//       const totalLength = text.length;
//       let audioFinished = false;
//       let typingFinished = false;

//       // Start audio playback
//       let audioPromise;
//       try {
//         const { audioUrl } = await textToSpeech(text);
//         const audio = new Audio(audioUrl);
//         audioRef.current = audio;
//         audioPromise = new Promise((resolve) => {
//           audio.onended = () => {
//             audioFinished = true;
//             resolve();
//           };
//           audio.onerror = () => resolve();
//           audio.play();
//         });
//       } catch (err) {
//         console.warn("TTS error:", err);
//         audioPromise = Promise.resolve();
//         audioFinished = true;
//       }

//       // Start typing animation
//       const typingPromise = new Promise((resolve) => {
//         const typingSpeed = 30;
//         const interval = setInterval(() => {
//           if (i < totalLength) {
//             setTypedFeedback(text.slice(0, i + 1));
//             i++;
//           }
//           if (i >= totalLength) {
//             clearInterval(interval);
//             typingFinished = true;
//             resolve();
//           }
//         }, typingSpeed);

//         if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
//         typingIntervalRef.current = interval;
//       });

//       // Wait for both to finish
//       await Promise.all([audioPromise, typingPromise]);

//       // Clear feedback after both complete (with small delay)
//       await new Promise(resolve => setTimeout(resolve, 300));
//       setCurrentFeedback("");
//       setTypedFeedback("");
//       setIsSpeakingFeedback(false);
//     });
//   };

//   // ----- Generate next question -----
//   const generateNextQuestion = async (lastAnswer = null) => {
//     if (generatingNext || !interviewActive) return;
//     setGeneratingNext(true);
//     setIsWaitingForQuestion(true);
//     try {
//       const askedQuestions = Array.from(askedQuestionsRef.current);
//       const response = await generateContinuousQuestion(
//         interviewData?.role,
//         sessionId,
//         interviewData?.techStack,
//         interviewData?.level,
//         interviewData?.difficulty,
//         askedQuestions,
//         lastAnswer,
//         conversationHistory
//       );
//       let newQuestion = null;
//       if (response?.question) newQuestion = response.question;
//       else if (response?.questions && response.questions.length > 0) newQuestion = response.questions[0];
//       if (newQuestion) {
//         const wordCount = newQuestion.split(' ').length;
//         const normalized = newQuestion.toLowerCase().trim();
//         if (wordCount > 12 || questionHistoryRef.current.has(normalized)) newQuestion = getShortFallbackQuestion();
//       } else newQuestion = getShortFallbackQuestion();
//       if (newQuestion.split(' ').length > 12) newQuestion = getShortFallbackQuestion();
//       const normalizedNew = newQuestion.toLowerCase().trim();
//       questionHistoryRef.current.add(normalizedNew);
//       askedQuestionsRef.current.push(newQuestion);
//       setConversationHistory(prev => [...prev, { role: "assistant", content: newQuestion }]);
//       setCurrentQuestion(newQuestion);
//       setTypedQuestion("");
//       setQuestionCount(prev => prev + 1);
//       currentQuestionStartTimeRef.current = Date.now();
//       setCurrentQuestionTime(0);
//       await playAudioAndType(newQuestion);
//     } catch (err) {
//       console.error("Error generating continuous question:", err);
//       const fallback = getShortFallbackQuestion();
//       const normalizedFallback = fallback.toLowerCase().trim();
//       if (!questionHistoryRef.current.has(normalizedFallback)) {
//         questionHistoryRef.current.add(normalizedFallback);
//         askedQuestionsRef.current.push(fallback);
//       }
//       setCurrentQuestion(fallback);
//       currentQuestionStartTimeRef.current = Date.now();
//       await playAudioAndType(fallback);
//     } finally {
//       setGeneratingNext(false);
//       setIsWaitingForQuestion(false);
//     }
//   };

//   // ----- Process current answer: evaluate, give feedback, then ask next -----
//   const processAnswerAndGetNext = async () => {
//     if (!currentAnswer.trim() || !currentQuestion || isProcessingAnswer) return;
//     setIsProcessingAnswer(true);
//     if (isRecording && mediaRecorderRef.current) stopRecording();
//     const responseTime = currentQuestionStartTimeRef.current
//       ? Math.floor((Date.now() - currentQuestionStartTimeRef.current) / 1000)
//       : 0;

//     // Evaluate answer
//     let evaluation = null;
//     try {
//       const userId = user?.id || 'guest';
//       const evalResponse = await fetch('http://localhost:8000/evaluate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           Id: sessionId,
//           userId: userId,
//           role: interviewData?.role,
//           question: currentQuestion,
//           answer: currentAnswer
//         })
//       });
//       const evalData = await evalResponse.json();
//       evaluation = evalData.evaluation;
//     } catch (err) {
//       console.warn("Evaluation API failed, using fallback", err);
//       evaluation = { score: 5, strengths: ["Answer provided"], weaknesses: ["Could be improved"] };
//     }

//     let feedbackText = evaluation.recruiter_feedback;
//     if (!feedbackText) feedbackText = formatRecruiterFeedback(evaluation, currentAnswer, currentQuestion);
//     const shouldRepeatQuestion = evaluation.repeat_question === true;
//     const questionToRepeat = currentQuestion;
//     const lastAnswerText = currentAnswer;

//     // Save answer with evaluation INCLUDING feedbackSpoken
//     const answerObj = {
//       question: currentQuestion,
//       answer: currentAnswer,
//       timestamp: new Date().toISOString(),
//       responseTime: responseTime,
//       evaluation: {
//         ...evaluation,
//         feedbackSpoken: feedbackText
//       }
//     };
//     setAllAnswers(prev => [...prev, answerObj]);
//     setConversationHistory(prev => [...prev, { role: "user", content: currentAnswer }]);

//     // Clear UI for answer input and question
//     setCurrentAnswer("");
//     setCurrentQuestion(null);
//     setTypedQuestion("");
//     setCurrentQuestionTime(0);

//     // Show feedback with typing AND speak simultaneously
//     await displayAndSpeakFeedback(feedbackText);

//     // Next or repeat question
//     if (shouldRepeatQuestion) {
//       setCurrentQuestion(questionToRepeat);
//       setTypedQuestion("");
//       currentQuestionStartTimeRef.current = Date.now();
//       setCurrentQuestionTime(0);
//       await playAudioAndType(questionToRepeat);
//       setIsProcessingAnswer(false);
//     } else {
//       await generateNextQuestion(lastAnswerText);
//       setIsProcessingAnswer(false);
//     }

//     setShowSubmitConfirmation(true);
//     setTimeout(() => setShowSubmitConfirmation(false), 1500);
//   };

//   // ----- End interview (triggers batch evaluation and report) -----
//   const endInterview = async () => {
//     if (!interviewActive) return;
//     setInterviewActive(false);
//     if (audioRef.current) audioRef.current.pause();
//     if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
//     if (currentAnswer.trim() && currentQuestion) {
//       const responseTime = currentQuestionStartTimeRef.current
//         ? Math.floor((Date.now() - currentQuestionStartTimeRef.current) / 1000)
//         : 0;
//       const answerObj = {
//         question: currentQuestion,
//         answer: currentAnswer,
//         timestamp: new Date().toISOString(),
//         responseTime: responseTime
//       };
//       setAllAnswers(prev => [...prev, answerObj]);
//     }
//     const totalResponseTime = allAnswers.reduce((sum, a) => sum + (a.responseTime || 0), 0);
//     const avgTime = allAnswers.length > 0 ? Math.round(totalResponseTime / allAnswers.length) : 0;
//     setAverageResponseTime(avgTime);
//     if (allAnswers.length > 0 || currentAnswer.trim()) {
//       await performBatchEvaluation();
//     } else {
//       onFinish({
//         score: 0,
//         technical: 0,
//         clarity: 0,
//         confidence: 0,
//         role: interviewData?.role,
//         level: interviewData?.level || "Mid-Level",
//         totalQuestions: 0,
//         answered: 0,
//         averageResponseTime: 0,
//         evaluations: [],
//         answers: []
//       });
//     }
//   };

//   // ----- Batch evaluation & reporting (keep your existing logic, only slight adapt) -----
//   const calculateSmartScore = (answer, question) => {
//     let score = 5;
//     const length = answer.length;
//     if (length > 200) score += 2;
//     else if (length > 100) score += 1;
//     else if (length < 30) score -= 2;
//     if (answer.includes('example') || answer.includes('for instance')) score += 1;
//     if (answer.includes('because') || answer.includes('therefore')) score += 1;
//     const keywords = question.toLowerCase().split(' ').filter(w => w.length > 4);
//     const matched = keywords.filter(kw => answer.toLowerCase().includes(kw)).length;
//     if (keywords.length > 0) score += (matched / keywords.length) * 2;
//     return Math.min(10, Math.max(1, Math.round(score)));
//   };

//   const saveInterviewToDatabase = async (evaluatedAnswers, finalReport) => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) return;
//       const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
//       const payload = {
//         role: interviewData?.role,
//         position: interviewData?.role,
//         techStack: interviewData?.techStack,
//         level: interviewData?.level,
//         difficulty: interviewData?.difficulty,
//         questions: evaluatedAnswers.map((item, idx) => ({
//           question: item.question,
//           userAnswer: item.answer,
//           idealAnswer: '',
//           score: (item.evaluation?.score || 5) * 10,
//           responseTime: item.responseTime || 0,
//           feedback: {
//             strengths: item.evaluation?.strengths || [],
//             improvements: item.evaluation?.weaknesses || [],
//             suggestions: item.evaluation?.improvement || []
//           },
//           keywords: [],
//           timeTaken: item.responseTime || 0
//         })),
//         overallScore: finalReport.score,
//         technicalScore: finalReport.technical,
//         clarityScore: finalReport.clarity,
//         confidenceScore: finalReport.confidence,
//         averageResponseTime: averageResponseTime,
//         duration: durationSeconds,
//         totalQuestionsAnswered: evaluatedAnswers.length
//       };
//       const response = await fetch('http://localhost:5000/api/interview/save-session', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//         body: JSON.stringify(payload)
//       });
//       if (response.ok) console.log('✅ Interview session saved to DB');
//     } catch (err) { console.error('❌ Save error:', err); }
//   };

//   const performBatchEvaluation = async () => {
//     setIsBatchEvaluating(true);
//     try {
//       const userId = user?.id || 'guest';
//       const questionsList = allAnswers.map(a => a.question);
//       const answersList = allAnswers.map(a => a.answer);
//       let evaluations = [];
//       try {
//         const response = await fetch('http://localhost:8000/batch-evaluate', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             Id: sessionId,
//             userId: userId,
//             role: interviewData?.role,
//             techStack: interviewData?.techStack,
//             level: interviewData?.level,
//             questions: questionsList,
//             answers: answersList
//           })
//         });
//         const data = await response.json();
//         evaluations = data.evaluations || [];
//       } catch (err) { console.warn('AI backend failed, using fallback scoring', err); }
//       const finalEvaluations = allAnswers.map((answer, idx) => {
//         const aiEval = evaluations[idx];
//         if (aiEval && aiEval.score && aiEval.score > 2) return aiEval;
//         const smartScore = calculateSmartScore(answer.answer, answer.question);
//         return {
//           score: smartScore,
//           relevance_score: smartScore,
//           accuracy_score: smartScore,
//           communication_score: smartScore,
//           strengths: smartScore >= 7 ? ['Good detail'] : (smartScore >= 5 ? ['Answered'] : []),
//           weaknesses: smartScore < 5 ? ['Too brief'] : (smartScore < 7 ? ['Add more detail'] : []),
//           improvement: ['Provide examples and technical depth'],
//           answer_quality: smartScore >= 7 ? 'good' : smartScore >= 5 ? 'average' : 'poor',
//           responseTime: answer.responseTime || 0
//         };
//       });
//       const evaluatedAnswers = allAnswers.map((answer, index) => ({
//         ...answer,
//         evaluation: finalEvaluations[index],
//         responseTime: answer.responseTime || 0
//       }));
//       await generateFinalReport(evaluatedAnswers);
//     } catch (error) {
//       console.error("Batch evaluation error:", error);
//       const dummyEvals = allAnswers.map(a => ({
//         score: calculateSmartScore(a.answer, a.question),
//         strengths: ['Answered'],
//         weaknesses: ['Could be more detailed'],
//         improvement: ['Practice structuring answers'],
//         answer_quality: 'average'
//       }));
//       const evaluatedAnswers = allAnswers.map((a, i) => ({ ...a, evaluation: dummyEvals[i] }));
//       await generateFinalReport(evaluatedAnswers);
//     }
//   };

//   const generateFinalReport = async (evaluatedAnswers) => {
//     try {
//       setIsAnalyzing(true);
//       const userId = user?.id || 'guest';
//       const result = await analyzeReport(
//         sessionId,
//         interviewData?.role,
//         evaluatedAnswers.map(a => a.question),
//         evaluatedAnswers,
//         userId
//       );
//       const avgScore = evaluatedAnswers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / evaluatedAnswers.length;
//       const avgTechnical = evaluatedAnswers.reduce((sum, a) => sum + (a.evaluation?.accuracy_score || a.evaluation?.score || 0), 0) / evaluatedAnswers.length;
//       const avgClarity = evaluatedAnswers.reduce((sum, a) => sum + (a.evaluation?.relevance_score || a.evaluation?.score || 0), 0) / evaluatedAnswers.length;
//       const avgConfidence = evaluatedAnswers.reduce((sum, a) => sum + (a.evaluation?.communication_score || a.evaluation?.score || 0), 0) / evaluatedAnswers.length;
//       const report = {
//         score: result?.score || Math.round(avgScore * 10),
//         technical: result?.technical || Math.round(avgTechnical * 10),
//         clarity: result?.clarity || Math.round(avgClarity * 10),
//         confidence: result?.confidence || Math.round(avgConfidence * 10),
//         role: interviewData?.role,
//         level: interviewData?.level || "Mid-Level",
//         totalQuestions: evaluatedAnswers.length,
//         answered: evaluatedAnswers.length,
//         averageResponseTime: averageResponseTime,
//         evaluations: evaluatedAnswers.map(a => a.evaluation),
//         answers: evaluatedAnswers
//       };
//       await saveInterviewToDatabase(evaluatedAnswers, report);
//       onFinish(report);
//     } catch (error) {
//       console.error("Report generation error:", error);
//       const avgScore = evaluatedAnswers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / evaluatedAnswers.length;
//       const fallbackReport = {
//         score: Math.round(avgScore * 10),
//         technical: Math.round(avgScore * 10),
//         clarity: Math.round(avgScore * 10),
//         confidence: Math.round(avgScore * 10),
//         role: interviewData?.role,
//         level: interviewData?.level || "Mid-Level",
//         totalQuestions: evaluatedAnswers.length,
//         answered: evaluatedAnswers.length,
//         averageResponseTime: averageResponseTime,
//         evaluations: evaluatedAnswers.map(a => a.evaluation || {}),
//         answers: evaluatedAnswers
//       };
//       await saveInterviewToDatabase(evaluatedAnswers, fallbackReport);
//       onFinish(fallbackReport);
//     }
//     setIsAnalyzing(false);
//     setIsBatchEvaluating(false);
//   };

//   // ----- UI helper functions -----
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const getTimeColor = () => {
//     if (timeRemaining <= CRITICAL_TIME_THRESHOLD) return '#ef4444';
//     if (timeRemaining <= TIME_WARNING_THRESHOLD) return '#f59e0b';
//     return 'var(--color-primary)';
//   };

//   const getTimePercentage = () => {
//     return (timeRemaining / totalTimeSeconds) * 100;
//   };

//   const startInterview = () => {
//     setQuestionsReady(true);
//     setInterviewActive(true);
//     setTimeRemaining(totalTimeSeconds);
//     setQuestionCount(0);
//     setAllAnswers([]);
//     setAverageResponseTime(0);
//     setConversationHistory([]);
//     askedQuestionsRef.current = [];
//     questionHistoryRef.current.clear();
//   };

//   // ----- Recording functions -----
//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       micStreamRef.current = stream;
//       const recorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = recorder;
//       audioChunksRef.current = [];
//       recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
//       recorder.start();
//       setIsRecording(true);
//     } catch (err) {
//       console.log("Mic error:", err);
//       alert("Microphone access denied. Please type your answers.");
//     }
//   };

//   const stopRecording = async () => {
//     if (!mediaRecorderRef.current) return;
//     const recorder = mediaRecorderRef.current;
//     recorder.stop();
//     recorder.onstop = async () => {
//       const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
//       const formData = new FormData();
//       formData.append("audio", audioBlob, "answer.webm");
//       try {
//         const response = await fetch("http://127.0.0.1:8000/stt", {
//           method: "POST",
//           body: formData
//         });
//         const data = await response.json();
//         setCurrentAnswer(data.text);
//       } catch (err) {
//         console.log("STT error:", err);
//       }
//       if (micStreamRef.current) {
//         micStreamRef.current.getTracks().forEach(t => t.stop());
//       }
//     };
//     setIsRecording(false);
//   };

//   const submitAnswer = async () => {
//     if (!currentAnswer.trim()) {
//       alert("Please provide an answer before continuing.");
//       return;
//     }
//     if (isProcessingAnswer) return;
//     await processAnswerAndGetNext();
//   };

//   // ----- Render logic (loading states, setup screen, live interview) -----
//   if (isBatchEvaluating || isAnalyzing) {
//     return (
//       <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
//         <div className="relative">
//           <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <i className="fas fa-brain text-primary text-2xl animate-pulse"></i>
//           </div>
//         </div>
//         <p className="mt-6 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
//           {isBatchEvaluating ? 'Evaluating your responses...' : 'Generating comprehensive report...'}
//         </p>
//         <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
//           Questions answered: {allAnswers.length}
//         </p>
//         <div className="mt-4 w-48 h-1 bg-primary/20 rounded-full overflow-hidden">
//           <div className="h-full w-3/4 bg-primary rounded-full animate-progress"></div>
//         </div>
//       </div>
//     );
//   }

//   if (!questionsReady) {
//     return (
//       <div className="flex flex-col items-center justify-center py-8 sm:py-12 animate-fadeIn">
//         <div className="max-w-md w-full mx-auto text-center">
//           <div className="relative mb-6">
//             <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-2xl"
//                  style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
//               <i className="fas fa-clipboard-list text-white text-4xl"></i>
//             </div>
//             <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg animate-bounce">
//               <i className="fas fa-microphone-alt text-white text-xs"></i>
//             </div>
//           </div>
//           <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Technical Assessment</h2>
//           <p className="text-sm sm:text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>Let's assess your technical skills and interview readiness</p>
//           <div className="grid grid-cols-2 gap-3 mb-8">
//             <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//               <i className="fas fa-briefcase text-primary text-xl mb-2 block"></i>
//               <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Role</p>
//               <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.role}</p>
//             </div>
//             <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//               <i className="fas fa-code text-secondary text-xl mb-2 block"></i>
//               <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tech Stack</p>
//               <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.techStack}</p>
//             </div>
//             <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//               <i className="fas fa-hourglass-half text-accent text-xl mb-2 block"></i>
//               <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Duration</p>
//               <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.duration} minutes</p>
//             </div>
//             <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//               <i className="fas fa-chart-line text-primary text-xl mb-2 block"></i>
//               <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Level</p>
//               <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.level}</p>
//             </div>
//           </div>
//           <div className="p-5 rounded-xl border mb-8 text-left" style={{ backgroundColor: `${'var(--color-primary)'}05`, borderColor: `${'var(--color-primary)'}20` }}>
//             <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
//               <i className="fas fa-info-circle text-primary"></i> Assessment Format
//             </h3>
//             <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
//               <li className="flex items-center gap-2"><i className="fas fa-infinity text-primary text-xs"></i> Continuous question generation</li>
//               <li className="flex items-center gap-2"><i className="fas fa-stopwatch text-primary text-xs"></i> Time-bound assessment</li>
//               <li className="flex items-center gap-2"><i className="fas fa-microphone-alt text-primary text-xs"></i> Voice or text responses</li>
//               <li className="flex items-center gap-2"><i className="fas fa-chat text-primary text-xs"></i> Real‑time recruiter feedback</li>
//             </ul>
//           </div>
//           <button onClick={startInterview} className="relative px-8 py-3 rounded-xl font-semibold text-white overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 group" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
//             <span className="relative flex items-center gap-2"><i className="fas fa-play"></i> Begin Assessment</span>
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ======================= LIVE INTERVIEW UI =======================
//   return (
//     <div className="animate-fadeIn relative">
//       <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
//         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
//       </div>

//       {/* Header Bar with Metrics */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
//         <div className="flex flex-wrap gap-4">
//           <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
//             <i className="fas fa-check-circle text-primary text-sm"></i>
//             <div>
//               <p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Answered</p>
//               <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{allAnswers.length}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-secondary)'}10` }}>
//             <i className="fas fa-question-circle text-secondary text-sm"></i>
//             <div>
//               <p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Current</p>
//               <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>#{questionCount}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-accent)'}10` }}>
//             <i className="fas fa-clock text-accent text-sm"></i>
//             <div>
//               <p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Avg Time</p>
//               <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{averageResponseTime || 0}s</p>
//             </div>
//           </div>
//         </div>
//         <div className="relative">
//           <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100">
//             <circle cx="50" cy="50" r="42" stroke="var(--color-border)" strokeWidth="6" fill="none" />
//             <circle cx="50" cy="50" r="42" stroke={getTimeColor()} strokeWidth="6" fill="none" strokeDasharray="264" strokeDashoffset={264 * (1 - getTimePercentage() / 100)} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
//           </svg>
//           <div className="absolute inset-0 flex flex-col items-center justify-center">
//             <span className="text-base sm:text-lg font-bold" style={{ color: getTimeColor() }}>{formatTime(timeRemaining)}</span>
//           </div>
//         </div>
//       </div>

//       {showTimeWarning && (
//         <div className="mb-4 p-3 rounded-lg animate-shake" style={{ backgroundColor: '#fef3c7', borderLeft: `4px solid #f59e0b` }}>
//           <div className="flex items-center gap-2"><i className="fas fa-exclamation-triangle text-amber-500"></i><span className="text-sm text-amber-700">⚠️ Only {Math.floor(timeRemaining / 60)} minute(s) remaining!</span></div>
//         </div>
//       )}

//       {/* Question Section */}
//       <div className="mb-6">
//         <div className="flex gap-4">
//           <div className="flex-shrink-0">
//             <div className="relative">
//               <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${isPlaying || isSpeakingFeedback ? 'scale-110' : ''}`} style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
//                 <i className="fas fa-user-robot text-white text-2xl sm:text-3xl"></i>
//               </div>
//               {(isPlaying || isSpeakingFeedback) && (
//                 <>
//                   <div className="absolute -inset-2 rounded-2xl bg-primary/20 animate-ping"></div>
//                   <div className="absolute -inset-1 rounded-2xl bg-primary/30 animate-pulse"></div>
//                 </>
//               )}
//               <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${(isPlaying || isSpeakingFeedback) ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`}></div>
//             </div>
//           </div>
//           <div className="flex-1">
//             <div className="p-5 rounded-xl border shadow-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//               <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
//                 <div className="flex items-center gap-2">
//                   <i className="fas fa-question-circle text-primary text-sm"></i>
//                   <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Question #{questionCount}</span>
//                 </div>
//                 {currentQuestionTime > 0 && (
//                   <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
//                     <i className="fas fa-hourglass-half text-primary text-xs"></i>
//                     <span className="text-xs font-mono" style={{ color: 'var(--color-primary)' }}>{currentQuestionTime}s</span>
//                   </div>
//                 )}
//               </div>
//               <div className="min-h-[100px]">
//                 {isWaitingForQuestion || isProcessingAnswer ? (
//                   <div className="flex flex-col items-center justify-center py-6">
//                     <div className="flex gap-1 mb-3">
//                       <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
//                       <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                       <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
//                     </div>
//                     <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{isProcessingAnswer ? 'Evaluating your answer...' : 'Generating next question...'}</p>
//                   </div>
//                 ) : (
//                   <>
//                     <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{typedQuestion}{isPlaying && <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-blink"></span>}</p>
//                     {currentQuestion && !isWaitingForQuestion && !isProcessingAnswer && (
//                       <button onClick={() => playAudioAndType(currentQuestion)} disabled={isPlaying} className="mt-3 text-xs flex items-center gap-1 transition-colors hover:text-primary" style={{ color: 'var(--color-text-secondary)' }}>
//                         <i className="fas fa-volume-up"></i> Replay question
//                       </button>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Recruiter Feedback Area (typing animation) */}
//       {currentFeedback && (
//         <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: `${'var(--color-primary)'}10`, borderLeft: `3px solid var(--color-primary)` }}>
//           <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
//             <i className="fas fa-comment-dots mr-1"></i> Recruiter says:
//           </p>
//           <p className="text-base" style={{ color: 'var(--color-text-primary)' }}>
//             {typedFeedback}
//             {typedFeedback.length < currentFeedback.length && <span className="animate-blink">|</span>}
//           </p>
//         </div>
//       )}

//       {/* Answer Section */}
//       <div className="relative">
//         <div className="p-5 rounded-xl border shadow-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//           <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
//             <i className="fas fa-edit text-secondary"></i>
//             <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Your Response</span>
//           </div>
//           <textarea
//             className="w-full p-4 rounded-lg border resize-none transition-all focus:outline-none focus:ring-2"
//             placeholder="Type your answer here... or click the microphone to record"
//             value={currentAnswer}
//             onChange={(e) => setCurrentAnswer(e.target.value)}
//             rows={5}
//             disabled={isWaitingForQuestion || isProcessingAnswer || !interviewActive}
//             style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
//           />
//           <div className="flex flex-wrap gap-3 mt-4">
//             <button
//               onClick={isRecording ? stopRecording : startRecording}
//               disabled={isWaitingForQuestion || isProcessingAnswer || !interviewActive}
//               className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'border-2 hover:scale-105'}`}
//               style={{ backgroundColor: isRecording ? '#ef4444' : 'transparent', borderColor: 'var(--color-primary)', color: isRecording ? 'white' : 'var(--color-primary)' }}
//             >
//               <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
//               {isRecording ? 'Stop Recording' : 'Record Answer'}
//             </button>
//             <button
//               onClick={submitAnswer}
//               disabled={!currentAnswer.trim() || isWaitingForQuestion || isProcessingAnswer || !interviewActive}
//               className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
//             >
//               <i className="fas fa-paper-plane"></i> Submit Answer
//             </button>
//           </div>
//           {showSubmitConfirmation && (
//             <div className="mt-3 p-2 rounded-lg text-center animate-slideUp" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
//               <i className="fas fa-check-circle text-green-500 mr-2"></i>
//               <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Submitted! Processing feedback...</span>
//             </div>
//           )}
//           <div className="mt-5 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
//             <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
//               <span>Assessment Progress</span>
//               <span>{allAnswers.length} responses</span>
//             </div>
//             <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
//               <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (allAnswers.length / 15) * 100)}%`, background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <style jsx="true">{`
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//         @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
//         @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
//         @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
//         @keyframes progress { from { width: 0%; } to { width: 75%; } }
//         .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
//         .animate-blink { animation: blink 1s step-end infinite; }
//         .animate-shake { animation: shake 0.3s ease-in-out; }
//         .animate-slideUp { animation: slideUp 0.3s ease-out; }
//         .animate-progress { animation: progress 1s ease-out; }
//       `}</style>
//     </div>
//   );
// };

// export default LiveInterview;

import React, { useEffect, useState, useRef } from "react";
import {
  generateContinuousQuestion,
  textToSpeech,
  analyzeReport
} from "../services/aiApi";
import BASE_URL from "../config";

const LiveInterview = ({ interviewData, user, onFinish }) => {
  // Refs
  const audioRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const micStreamRef = useRef(null);
  const askedQuestionsRef = useRef([]);
  const questionHistoryRef = useRef(new Set());
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentQuestionStartTimeRef = useRef(null);

  // Strict sequential TTS queue
  const isAudioPlayingRef = useRef(false);
  const audioQueueRef = useRef([]);

  // State
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [typedQuestion, setTypedQuestion] = useState("");
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [typedFeedback, setTypedFeedback] = useState("");
  const [questionsReady, setQuestionsReady] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const [generatingNext, setGeneratingNext] = useState(false);
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(parseInt(interviewData?.duration || 30) * 60);
  const [timeRemaining, setTimeRemaining] = useState(parseInt(interviewData?.duration || 30) * 60);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeakingFeedback, setIsSpeakingFeedback] = useState(false);
  const [startTime] = useState(Date.now());
  const [interviewActive, setInterviewActive] = useState(true);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isWaitingForQuestion, setIsWaitingForQuestion] = useState(false);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Constants
  const TIME_WARNING_THRESHOLD = 60;
  const CRITICAL_TIME_THRESHOLD = 30;

  // Timer effect
  useEffect(() => {
    if (!questionsReady || !interviewActive) return;
    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (currentQuestionStartTimeRef.current && currentQuestion) {
          const elapsed = Math.floor((Date.now() - currentQuestionStartTimeRef.current) / 1000);
          setCurrentQuestionTime(elapsed);
        }
        if (newTime <= 0) {
          clearInterval(timerIntervalRef.current);
          endInterview();
          return 0;
        }
        if (newTime === TIME_WARNING_THRESHOLD) {
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 5000);
        }
        return newTime;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [questionsReady, interviewActive, currentQuestion]);

  // Generate first question when interview starts
  useEffect(() => {
    if (questionsReady && interviewActive && !currentQuestion && !generatingNext && !isWaitingForQuestion && !isProcessingAnswer) {
      generateNextQuestion();
    }
  }, [questionsReady, interviewActive, currentQuestion, generatingNext, isWaitingForQuestion, isProcessingAnswer]);

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  // ========== ULTRA SHORT FALLBACK QUESTIONS ==========
  const getShortFallbackQuestion = () => {
    const techStack = interviewData?.techStack || '';
    const role = interviewData?.role || '';
    const shortQuestions = {
      react: ["What is React?", "Explain useState hook.", "What is virtual DOM?", "How do props work?", "What is JSX?", "Explain useEffect hook.", "What are React fragments?", "How does context work?"],
      python: ["What are decorators?", "Explain list comprehension.", "What is the GIL?", "Explain async/await.", "What are generators?", "What is lambda function?", "Explain Python classes.", "What is pip?"],
      javascript: ["What are closures?", "Explain event loop.", "Let vs var?", "Explain promises.", "What is hoisting?", "What is 'this' keyword?", "Explain arrow functions.", "What is destructuring?"],
      html: ["What are semantic elements?", "Explain <article> tag.", "What is the DOCTYPE?", "Explain alt attribute.", "What is meta tag?", "What is canvas element?", "Explain local storage.", "What are web workers?"],
      css: ["What is Flexbox?", "Explain CSS Grid.", "What are media queries?", "What is box model?", "Explain CSS specificity.", "What is z-index?", "Explain pseudo-classes.", "What is CSS variables?"],
      default: [`Tell me about your ${role || 'technical'} experience.`, `What's your biggest technical challenge?`, `How do you debug code?`, `What are your best practices?`, `How do you learn new tech?`, `What tools do you use?`, `Describe your workflow.`, `How do you handle pressure?`]
    };
    let questionsArray = shortQuestions.default;
    const techLower = (techStack + ' ' + role).toLowerCase();
    for (const [key, questions] of Object.entries(shortQuestions)) {
      if (techLower.includes(key)) {
        questionsArray = questions;
        break;
      }
    }
    const available = questionsArray.filter(q => !questionHistoryRef.current.has(q.toLowerCase().trim()));
    if (available.length > 0) return available[Math.floor(Math.random() * available.length)];
    return shortQuestions.default[Math.floor(Math.random() * shortQuestions.default.length)];
  };

  // ========== LOCAL FALLBACK FORMATTER ==========
  const formatRecruiterFeedback = (evaluation, answer, question) => {
    const score = evaluation.score || 5;
    const strengths = evaluation.strengths || [];
    const weaknesses = evaluation.weaknesses || [];
    const improvements = evaluation.improvement || [];
    if (score >= 8) {
      const strength = strengths[0] || "Your answer is clear and correct.";
      return `${strength} Keep it up.`;
    } else if (score >= 5) {
      const weakness = weaknesses[0] || "Your answer is partially correct but missing some details.";
      const suggestion = improvements[0] || "Try to elaborate with examples.";
      return `${weakness} ${suggestion}`;
    } else {
      const weakness = weaknesses[0] || "Your answer is not accurate.";
      const suggestion = improvements[0] || "Please review the concept again.";
      return `${weakness} ${suggestion}`;
    }
  };

  // ====== Audio queue runner ======
  const enqueueAudioJob = (jobFn) => {
    return new Promise((resolve) => {
      audioQueueRef.current.push({ jobFn, resolve });
      runAudioQueue();
    });
  };

  const runAudioQueue = async () => {
    if (isAudioPlayingRef.current) return;
    const nextJob = audioQueueRef.current[0];
    if (!nextJob) return;
    isAudioPlayingRef.current = true;
    try {
      await nextJob.jobFn();
    } finally {
      audioQueueRef.current.shift();
      nextJob.resolve();
      isAudioPlayingRef.current = false;
      if (audioQueueRef.current.length > 0) runAudioQueue();
    }
  };

  // ====== Play audio AND type simultaneously (FIXED) ======
  const playAudioAndType = (text) => {
    if (!text) return Promise.resolve();
    setIsPlaying(true);
    return enqueueAudioJob(async () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Clear any previous typing interval
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      
      setTypedQuestion("");
      let i = 0;
      const totalLength = text.length;
      
      // Start typing animation IMMEDIATELY (parallel with TTS fetch)
      const typingPromise = new Promise((resolve) => {
        const typingSpeed = 30; // ms per character
        const interval = setInterval(() => {
          if (i < totalLength) {
            setTypedQuestion(text.slice(0, i + 1));
            i++;
          }
          if (i >= totalLength) {
            clearInterval(interval);
            if (typingIntervalRef.current === interval) typingIntervalRef.current = null;
            resolve();
          }
        }, typingSpeed);
        typingIntervalRef.current = interval;
      });
      
      // Fetch TTS and play audio in parallel
      let audioPromise;
      try {
        const { audioUrl } = await textToSpeech(text);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audioPromise = new Promise((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play();
        });
      } catch (err) {
        console.warn("TTS error:", err);
        audioPromise = Promise.resolve();
      }
      
      await Promise.all([audioPromise, typingPromise]);
      setIsPlaying(false);
    });
  };

  // ====== Display feedback with typing AND speak simultaneously (FIXED) ======
  const displayAndSpeakFeedback = (text) => {
    if (!text) return Promise.resolve();
    setIsSpeakingFeedback(true);
    return enqueueAudioJob(async () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      
      setCurrentFeedback(text);
      setTypedFeedback("");
      let i = 0;
      const totalLength = text.length;
      
      // Start typing immediately
      const typingPromise = new Promise((resolve) => {
        const typingSpeed = 30;
        const interval = setInterval(() => {
          if (i < totalLength) {
            setTypedFeedback(text.slice(0, i + 1));
            i++;
          }
          if (i >= totalLength) {
            clearInterval(interval);
            if (typingIntervalRef.current === interval) typingIntervalRef.current = null;
            resolve();
          }
        }, typingSpeed);
        typingIntervalRef.current = interval;
      });
      
      // Fetch TTS and play audio in parallel
      let audioPromise;
      try {
        const { audioUrl } = await textToSpeech(text);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audioPromise = new Promise((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play();
        });
      } catch (err) {
        console.warn("TTS error:", err);
        audioPromise = Promise.resolve();
      }
      
      await Promise.all([audioPromise, typingPromise]);
      
      // Clear feedback after both finish
      await new Promise(resolve => setTimeout(resolve, 300));
      setCurrentFeedback("");
      setTypedFeedback("");
      setIsSpeakingFeedback(false);
    });
  };

  // ----- Generate next question -----
  const generateNextQuestion = async (lastAnswer = null) => {
    if (generatingNext || !interviewActive) return;
    setGeneratingNext(true);
    setIsWaitingForQuestion(true);
    try {
      const askedQuestions = Array.from(askedQuestionsRef.current);
      const response = await generateContinuousQuestion(
        interviewData?.role,
        sessionId,
        interviewData?.techStack,
        interviewData?.level,
        interviewData?.difficulty,
        askedQuestions,
        lastAnswer,
        conversationHistory
      );
      let newQuestion = null;
      if (response?.question) newQuestion = response.question;
      else if (response?.questions && response.questions.length > 0) newQuestion = response.questions[0];
      if (newQuestion) {
        const wordCount = newQuestion.split(' ').length;
        const normalized = newQuestion.toLowerCase().trim();
        if (wordCount > 12 || questionHistoryRef.current.has(normalized)) newQuestion = getShortFallbackQuestion();
      } else newQuestion = getShortFallbackQuestion();
      if (newQuestion.split(' ').length > 12) newQuestion = getShortFallbackQuestion();
      const normalizedNew = newQuestion.toLowerCase().trim();
      questionHistoryRef.current.add(normalizedNew);
      askedQuestionsRef.current.push(newQuestion);
      setConversationHistory(prev => [...prev, { role: "assistant", content: newQuestion }]);
      setCurrentQuestion(newQuestion);
      setTypedQuestion("");
      setQuestionCount(prev => prev + 1);
      currentQuestionStartTimeRef.current = Date.now();
      setCurrentQuestionTime(0);
      await playAudioAndType(newQuestion);
    } catch (err) {
      console.error("Error generating continuous question:", err);
      const fallback = getShortFallbackQuestion();
      const normalizedFallback = fallback.toLowerCase().trim();
      if (!questionHistoryRef.current.has(normalizedFallback)) {
        questionHistoryRef.current.add(normalizedFallback);
        askedQuestionsRef.current.push(fallback);
      }
      setCurrentQuestion(fallback);
      currentQuestionStartTimeRef.current = Date.now();
      await playAudioAndType(fallback);
    } finally {
      setGeneratingNext(false);
      setIsWaitingForQuestion(false);
    }
  };

  // ----- Process current answer: evaluate, give feedback, then ask next -----
  const processAnswerAndGetNext = async () => {
    if (!currentAnswer.trim() || !currentQuestion || isProcessingAnswer) return;
    setIsProcessingAnswer(true);
    if (isRecording && mediaRecorderRef.current) stopRecording();
    const responseTime = currentQuestionStartTimeRef.current
      ? Math.floor((Date.now() - currentQuestionStartTimeRef.current) / 1000)
      : 0;

    // Evaluate answer
    let evaluation = null;
    try {
      const userId = user?.id || 'guest';
      const evalResponse = await fetch(`${BASE_URL}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Id: sessionId,
          userId: userId,
          role: interviewData?.role,
          question: currentQuestion,
          answer: currentAnswer
        })
      });
      const evalData = await evalResponse.json();
      evaluation = evalData.evaluation;
    } catch (err) {
      console.warn("Evaluation API failed, using fallback", err);
      evaluation = { score: 5, strengths: ["Answer provided"], weaknesses: ["Could be improved"] };
    }

    let feedbackText = evaluation.recruiter_feedback;
    if (!feedbackText) feedbackText = formatRecruiterFeedback(evaluation, currentAnswer, currentQuestion);
    const shouldRepeatQuestion = evaluation.repeat_question === true;
    const questionToRepeat = currentQuestion;
    const lastAnswerText = currentAnswer;

    // Save answer with evaluation
    const answerObj = {
      question: currentQuestion,
      answer: currentAnswer,
      timestamp: new Date().toISOString(),
      responseTime: responseTime,
      evaluation: {
        ...evaluation,
        feedbackSpoken: feedbackText
      }
    };
    setAllAnswers(prev => [...prev, answerObj]);
    setConversationHistory(prev => [...prev, { role: "user", content: currentAnswer }]);

    // Clear UI for answer input and question
    setCurrentAnswer("");
    setCurrentQuestion(null);
    setTypedQuestion("");
    setCurrentQuestionTime(0);

    // Show feedback with typing AND speak simultaneously
    await displayAndSpeakFeedback(feedbackText);

    // Next or repeat question
    if (shouldRepeatQuestion) {
      setCurrentQuestion(questionToRepeat);
      setTypedQuestion("");
      currentQuestionStartTimeRef.current = Date.now();
      setCurrentQuestionTime(0);
      await playAudioAndType(questionToRepeat);
      setIsProcessingAnswer(false);
    } else {
      await generateNextQuestion(lastAnswerText);
      setIsProcessingAnswer(false);
    }

    setShowSubmitConfirmation(true);
    setTimeout(() => setShowSubmitConfirmation(false), 1500);
  };

  // ----- End interview (triggers batch evaluation and report) -----
  const endInterview = async () => {
    if (!interviewActive) return;
    setInterviewActive(false);
    if (audioRef.current) audioRef.current.pause();
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (currentAnswer.trim() && currentQuestion) {
      const responseTime = currentQuestionStartTimeRef.current
        ? Math.floor((Date.now() - currentQuestionStartTimeRef.current) / 1000)
        : 0;
      const answerObj = {
        question: currentQuestion,
        answer: currentAnswer,
        timestamp: new Date().toISOString(),
        responseTime: responseTime
      };
      setAllAnswers(prev => [...prev, answerObj]);
    }
    const totalResponseTime = allAnswers.reduce((sum, a) => sum + (a.responseTime || 0), 0);
    const avgTime = allAnswers.length > 0 ? Math.round(totalResponseTime / allAnswers.length) : 0;
    setAverageResponseTime(avgTime);
    if (allAnswers.length > 0 || currentAnswer.trim()) {
      await performBatchEvaluation();
    } else {
      onFinish({
        score: 0,
        technical: 0,
        clarity: 0,
        confidence: 0,
        role: interviewData?.role,
        level: interviewData?.level || "Mid-Level",
        totalQuestions: 0,
        answered: 0,
        averageResponseTime: 0,
        evaluations: [],
        answers: []
      });
    }
  };

  // ----- Batch evaluation & reporting -----
  const calculateSmartScore = (answer, question) => {
    let score = 5;
    const length = answer.length;
    if (length > 200) score += 2;
    else if (length > 100) score += 1;
    else if (length < 30) score -= 2;
    if (answer.includes('example') || answer.includes('for instance')) score += 1;
    if (answer.includes('because') || answer.includes('therefore')) score += 1;
    const keywords = question.toLowerCase().split(' ').filter(w => w.length > 4);
    const matched = keywords.filter(kw => answer.toLowerCase().includes(kw)).length;
    if (keywords.length > 0) score += (matched / keywords.length) * 2;
    return Math.min(10, Math.max(1, Math.round(score)));
  };

  const saveInterviewToDatabase = async (evaluatedAnswers, finalReport) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      const payload = {
        role: interviewData?.role,
        position: interviewData?.role,
        techStack: interviewData?.techStack,
        level: interviewData?.level,
        difficulty: interviewData?.difficulty,
        questions: evaluatedAnswers.map((item, idx) => ({
          question: item.question,
          userAnswer: item.answer,
          idealAnswer: '',
          score: (item.evaluation?.score || 5) * 10,
          responseTime: item.responseTime || 0,
          feedback: {
            strengths: item.evaluation?.strengths || [],
            improvements: item.evaluation?.weaknesses || [],
            suggestions: item.evaluation?.improvement || []
          },
          keywords: [],
          timeTaken: item.responseTime || 0
        })),
        overallScore: finalReport.score,
        technicalScore: finalReport.technical,
        clarityScore: finalReport.clarity,
        confidenceScore: finalReport.confidence,
        averageResponseTime: averageResponseTime,
        duration: durationSeconds,
        totalQuestionsAnswered: evaluatedAnswers.length
      };
      const response = await fetch(`${BASE_URL}/api/interview/save-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) console.log('✅ Interview session saved to DB');
    } catch (err) { console.error('❌ Save error:', err); }
  };

  const performBatchEvaluation = async () => {
    setIsBatchEvaluating(true);
    try {
      const userId = user?.id || 'guest';
      const questionsList = allAnswers.map(a => a.question);
      const answersList = allAnswers.map(a => a.answer);
      let evaluations = [];
      try {
        const response = await fetch('/batch-evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Id: sessionId,
            userId: userId,
            role: interviewData?.role,
            techStack: interviewData?.techStack,
            level: interviewData?.level,
            questions: questionsList,
            answers: answersList
          })
        });
        const data = await response.json();
        evaluations = data.evaluations || [];
      } catch (err) { console.warn('AI backend failed, using fallback scoring', err); }
      const finalEvaluations = allAnswers.map((answer, idx) => {
        const aiEval = evaluations[idx];
        if (aiEval && aiEval.score && aiEval.score > 2) return aiEval;
        const smartScore = calculateSmartScore(answer.answer, answer.question);
        return {
          score: smartScore,
          relevance_score: smartScore,
          accuracy_score: smartScore,
          communication_score: smartScore,
          strengths: smartScore >= 7 ? ['Good detail'] : (smartScore >= 5 ? ['Answered'] : []),
          weaknesses: smartScore < 5 ? ['Too brief'] : (smartScore < 7 ? ['Add more detail'] : []),
          improvement: ['Provide examples and technical depth'],
          answer_quality: smartScore >= 7 ? 'good' : smartScore >= 5 ? 'average' : 'poor',
          responseTime: answer.responseTime || 0
        };
      });
      const evaluatedAnswers = allAnswers.map((answer, index) => ({
        ...answer,
        evaluation: finalEvaluations[index],
        responseTime: answer.responseTime || 0
      }));
      await generateFinalReport(evaluatedAnswers);
    } catch (error) {
      console.error("Batch evaluation error:", error);
      const dummyEvals = allAnswers.map(a => ({
        score: calculateSmartScore(a.answer, a.question),
        strengths: ['Answered'],
        weaknesses: ['Could be more detailed'],
        improvement: ['Practice structuring answers'],
        answer_quality: 'average'
      }));
      const evaluatedAnswers = allAnswers.map((a, i) => ({ ...a, evaluation: dummyEvals[i] }));
      await generateFinalReport(evaluatedAnswers);
    }
  };

  const generateFinalReport = async (evaluatedAnswers) => {
    try {
      setIsAnalyzing(true);
      const userId = user?.id || 'guest';
      const result = await analyzeReport(
        sessionId,
        interviewData?.role,
        evaluatedAnswers.map(a => a.question),
        evaluatedAnswers,
        userId
      );
      const avgScore = evaluatedAnswers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / evaluatedAnswers.length;
      const avgTechnical = evaluatedAnswers.reduce((sum, a) => sum + (a.evaluation?.accuracy_score || a.evaluation?.score || 0), 0) / evaluatedAnswers.length;
      const avgClarity = evaluatedAnswers.reduce((sum, a) => sum + (a.evaluation?.relevance_score || a.evaluation?.score || 0), 0) / evaluatedAnswers.length;
      const avgConfidence = evaluatedAnswers.reduce((sum, a) => sum + (a.evaluation?.communication_score || a.evaluation?.score || 0), 0) / evaluatedAnswers.length;
      const report = {
        score: result?.score || Math.round(avgScore * 10),
        technical: result?.technical || Math.round(avgTechnical * 10),
        clarity: result?.clarity || Math.round(avgClarity * 10),
        confidence: result?.confidence || Math.round(avgConfidence * 10),
        role: interviewData?.role,
        level: interviewData?.level || "Mid-Level",
        totalQuestions: evaluatedAnswers.length,
        answered: evaluatedAnswers.length,
        averageResponseTime: averageResponseTime,
        evaluations: evaluatedAnswers.map(a => a.evaluation),
        answers: evaluatedAnswers
      };
      await saveInterviewToDatabase(evaluatedAnswers, report);
      onFinish(report);
    } catch (error) {
      console.error("Report generation error:", error);
      const avgScore = evaluatedAnswers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / evaluatedAnswers.length;
      const fallbackReport = {
        score: Math.round(avgScore * 10),
        technical: Math.round(avgScore * 10),
        clarity: Math.round(avgScore * 10),
        confidence: Math.round(avgScore * 10),
        role: interviewData?.role,
        level: interviewData?.level || "Mid-Level",
        totalQuestions: evaluatedAnswers.length,
        answered: evaluatedAnswers.length,
        averageResponseTime: averageResponseTime,
        evaluations: evaluatedAnswers.map(a => a.evaluation || {}),
        answers: evaluatedAnswers
      };
      await saveInterviewToDatabase(evaluatedAnswers, fallbackReport);
      onFinish(fallbackReport);
    }
    setIsAnalyzing(false);
    setIsBatchEvaluating(false);
  };

  // ----- UI helper functions -----
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= CRITICAL_TIME_THRESHOLD) return '#ef4444';
    if (timeRemaining <= TIME_WARNING_THRESHOLD) return '#f59e0b';
    return 'var(--color-primary)';
  };

  const getTimePercentage = () => {
    return (timeRemaining / totalTimeSeconds) * 100;
  };

  const startInterview = () => {
    setQuestionsReady(true);
    setInterviewActive(true);
    setTimeRemaining(totalTimeSeconds);
    setQuestionCount(0);
    setAllAnswers([]);
    setAverageResponseTime(0);
    setConversationHistory([]);
    askedQuestionsRef.current = [];
    questionHistoryRef.current.clear();
  };

  // ----- Recording functions -----
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.log("Mic error:", err);
      alert("Microphone access denied. Please type your answers.");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    const recorder = mediaRecorderRef.current;
    recorder.stop();
    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "answer.webm");
      try {
        const response = await fetch("http://127.0.0.1:8000/stt", {
          method: "POST",
          body: formData
        });
        const data = await response.json();
        setCurrentAnswer(data.text);
      } catch (err) {
        console.log("STT error:", err);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
    setIsRecording(false);
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert("Please provide an answer before continuing.");
      return;
    }
    if (isProcessingAnswer) return;
    await processAnswerAndGetNext();
  };

  // ----- Render logic -----
  if (isBatchEvaluating || isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-brain text-primary text-2xl animate-pulse"></i>
          </div>
        </div>
        <p className="mt-6 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {isBatchEvaluating ? 'Evaluating your responses...' : 'Generating comprehensive report...'}
        </p>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Questions answered: {allAnswers.length}
        </p>
        <div className="mt-4 w-48 h-1 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-primary rounded-full animate-progress"></div>
        </div>
      </div>
    );
  }

  if (!questionsReady) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 animate-fadeIn">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-2xl"
                 style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
              <i className="fas fa-clipboard-list text-white text-4xl"></i>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg animate-bounce">
              <i className="fas fa-microphone-alt text-white text-xs"></i>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Technical Assessment</h2>
          <p className="text-sm sm:text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>Let's assess your technical skills and interview readiness</p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <i className="fas fa-briefcase text-primary text-xl mb-2 block"></i>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Role</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.role}</p>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <i className="fas fa-code text-secondary text-xl mb-2 block"></i>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tech Stack</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.techStack}</p>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <i className="fas fa-hourglass-half text-accent text-xl mb-2 block"></i>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Duration</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.duration} minutes</p>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <i className="fas fa-chart-line text-primary text-xl mb-2 block"></i>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Level</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.level}</p>
            </div>
          </div>
          <div className="p-5 rounded-xl border mb-8 text-left" style={{ backgroundColor: `${'var(--color-primary)'}05`, borderColor: `${'var(--color-primary)'}20` }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <i className="fas fa-info-circle text-primary"></i> Assessment Format
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <li className="flex items-center gap-2"><i className="fas fa-infinity text-primary text-xs"></i> Continuous question generation</li>
              <li className="flex items-center gap-2"><i className="fas fa-stopwatch text-primary text-xs"></i> Time-bound assessment</li>
              <li className="flex items-center gap-2"><i className="fas fa-microphone-alt text-primary text-xs"></i> Voice or text responses</li>
              <li className="flex items-center gap-2"><i className="fas fa-chat text-primary text-xs"></i> Real‑time recruiter feedback</li>
            </ul>
          </div>
          <button onClick={startInterview} className="relative px-8 py-3 rounded-xl font-semibold text-white overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 group" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
            <span className="relative flex items-center gap-2"><i className="fas fa-play"></i> Begin Assessment</span>
          </button>
        </div>
      </div>
    );
  }

  // ======================= LIVE INTERVIEW UI =======================
  return (
    <div className="animate-fadeIn relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header Bar with Metrics */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
            <i className="fas fa-check-circle text-primary text-sm"></i>
            <div>
              <p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Answered</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{allAnswers.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-secondary)'}10` }}>
            <i className="fas fa-question-circle text-secondary text-sm"></i>
            <div>
              <p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Current</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>#{questionCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-accent)'}10` }}>
            <i className="fas fa-clock text-accent text-sm"></i>
            <div>
              <p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Avg Time</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{averageResponseTime || 0}s</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="var(--color-border)" strokeWidth="6" fill="none" />
            <circle cx="50" cy="50" r="42" stroke={getTimeColor()} strokeWidth="6" fill="none" strokeDasharray="264" strokeDashoffset={264 * (1 - getTimePercentage() / 100)} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base sm:text-lg font-bold" style={{ color: getTimeColor() }}>{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {showTimeWarning && (
        <div className="mb-4 p-3 rounded-lg animate-shake" style={{ backgroundColor: '#fef3c7', borderLeft: `4px solid #f59e0b` }}>
          <div className="flex items-center gap-2"><i className="fas fa-exclamation-triangle text-amber-500"></i><span className="text-sm text-amber-700">⚠️ Only {Math.floor(timeRemaining / 60)} minute(s) remaining!</span></div>
        </div>
      )}

      {/* Question Section */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${isPlaying || isSpeakingFeedback ? 'scale-110' : ''}`} style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
                <i className="fas fa-user-robot text-white text-2xl sm:text-3xl"></i>
              </div>
              {(isPlaying || isSpeakingFeedback) && (
                <>
                  <div className="absolute -inset-2 rounded-2xl bg-primary/20 animate-ping"></div>
                  <div className="absolute -inset-1 rounded-2xl bg-primary/30 animate-pulse"></div>
                </>
              )}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${(isPlaying || isSpeakingFeedback) ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`}></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="p-5 rounded-xl border shadow-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <i className="fas fa-question-circle text-primary text-sm"></i>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Question #{questionCount}</span>
                </div>
                {currentQuestionTime > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
                    <i className="fas fa-hourglass-half text-primary text-xs"></i>
                    <span className="text-xs font-mono" style={{ color: 'var(--color-primary)' }}>{currentQuestionTime}s</span>
                  </div>
                )}
              </div>
              <div className="min-h-[100px]">
                {isWaitingForQuestion || isProcessingAnswer ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="flex gap-1 mb-3">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{isProcessingAnswer ? 'Evaluating your answer...' : 'Generating next question...'}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{typedQuestion}{isPlaying && <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-blink"></span>}</p>
                    {currentQuestion && !isWaitingForQuestion && !isProcessingAnswer && (
                      <button onClick={() => playAudioAndType(currentQuestion)} disabled={isPlaying} className="mt-3 text-xs flex items-center gap-1 transition-colors hover:text-primary" style={{ color: 'var(--color-text-secondary)' }}>
                        <i className="fas fa-volume-up"></i> Replay question
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recruiter Feedback Area */}
      {currentFeedback && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: `${'var(--color-primary)'}10`, borderLeft: `3px solid var(--color-primary)` }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
            <i className="fas fa-comment-dots mr-1"></i> Recruiter says:
          </p>
          <p className="text-base" style={{ color: 'var(--color-text-primary)' }}>
            {typedFeedback}
            {typedFeedback.length < currentFeedback.length && <span className="animate-blink">|</span>}
          </p>
        </div>
      )}

      {/* Answer Section */}
      <div className="relative">
        <div className="p-5 rounded-xl border shadow-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <i className="fas fa-edit text-secondary"></i>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Your Response</span>
          </div>
          <textarea
            className="w-full p-4 rounded-lg border resize-none transition-all focus:outline-none focus:ring-2"
            placeholder="Type your answer here... or click the microphone to record"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            rows={5}
            disabled={isWaitingForQuestion || isProcessingAnswer || !interviewActive}
            style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          />
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isWaitingForQuestion || isProcessingAnswer || !interviewActive}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'border-2 hover:scale-105'}`}
              style={{ backgroundColor: isRecording ? '#ef4444' : 'transparent', borderColor: 'var(--color-primary)', color: isRecording ? 'white' : 'var(--color-primary)' }}
            >
              <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
              {isRecording ? 'Stop Recording' : 'Record Answer'}
            </button>
            <button
              onClick={submitAnswer}
              disabled={!currentAnswer.trim() || isWaitingForQuestion || isProcessingAnswer || !interviewActive}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
            >
              <i className="fas fa-paper-plane"></i> Submit Answer
            </button>
          </div>
          {showSubmitConfirmation && (
            <div className="mt-3 p-2 rounded-lg text-center animate-slideUp" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
              <i className="fas fa-check-circle text-green-500 mr-2"></i>
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Submitted! Processing feedback...</span>
            </div>
          )}
          <div className="mt-5 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              <span>Assessment Progress</span>
              <span>{allAnswers.length} responses</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (allAnswers.length / 15) * 100)}%`, background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes progress { from { width: 0%; } to { width: 75%; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-blink { animation: blink 1s step-end infinite; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-progress { animation: progress 1s ease-out; }
      `}</style>
    </div>
  );
};

export default LiveInterview;