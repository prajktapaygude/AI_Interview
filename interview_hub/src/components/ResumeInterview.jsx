// import React, { useState, useEffect, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { textToSpeech } from "../services/aiApi";

// const ResumeInterview = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // ========== Refs ==========
//   const audioRef = useRef(null);
//   const typingIntervalRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const micStreamRef = useRef(null);
//   const timerIntervalRef = useRef(null);
//   const startTimeRef = useRef(null);
//   const currentQuestionStartTimeRef = useRef(null);
//   const isAudioPlayingRef = useRef(false);
//   const audioQueueRef = useRef([]);
//   const evaluationsRef = useRef([]);

//   // ========== State ==========
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [currentQuestionObj, setCurrentQuestionObj] = useState(null);
//   const [typedQuestion, setTypedQuestion] = useState("");
//   const [currentFeedback, setCurrentFeedback] = useState("");
//   const [typedFeedback, setTypedFeedback] = useState("");
//   const [currentAnswer, setCurrentAnswer] = useState("");
//   const [allAnswers, setAllAnswers] = useState([]);
//   const [evaluations, setEvaluations] = useState([]);
//   const [isGeneratingNext, setIsGeneratingNext] = useState(false);
//   const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
//   const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
//   const [interviewActive, setInterviewActive] = useState(true);
//   const [questionsReady, setQuestionsReady] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isSpeakingFeedback, setIsSpeakingFeedback] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
//   const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
//   const [averageResponseTime, setAverageResponseTime] = useState(0);
//   const [totalTimeSeconds, setTotalTimeSeconds] = useState(30 * 60);
//   const [timeRemaining, setTimeRemaining] = useState(30 * 60);
//   const [showTimeWarning, setShowTimeWarning] = useState(false);
//   const [sessionId] = useState(`resume_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
//   const [jobTitle, setJobTitle] = useState("");
//   const [isHighMatch, setIsHighMatch] = useState(false);
//   const [resumeId, setResumeId] = useState(null);
//   const [conversationHistory, setConversationHistory] = useState([]);
//   const [interviewStarted, setInterviewStarted] = useState(false);
//   const [showResults, setShowResults] = useState(false);
//   const [finalReport, setFinalReport] = useState(null);

//   const TIME_WARNING_THRESHOLD = 60;
//   const CRITICAL_TIME_THRESHOLD = 30;

//   // Helper: extract question text
//   const getQuestionText = (question) => {
//     if (!question) return "";
//     if (typeof question === "string") return question;
//     if (typeof question === "object") {
//       if (question.question) return question.question;
//       if (question.text) return question.text;
//       return JSON.stringify(question);
//     }
//     return String(question);
//   };

//   // Load questions from location state / localStorage
//   useEffect(() => {
//     const stateQuestions = location.state?.questions;
//     const stateResumeId = location.state?.resumeId;
//     const stateJobTitle = location.state?.jobTitle;
//     const stateIsHighMatch = location.state?.isHighMatch;

//     let storedQuestions = stateQuestions || JSON.parse(localStorage.getItem("resumeQuestions") || "[]");
//     const storedResumeId = stateResumeId || localStorage.getItem("resumeId");
//     const storedJobTitle = stateJobTitle || localStorage.getItem("jobTitle") || "";
//     const storedIsHighMatch = stateIsHighMatch || localStorage.getItem("isHighMatch") === "true";

//     if (storedQuestions.length > 0) {
//       const formattedQuestions = storedQuestions.map(q => getQuestionText(q));
//       setQuestions(formattedQuestions);
//       setJobTitle(storedJobTitle);
//       setIsHighMatch(storedIsHighMatch);
//       setResumeId(storedResumeId);
//       setAllAnswers(new Array(formattedQuestions.length).fill(null));
//       setEvaluations(new Array(formattedQuestions.length).fill(null));
//       evaluationsRef.current = new Array(formattedQuestions.length).fill(null);
//     }
//     setQuestionsReady(true);
//   }, [location]);

//   // Timer effect
//   useEffect(() => {
//     if (!interviewStarted || !interviewActive || showResults) return;
//     startTimeRef.current = Date.now();
//     timerIntervalRef.current = setInterval(() => {
//       setTimeRemaining(prev => {
//         const newTime = prev - 1;
//         if (currentQuestionStartTimeRef.current && currentQuestionObj) {
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
//   }, [interviewStarted, interviewActive, currentQuestionObj, showResults]);

//   // Start first question
//   useEffect(() => {
//     if (interviewStarted && questions.length > 0 && !currentQuestionObj && !isGeneratingNext && !isProcessingAnswer && !showResults) {
//       startNextQuestion();
//     }
//   }, [interviewStarted, questions, currentQuestionObj, isGeneratingNext, isProcessingAnswer, showResults]);

//   useEffect(() => {
//     return () => {
//       if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
//     };
//   }, []);

//   // ========== Audio Queue with fallback TTS ==========
//   const speakWithFallback = async (text) => {
//     try {
//       const { audioUrl } = await textToSpeech(text);
//       const audio = new Audio(audioUrl);
//       audioRef.current = audio;
//       return new Promise((resolve, reject) => {
//         audio.onended = () => resolve();
//         audio.onerror = () => reject(new Error("Audio playback failed"));
//         audio.play().catch(reject);
//       });
//     } catch (err) {
//       console.warn("Backend TTS failed, using browser SpeechSynthesis", err);
//       return new Promise((resolve) => {
//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.lang = "en-US";
//         utterance.rate = 0.9;
//         utterance.onend = () => resolve();
//         utterance.onerror = () => resolve();
//         window.speechSynthesis.cancel();
//         window.speechSynthesis.speak(utterance);
//       });
//     }
//   };

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

//   const playAudioAndType = (text) => {
//     if (!text) return Promise.resolve();
//     setIsPlaying(true);
//     return enqueueAudioJob(async () => {
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }
//       if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

//       setTypedQuestion("");
//       let i = 0;
//       const totalLength = text.length;

//       const typingPromise = new Promise((resolve) => {
//         const typingSpeed = 30;
//         const interval = setInterval(() => {
//           if (i < totalLength) {
//             setTypedQuestion(text.slice(0, i + 1));
//             i++;
//           }
//           if (i >= totalLength) {
//             clearInterval(interval);
//             if (typingIntervalRef.current === interval) typingIntervalRef.current = null;
//             resolve();
//           }
//         }, typingSpeed);
//         typingIntervalRef.current = interval;
//       });

//       const audioPromise = speakWithFallback(text);
//       await Promise.all([audioPromise, typingPromise]);
//       setIsPlaying(false);
//     });
//   };

//   const displayAndSpeakFeedback = (text) => {
//     if (!text) return Promise.resolve();
//     setIsSpeakingFeedback(true);
//     return enqueueAudioJob(async () => {
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }
//       if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

//       setCurrentFeedback(text);
//       setTypedFeedback("");
//       let i = 0;
//       const totalLength = text.length;

//       const typingPromise = new Promise((resolve) => {
//         const typingSpeed = 30;
//         const interval = setInterval(() => {
//           if (i < totalLength) {
//             setTypedFeedback(text.slice(0, i + 1));
//             i++;
//           }
//           if (i >= totalLength) {
//             clearInterval(interval);
//             if (typingIntervalRef.current === interval) typingIntervalRef.current = null;
//             resolve();
//           }
//         }, typingSpeed);
//         typingIntervalRef.current = interval;
//       });

//       const audioPromise = speakWithFallback(text);
//       await Promise.all([audioPromise, typingPromise]);

//       await new Promise(resolve => setTimeout(resolve, 300));
//       setCurrentFeedback("");
//       setTypedFeedback("");
//       setIsSpeakingFeedback(false);
//     });
//   };

//   // ========== Evaluation using same endpoint as LiveInterview ==========
//   const evaluateCurrentAnswer = async (questionText, answerText) => {
//     try {
//       const userId = localStorage.getItem("userId") || "guest";
//       const response = await fetch("http://localhost:8000/evaluate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           Id: sessionId,
//           userId: userId,
//           role: jobTitle || "Software Developer",
//           question: questionText,
//           answer: answerText,
//         }),
//       });
//       const data = await response.json();
//       return data.evaluation;
//     } catch (err) {
//       console.warn("Evaluation API failed, using fallback", err);
//       return {
//         score: 5,
//         strengths: ["Answer provided"],
//         weaknesses: ["Could be improved"],
//         recruiter_feedback: "Thank you for your answer. Try to add more detail next time.",
//       };
//     }
//   };

//   const formatRecruiterFeedback = (evaluation) => {
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

//   const startNextQuestion = async () => {
//     if (currentQuestionIndex >= questions.length) {
//       endInterview();
//       return;
//     }

//     setIsGeneratingNext(true);
//     const questionText = questions[currentQuestionIndex];
//     setCurrentQuestionObj(questionText);
//     setTypedQuestion("");
//     currentQuestionStartTimeRef.current = Date.now();
//     setCurrentQuestionTime(0);
//     setConversationHistory(prev => [...prev, { role: "assistant", content: questionText }]);
//     await playAudioAndType(questionText);
//     setIsGeneratingNext(false);
//   };

//   const processAnswerAndGetNext = async () => {
//     if (!currentAnswer.trim() || !currentQuestionObj || isProcessingAnswer) return;
//     setIsProcessingAnswer(true);

//     if (isRecording && mediaRecorderRef.current) stopRecording();

//     const evaluation = await evaluateCurrentAnswer(currentQuestionObj, currentAnswer);
//     let feedbackText = evaluation.recruiter_feedback;
//     if (!feedbackText) feedbackText = formatRecruiterFeedback(evaluation);
//     const shouldRepeatQuestion = evaluation.repeat_question === true;

//     // Save answer and evaluation
//     const newAllAnswers = [...allAnswers];
//     newAllAnswers[currentQuestionIndex] = currentAnswer;
//     setAllAnswers(newAllAnswers);

//     const newEvaluations = [...evaluations];
//     newEvaluations[currentQuestionIndex] = evaluation;
//     setEvaluations(newEvaluations);
//     evaluationsRef.current = newEvaluations;

//     setConversationHistory(prev => [...prev, { role: "user", content: currentAnswer }]);

//     // Clear UI
//     setCurrentAnswer("");
//     setCurrentQuestionObj(null);
//     setTypedQuestion("");
//     setCurrentQuestionTime(0);

//     // Show feedback
//     await displayAndSpeakFeedback(feedbackText);

//     // Next or repeat
//     if (shouldRepeatQuestion) {
//       setCurrentQuestionObj(questions[currentQuestionIndex]);
//       setTypedQuestion("");
//       currentQuestionStartTimeRef.current = Date.now();
//       setCurrentQuestionTime(0);
//       await playAudioAndType(questions[currentQuestionIndex]);
//     } else {
//       setCurrentQuestionIndex(prev => prev + 1);
//       if (currentQuestionIndex + 1 < questions.length) {
//         await startNextQuestion();
//       } else {
//         endInterview();
//       }
//     }

//     setIsProcessingAnswer(false);
//     setShowSubmitConfirmation(true);
//     setTimeout(() => setShowSubmitConfirmation(false), 1500);
//   };

//   const endInterview = async () => {
//     if (!interviewActive) return;
//     setInterviewActive(false);
//     if (audioRef.current) audioRef.current.pause();
//     if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

//     if (currentAnswer.trim() && currentQuestionObj) {
//       const newAllAnswers = [...allAnswers];
//       newAllAnswers[currentQuestionIndex] = currentAnswer;
//       setAllAnswers(newAllAnswers);
//     }

//     const answeredCount = allAnswers.filter(a => a).length;
//     const avgTime = answeredCount > 0 ? Math.round(currentQuestionTime / answeredCount) : 0;
//     setAverageResponseTime(avgTime);

//     await generateFinalReport();
//   };

//   // ========== Generate Final Report ==========
//   const generateFinalReport = async () => {
//     setIsBatchEvaluating(true);
//     try {
//       const answeredIndices = allAnswers.map((a, idx) => (a ? idx : null)).filter(i => i !== null);
//       const answeredEvaluations = answeredIndices.map(idx => evaluations[idx]).filter(e => e && e.score);

//       const avgScore =
//         answeredEvaluations.length > 0
//           ? answeredEvaluations.reduce((sum, e) => sum + (e.score || 5), 0) / answeredEvaluations.length
//           : 0;

//       const strengths = [];
//       const weaknesses = [];
//       answeredEvaluations.forEach(e => {
//         if (e.strengths) strengths.push(...e.strengths);
//         if (e.weaknesses) weaknesses.push(...e.weaknesses);
//       });

//       const report = {
//         score: Math.round(avgScore * 10),
//         technical: Math.round(avgScore * 10),
//         clarity: Math.round(avgScore * 10),
//         confidence: Math.round(avgScore * 10),
//         role: jobTitle,
//         level: "Mid-Level",
//         totalQuestions: questions.length,
//         answered: answeredIndices.length,
//         averageResponseTime: averageResponseTime,
//         evaluations: answeredEvaluations,
//         answers: allAnswers.filter(a => a),
//         strengths: strengths.slice(0, 5),
//         weaknesses: weaknesses.slice(0, 5),
//       };

//       await saveInterviewToDatabase(report);
//       setFinalReport(report);
//       setShowResults(true);
//     } catch (error) {
//       console.error("Report generation error:", error);
//       setFinalReport({ error: true, message: "Failed to generate report" });
//       setShowResults(true);
//     } finally {
//       setIsBatchEvaluating(false);
//     }
//   };

//   const saveInterviewToDatabase = async (report) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token || !resumeId) return;

//       const payload = {
//         resumeId,
//         role: jobTitle,
//         questions: questions.map((q, idx) => ({
//           question: q,
//           userAnswer: allAnswers[idx] || "",
//           score: (evaluations[idx]?.score || 5) * 10,
//           responseTime: 0,
//           feedback: {
//             strengths: evaluations[idx]?.strengths || [],
//             improvements: evaluations[idx]?.weaknesses || [],
//             suggestions: evaluations[idx]?.improvement || [],
//           },
//         })),
//         overallScore: report.score,
//         technicalScore: report.technical,
//         clarityScore: report.clarity,
//         confidenceScore: report.confidence,
//         averageResponseTime: averageResponseTime,
//         totalQuestionsAnswered: allAnswers.filter(a => a).length,
//       };

//       await fetch("http://localhost:5000/api/interview/save-resume-session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//         body: JSON.stringify(payload),
//       });
//     } catch (err) {
//       console.error("Save error:", err);
//     }
//   };

//   // Recording functions
//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       micStreamRef.current = stream;
//       const recorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = recorder;
//       audioChunksRef.current = [];
//       recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
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
//           body: formData,
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

//   const formatTime = seconds => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
//   };

//   const getTimeColor = () => {
//     if (timeRemaining <= CRITICAL_TIME_THRESHOLD) return "#ef4444";
//     if (timeRemaining <= TIME_WARNING_THRESHOLD) return "#f59e0b";
//     return "var(--color-primary)";
//   };

//   const getTimePercentage = () => (timeRemaining / totalTimeSeconds) * 100;

//   const startInterview = () => {
//     setInterviewStarted(true);
//     setInterviewActive(true);
//     setTimeRemaining(totalTimeSeconds);
//     setCurrentQuestionIndex(0);
//     setAllAnswers(new Array(questions.length).fill(null));
//     setEvaluations(new Array(questions.length).fill(null));
//     evaluationsRef.current = new Array(questions.length).fill(null);
//   };

//   const resetInterview = () => {
//     setShowResults(false);
//     setFinalReport(null);
//     setInterviewStarted(false);
//     setInterviewActive(true);
//     setCurrentQuestionIndex(0);
//     setAllAnswers(new Array(questions.length).fill(null));
//     setEvaluations(new Array(questions.length).fill(null));
//     setCurrentAnswer("");
//     setCurrentQuestionObj(null);
//     setTypedQuestion("");
//     setCurrentFeedback("");
//     setTypedFeedback("");
//     setTimeRemaining(totalTimeSeconds);
//     setAverageResponseTime(0);
//     setConversationHistory([]);
//   };

//   // ========== RENDER ==========

//   if (!questionsReady) {
//     return (
//       <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
//         <div className="relative w-20 h-20 mx-auto mb-4">
//           <div className="absolute inset-0 rounded-full border-4 animate-spin" style={{ borderColor: `${'var(--color-primary)'}20`, borderTopColor: 'var(--color-primary)' }}></div>
//           <div className="absolute inset-0 flex items-center justify-center"><i className="fas fa-robot text-2xl" style={{ color: 'var(--color-primary)' }}></i></div>
//         </div>
//         <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Loading your personalized interview...</p>
//         <button onClick={() => navigate("/resume-analyzer")} className="mt-6 px-6 py-2 rounded-lg border" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>Back to Resume Analyzer</button>
//       </div>
//     );
//   }

//   // Results screen (inline)
//   if (showResults && finalReport) {
//     const totalScore = finalReport.score || 0;
//     const strengths = finalReport.strengths || [];
//     const weaknesses = finalReport.weaknesses || [];
//     return (
//       <div className="animate-fadeIn min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
//         <div className="max-w-4xl mx-auto">
//           <div className="rounded-2xl shadow-2xl border p-8" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4" style={{ backgroundColor: `${'var(--color-primary)'}10`, borderColor: `${'var(--color-primary)'}20` }}>
//                 <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>Interview Complete</span>
//               </div>
//               <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Your Results</h2>
//               {jobTitle && <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Interview for: <strong>{jobTitle}</strong></p>}
//             </div>

//             <div className="flex justify-center mb-8">
//               <div className="relative w-40 h-40">
//                 <svg className="w-full h-full transform -rotate-90">
//                   <circle cx="80" cy="80" r="72" fill="none" stroke={`${'var(--color-primary)'}20`} strokeWidth="8" />
//                   <circle cx="80" cy="80" r="72" fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeDasharray={`${(totalScore / 100) * 452} 452`} strokeLinecap="round" className="transition-all duration-1000" />
//                 </svg>
//                 <div className="absolute inset-0 flex flex-col items-center justify-center">
//                   <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{totalScore}%</span>
//                   <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Overall Score</span>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4 mb-8">
//               <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${'var(--color-primary)'}5` }}>
//                 <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>{finalReport.answered}</div>
//                 <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Questions Answered</div>
//               </div>
//               <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${'var(--color-secondary)'}5` }}>
//                 <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-secondary)' }}>{finalReport.totalQuestions}</div>
//                 <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Questions</div>
//               </div>
//             </div>

//             {strengths.length > 0 && (
//               <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: `${'var(--color-success)'}10` }}>
//                 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-success)' }}><i className="fas fa-star"></i> Top Strengths</h3>
//                 <ul className="space-y-2">
//                   {strengths.map((s, i) => (
//                     <li key={i} className="flex items-start gap-2 text-sm"><i className="fas fa-check-circle text-green-500 mt-0.5"></i><span style={{ color: 'var(--color-text-primary)' }}>{s}</span></li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {weaknesses.length > 0 && (
//               <div className="mb-8 p-4 rounded-xl" style={{ backgroundColor: `${'var(--color-error)'}10` }}>
//                 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-error)' }}><i className="fas fa-chart-line"></i> Areas for Improvement</h3>
//                 <ul className="space-y-2">
//                   {weaknesses.map((w, i) => (
//                     <li key={i} className="flex items-start gap-2 text-sm"><i className="fas fa-arrow-up text-red-500 mt-0.5"></i><span style={{ color: 'var(--color-text-primary)' }}>{w}</span></li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div className="flex gap-3">
//               <button onClick={resetInterview} className="flex-1 py-3 border rounded-xl transition-all" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }}>
//                 <i className="fas fa-redo mr-2"></i> Practice Again
//               </button>
//               <button onClick={() => navigate("/dashboard")} className="flex-1 py-3 text-white rounded-xl transition-all" style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}>
//                 <i className="fas fa-tachometer-alt mr-2"></i> Back to Dashboard
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Start screen
//   if (!interviewStarted) {
//     return (
//       <div className="flex flex-col items-center justify-center py-8 sm:py-12 animate-fadeIn">
//         <div className="max-w-md w-full mx-auto text-center">
//           <div className="relative mb-6">
//             <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
//               <i className="fas fa-clipboard-list text-white text-4xl"></i>
//             </div>
//             <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg animate-bounce">
//               <i className="fas fa-microphone-alt text-white text-xs"></i>
//             </div>
//           </div>
//           <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Resume‑Based Interview</h2>
//           <p className="text-sm sm:text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>Answer questions tailored to your resume and the job description</p>
//           <div className="grid grid-cols-2 gap-3 mb-8">
//             <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//               <i className="fas fa-briefcase text-primary text-xl mb-2 block"></i>
//               <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Role</p>
//               <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{jobTitle || "Not specified"}</p>
//             </div>
//             <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//               <i className="fas fa-question-circle text-secondary text-xl mb-2 block"></i>
//               <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Questions</p>
//               <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{questions.length}</p>
//             </div>
//             <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//               <i className="fas fa-hourglass-half text-accent text-xl mb-2 block"></i>
//               <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Duration</p>
//               <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{totalTimeSeconds / 60} minutes</p>
//             </div>
//             <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//               <i className="fas fa-chart-line text-primary text-xl mb-2 block"></i>
//               <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Match</p>
//               <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{isHighMatch ? "High" : "Standard"}</p>
//             </div>
//           </div>
//           <div className="p-5 rounded-xl border mb-8 text-left" style={{ backgroundColor: `${'var(--color-primary)'}05`, borderColor: `${'var(--color-primary)'}20` }}>
//             <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}><i className="fas fa-info-circle text-primary"></i> Assessment Format</h3>
//             <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
//               <li className="flex items-center gap-2"><i className="fas fa-infinity text-primary text-xs"></i> Dynamic question flow</li>
//               <li className="flex items-center gap-2"><i className="fas fa-stopwatch text-primary text-xs"></i> Time‑bound assessment</li>
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

//   // Batch evaluation screen
//   if (isBatchEvaluating) {
//     return (
//       <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
//         <div className="relative">
//           <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
//           <div className="absolute inset-0 flex items-center justify-center"><i className="fas fa-brain text-primary text-2xl animate-pulse"></i></div>
//         </div>
//         <p className="mt-6 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Evaluating your responses...</p>
//         <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Questions answered: {allAnswers.filter(a => a).length} / {questions.length}</p>
//         <div className="mt-4 w-48 h-1 bg-primary/20 rounded-full overflow-hidden"><div className="h-full w-3/4 bg-primary rounded-full animate-progress"></div></div>
//       </div>
//     );
//   }

//   // Live interview UI
//   return (
//     <div className="animate-fadeIn relative min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
//       <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
//         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
//       </div>
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
//           <div className="flex flex-wrap gap-4">
//             <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
//               <i className="fas fa-check-circle text-primary text-sm"></i>
//               <div><p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Answered</p><p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{allAnswers.filter(a => a).length}</p></div>
//             </div>
//             <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-secondary)'}10` }}>
//               <i className="fas fa-question-circle text-secondary text-sm"></i>
//               <div><p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Current</p><p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>#{currentQuestionIndex + 1}</p></div>
//             </div>
//             <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-accent)'}10` }}>
//               <i className="fas fa-clock text-accent text-sm"></i>
//               <div><p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Avg Time</p><p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{averageResponseTime || 0}s</p></div>
//             </div>
//           </div>
//           <div className="relative">
//             <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100">
//               <circle cx="50" cy="50" r="42" stroke="var(--color-border)" strokeWidth="6" fill="none" />
//               <circle cx="50" cy="50" r="42" stroke={getTimeColor()} strokeWidth="6" fill="none" strokeDasharray="264" strokeDashoffset={264 * (1 - getTimePercentage() / 100)} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
//             </svg>
//             <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-base sm:text-lg font-bold" style={{ color: getTimeColor() }}>{formatTime(timeRemaining)}</span></div>
//           </div>
//         </div>

//         {showTimeWarning && (
//           <div className="mb-4 p-3 rounded-lg animate-shake" style={{ backgroundColor: '#fef3c7', borderLeft: `4px solid #f59e0b` }}>
//             <div className="flex items-center gap-2"><i className="fas fa-exclamation-triangle text-amber-500"></i><span className="text-sm text-amber-700">⚠️ Only {Math.floor(timeRemaining / 60)} minute(s) remaining!</span></div>
//           </div>
//         )}

//         {/* Question Section */}
//         <div className="mb-6">
//           <div className="flex gap-4">
//             <div className="flex-shrink-0">
//               <div className="relative">
//                 <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${isPlaying || isSpeakingFeedback ? 'scale-110' : ''}`} style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
//                   <i className="fas fa-user-robot text-white text-2xl sm:text-3xl"></i>
//                 </div>
//                 {(isPlaying || isSpeakingFeedback) && (
//                   <>
//                     <div className="absolute -inset-2 rounded-2xl bg-primary/20 animate-ping"></div>
//                     <div className="absolute -inset-1 rounded-2xl bg-primary/30 animate-pulse"></div>
//                   </>
//                 )}
//                 <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${(isPlaying || isSpeakingFeedback) ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`}></div>
//               </div>
//             </div>
//             <div className="flex-1">
//               <div className="p-5 rounded-xl border shadow-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//                 <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
//                   <div className="flex items-center gap-2"><i className="fas fa-question-circle text-primary text-sm"></i><span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Question #{currentQuestionIndex + 1}</span></div>
//                   {currentQuestionTime > 0 && (<div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${'var(--color-primary)'}10` }}><i className="fas fa-hourglass-half text-primary text-xs"></i><span className="text-xs font-mono" style={{ color: 'var(--color-primary)' }}>{currentQuestionTime}s</span></div>)}
//                 </div>
//                 <div className="min-h-[100px]">
//                   {isGeneratingNext || isProcessingAnswer ? (
//                     <div className="flex flex-col items-center justify-center py-6">
//                       <div className="flex gap-1 mb-3"><div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div><div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div><div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div></div>
//                       <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{isProcessingAnswer ? 'Evaluating your answer...' : 'Loading question...'}</p>
//                     </div>
//                   ) : (
//                     <>
//                       <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{typedQuestion}{isPlaying && <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-blink"></span>}</p>
//                       {currentQuestionObj && !isGeneratingNext && !isProcessingAnswer && (
//                         <button onClick={() => playAudioAndType(currentQuestionObj)} disabled={isPlaying} className="mt-3 text-xs flex items-center gap-1 transition-colors hover:text-primary" style={{ color: 'var(--color-text-secondary)' }}><i className="fas fa-volume-up"></i> Replay question</button>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Feedback Area */}
//         {currentFeedback && (
//           <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: `${'var(--color-primary)'}10`, borderLeft: `3px solid var(--color-primary)` }}>
//             <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}><i className="fas fa-comment-dots mr-1"></i> Recruiter says:</p>
//             <p className="text-base" style={{ color: 'var(--color-text-primary)' }}>{typedFeedback}{typedFeedback.length < currentFeedback.length && <span className="animate-blink">|</span>}</p>
//           </div>
//         )}

//         {/* Answer Section */}
//         <div className="relative">
//           <div className="p-5 rounded-xl border shadow-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
//             <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}><i className="fas fa-edit text-secondary"></i><span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Your Response</span></div>
//             <textarea className="w-full p-4 rounded-lg border resize-none transition-all focus:outline-none focus:ring-2" placeholder="Type your answer here... or click the microphone to record" value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} rows={5} disabled={isGeneratingNext || isProcessingAnswer || !interviewActive} style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
//             <div className="flex flex-wrap gap-3 mt-4">
//               <button onClick={isRecording ? stopRecording : startRecording} disabled={isGeneratingNext || isProcessingAnswer || !interviewActive} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'border-2 hover:scale-105'}`} style={{ backgroundColor: isRecording ? '#ef4444' : 'transparent', borderColor: 'var(--color-primary)', color: isRecording ? 'white' : 'var(--color-primary)' }}><i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>{isRecording ? 'Stop Recording' : 'Record Answer'}</button>
//               <button onClick={submitAnswer} disabled={!currentAnswer.trim() || isGeneratingNext || isProcessingAnswer || !interviewActive} className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}><i className="fas fa-paper-plane"></i> Submit Answer</button>
//             </div>
//             {showSubmitConfirmation && (
//               <div className="mt-3 p-2 rounded-lg text-center animate-slideUp" style={{ backgroundColor: `${'var(--color-primary)'}10` }}><i className="fas fa-check-circle text-green-500 mr-2"></i><span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Submitted! Processing feedback...</span></div>
//             )}
//             <div className="mt-5 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
//               <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}><span>Assessment Progress</span><span>{allAnswers.filter(a => a).length} / {questions.length} responses</span></div>
//               <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(allAnswers.filter(a => a).length / questions.length) * 100}%`, background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}></div></div>
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

// export default ResumeInterview;

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { textToSpeech } from "../services/aiApi";
import BASE_URL from "../config";

const ResumeInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ========== Refs ==========
  const audioRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const micStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentQuestionStartTimeRef = useRef(null);
  const isAudioPlayingRef = useRef(false);
  const audioQueueRef = useRef([]);
  const evaluationsRef = useRef([]);

  // ========== State ==========
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionObj, setCurrentQuestionObj] = useState(null);
  const [typedQuestion, setTypedQuestion] = useState("");
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [typedFeedback, setTypedFeedback] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
  const [interviewActive, setInterviewActive] = useState(true);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeakingFeedback, setIsSpeakingFeedback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(30 * 60);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [sessionId] = useState(`resume_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [jobTitle, setJobTitle] = useState("");
  const [isHighMatch, setIsHighMatch] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  const TIME_WARNING_THRESHOLD = 60;
  const CRITICAL_TIME_THRESHOLD = 30;

  // Helper: extract question text
  const getQuestionText = (question) => {
    if (!question) return "";
    if (typeof question === "string") return question;
    if (typeof question === "object") {
      if (question.question) return question.question;
      if (question.text) return question.text;
      return JSON.stringify(question);
    }
    return String(question);
  };

  // Load questions from location state / localStorage
  useEffect(() => {
    const stateQuestions = location.state?.questions;
    const stateResumeId = location.state?.resumeId;
    const stateJobTitle = location.state?.jobTitle;
    const stateIsHighMatch = location.state?.isHighMatch;

    let storedQuestions = stateQuestions || JSON.parse(localStorage.getItem("resumeQuestions") || "[]");
    const storedResumeId = stateResumeId || localStorage.getItem("resumeId");
    const storedJobTitle = stateJobTitle || localStorage.getItem("jobTitle") || "";
    const storedIsHighMatch = stateIsHighMatch || localStorage.getItem("isHighMatch") === "true";

    if (storedQuestions.length > 0) {
      const formattedQuestions = storedQuestions.map(q => getQuestionText(q));
      setQuestions(formattedQuestions);
      setJobTitle(storedJobTitle);
      setIsHighMatch(storedIsHighMatch);
      setResumeId(storedResumeId);
      setAllAnswers(new Array(formattedQuestions.length).fill(null));
      setEvaluations(new Array(formattedQuestions.length).fill(null));
      evaluationsRef.current = new Array(formattedQuestions.length).fill(null);
    }
    setQuestionsReady(true);
  }, [location]);

  // Timer effect
  useEffect(() => {
    if (!interviewStarted || !interviewActive || showResults) return;
    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (currentQuestionStartTimeRef.current && currentQuestionObj) {
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
  }, [interviewStarted, interviewActive, currentQuestionObj, showResults]);

  // Start first question
  useEffect(() => {
    if (interviewStarted && questions.length > 0 && !currentQuestionObj && !isGeneratingNext && !isProcessingAnswer && !showResults) {
      startNextQuestion();
    }
  }, [interviewStarted, questions, currentQuestionObj, isGeneratingNext, isProcessingAnswer, showResults]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  // ========== Audio Queue with fallback TTS ==========
  const speakWithFallback = async (text) => {
    try {
      const { audioUrl } = await textToSpeech(text);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      return new Promise((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
        audio.play().catch(reject);
      });
    } catch (err) {
      console.warn("Backend TTS failed, using browser SpeechSynthesis", err);
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      });
    }
  };

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

  const playAudioAndType = (text) => {
    if (!text) return Promise.resolve();
    setIsPlaying(true);
    return enqueueAudioJob(async () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

      setTypedQuestion("");
      let i = 0;
      const totalLength = text.length;

      const typingPromise = new Promise((resolve) => {
        const typingSpeed = 30;
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

      const audioPromise = speakWithFallback(text);
      await Promise.all([audioPromise, typingPromise]);
      setIsPlaying(false);
    });
  };

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

      const audioPromise = speakWithFallback(text);
      await Promise.all([audioPromise, typingPromise]);

      await new Promise(resolve => setTimeout(resolve, 300));
      setCurrentFeedback("");
      setTypedFeedback("");
      setIsSpeakingFeedback(false);
    });
  };

  // ========== Evaluation using same endpoint as LiveInterview ==========
  const evaluateCurrentAnswer = async (questionText, answerText) => {
    try {
      const userId = localStorage.getItem("userId") || "guest";
      const response = await fetch(`${BASE_URL}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Id: sessionId,
          userId: userId,
          role: jobTitle || "Software Developer",
          question: questionText,
          answer: answerText,
        }),
      });
      const data = await response.json();
      return data.evaluation;
    } catch (err) {
      console.warn("Evaluation API failed, using fallback", err);
      return {
        score: 5,
        strengths: ["Answer provided"],
        weaknesses: ["Could be improved"],
        recruiter_feedback: "Thank you for your answer. Try to add more detail next time.",
      };
    }
  };

  const formatRecruiterFeedback = (evaluation) => {
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

  const startNextQuestion = async () => {
    if (currentQuestionIndex >= questions.length) {
      endInterview();
      return;
    }

    setIsGeneratingNext(true);
    const questionText = questions[currentQuestionIndex];
    setCurrentQuestionObj(questionText);
    setTypedQuestion("");
    currentQuestionStartTimeRef.current = Date.now();
    setCurrentQuestionTime(0);
    setConversationHistory(prev => [...prev, { role: "assistant", content: questionText }]);
    await playAudioAndType(questionText);
    setIsGeneratingNext(false);
  };

  const processAnswerAndGetNext = async () => {
    if (!currentAnswer.trim() || !currentQuestionObj || isProcessingAnswer) return;
    setIsProcessingAnswer(true);

    if (isRecording && mediaRecorderRef.current) stopRecording();

    const evaluation = await evaluateCurrentAnswer(currentQuestionObj, currentAnswer);
    let feedbackText = evaluation.recruiter_feedback;
    if (!feedbackText) feedbackText = formatRecruiterFeedback(evaluation);
    const shouldRepeatQuestion = evaluation.repeat_question === true;

    // Save answer and evaluation
    const newAllAnswers = [...allAnswers];
    newAllAnswers[currentQuestionIndex] = currentAnswer;
    setAllAnswers(newAllAnswers);

    const newEvaluations = [...evaluations];
    newEvaluations[currentQuestionIndex] = evaluation;
    setEvaluations(newEvaluations);
    evaluationsRef.current = newEvaluations;

    setConversationHistory(prev => [...prev, { role: "user", content: currentAnswer }]);

    // Clear UI
    setCurrentAnswer("");
    setCurrentQuestionObj(null);
    setTypedQuestion("");
    setCurrentQuestionTime(0);

    // Show feedback
    await displayAndSpeakFeedback(feedbackText);

    // Next or repeat
    if (shouldRepeatQuestion) {
      setCurrentQuestionObj(questions[currentQuestionIndex]);
      setTypedQuestion("");
      currentQuestionStartTimeRef.current = Date.now();
      setCurrentQuestionTime(0);
      await playAudioAndType(questions[currentQuestionIndex]);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      if (currentQuestionIndex + 1 < questions.length) {
        await startNextQuestion();
      } else {
        endInterview();
      }
    }

    setIsProcessingAnswer(false);
    setShowSubmitConfirmation(true);
    setTimeout(() => setShowSubmitConfirmation(false), 1500);
  };

  const endInterview = async () => {
    if (!interviewActive) return;
    setInterviewActive(false);
    if (audioRef.current) audioRef.current.pause();
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    if (currentAnswer.trim() && currentQuestionObj) {
      const newAllAnswers = [...allAnswers];
      newAllAnswers[currentQuestionIndex] = currentAnswer;
      setAllAnswers(newAllAnswers);
    }

    const answeredCount = allAnswers.filter(a => a).length;
    const avgTime = answeredCount > 0 ? Math.round(currentQuestionTime / answeredCount) : 0;
    setAverageResponseTime(avgTime);

    await generateFinalReport();
  };

  // ========== Generate Final Report ==========
  const generateFinalReport = async () => {
    setIsBatchEvaluating(true);
    try {
      const answeredIndices = allAnswers.map((a, idx) => (a ? idx : null)).filter(i => i !== null);
      const answeredEvaluations = answeredIndices.map(idx => evaluations[idx]).filter(e => e && e.score);

      const avgScore =
        answeredEvaluations.length > 0
          ? answeredEvaluations.reduce((sum, e) => sum + (e.score || 5), 0) / answeredEvaluations.length
          : 0;

      const strengths = [];
      const weaknesses = [];
      answeredEvaluations.forEach(e => {
        if (e.strengths) strengths.push(...e.strengths);
        if (e.weaknesses) weaknesses.push(...e.weaknesses);
      });

      const report = {
        score: Math.round(avgScore * 10),
        technical: Math.round(avgScore * 10),
        clarity: Math.round(avgScore * 10),
        confidence: Math.round(avgScore * 10),
        role: jobTitle,
        level: "Mid-Level",
        totalQuestions: questions.length,
        answered: answeredIndices.length,
        averageResponseTime: averageResponseTime,
        evaluations: answeredEvaluations,
        answers: allAnswers.filter(a => a),
        questions: answeredIndices.map(i => questions[i]),
        strengths: strengths.slice(0, 5),
        weaknesses: weaknesses.slice(0, 5),
      };

      await saveInterviewToDatabase(report);
      setFinalReport(report);
      setShowResults(true);
    } catch (error) {
      console.error("Report generation error:", error);
      setFinalReport({ error: true, message: "Failed to generate report" });
      setShowResults(true);
    } finally {
      setIsBatchEvaluating(false);
    }
  };

  const saveInterviewToDatabase = async (report) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !resumeId) return;

      const payload = {
        resumeId,
        role: jobTitle,
        questions: questions.map((q, idx) => ({
          question: q,
          userAnswer: allAnswers[idx] || "",
          score: (evaluations[idx]?.score || 5) * 10,
          responseTime: 0,
          feedback: {
            strengths: evaluations[idx]?.strengths || [],
            improvements: evaluations[idx]?.weaknesses || [],
            suggestions: evaluations[idx]?.improvement || [],
          },
        })),
        overallScore: report.score,
        technicalScore: report.technical,
        clarityScore: report.clarity,
        confidenceScore: report.confidence,
        averageResponseTime: averageResponseTime,
        totalQuestionsAnswered: allAnswers.filter(a => a).length,
      };

      await fetch(`${BASE_URL}/api/interview/save-resume-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
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
          body: formData,
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

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= CRITICAL_TIME_THRESHOLD) return "#ef4444";
    if (timeRemaining <= TIME_WARNING_THRESHOLD) return "#f59e0b";
    return "var(--color-primary)";
  };

  const getTimePercentage = () => (timeRemaining / totalTimeSeconds) * 100;

  const startInterview = () => {
    setInterviewStarted(true);
    setInterviewActive(true);
    setTimeRemaining(totalTimeSeconds);
    setCurrentQuestionIndex(0);
    setAllAnswers(new Array(questions.length).fill(null));
    setEvaluations(new Array(questions.length).fill(null));
    evaluationsRef.current = new Array(questions.length).fill(null);
  };

  const resetInterview = () => {
    setShowResults(false);
    setFinalReport(null);
    setInterviewStarted(false);
    setInterviewActive(true);
    setCurrentQuestionIndex(0);
    setAllAnswers(new Array(questions.length).fill(null));
    setEvaluations(new Array(questions.length).fill(null));
    setCurrentAnswer("");
    setCurrentQuestionObj(null);
    setTypedQuestion("");
    setCurrentFeedback("");
    setTypedFeedback("");
    setTimeRemaining(totalTimeSeconds);
    setAverageResponseTime(0);
    setConversationHistory([]);
  };

  // ========== RENDER ==========

  if (!questionsReady) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 animate-spin" style={{ borderColor: `${'var(--color-primary)'}20`, borderTopColor: 'var(--color-primary)' }}></div>
          <div className="absolute inset-0 flex items-center justify-center"><i className="fas fa-robot text-2xl" style={{ color: 'var(--color-primary)' }}></i></div>
        </div>
        <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Loading your personalized interview...</p>
        <button onClick={() => navigate("/resume-analyzer")} className="mt-6 px-6 py-2 rounded-lg border" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>Back to Resume Analyzer</button>
      </div>
    );
  }

  // Results screen (inline) - Detailed per-question view
  if (showResults && finalReport && !finalReport.error) {
    const totalScore = finalReport.score || 0;
    const strengths = finalReport.strengths || [];
    const weaknesses = finalReport.weaknesses || [];
    const questionsList = finalReport.questions || [];
    const answersList = finalReport.answers || [];
    const evalsList = finalReport.evaluations || [];

    return (
      <div className="animate-fadeIn min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl shadow-2xl border p-8" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4" style={{ backgroundColor: `${'var(--color-primary)'}10`, borderColor: `${'var(--color-primary)'}20` }}>
                <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>Interview Complete</span>
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Your Results</h2>
              {jobTitle && <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Interview for: <strong>{jobTitle}</strong></p>}
            </div>

            <div className="flex justify-center mb-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="72" fill="none" stroke={`${'var(--color-primary)'}20`} strokeWidth="8" />
                  <circle cx="80" cy="80" r="72" fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeDasharray={`${(totalScore / 100) * 452} 452`} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{totalScore}%</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Overall Score</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${'var(--color-primary)'}5` }}>
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>{finalReport.answered}</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Questions Answered</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${'var(--color-secondary)'}5` }}>
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-secondary)' }}>{finalReport.totalQuestions}</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Questions</div>
              </div>
            </div>

            {/* Per-question detailed breakdown */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <i className="fas fa-list-check text-primary"></i> Detailed Evaluation
              </h3>
              <div className="space-y-4">
                {questionsList.map((q, idx) => {
                  const evalData = evalsList[idx] || {};
                  const score = evalData.score || 0;
                  const strengthsList = evalData.strengths || [];
                  const weaknessesList = evalData.weaknesses || [];
                  return (
                    <div key={idx} className="border rounded-xl p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
                          Question {idx + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          score >= 7 ? 'bg-green-100 text-green-700' :
                          score >= 5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          Score: {score}/10
                        </span>
                      </div>
                      <p className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>{q}</p>
                      <div className="mb-2">
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Your answer:</p>
                        <p className="text-sm italic" style={{ color: 'var(--color-text-primary)' }}>{answersList[idx] || "No answer"}</p>
                      </div>
                      {strengthsList.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-green-600">✓ Strengths:</p>
                          <ul className="list-disc list-inside text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {strengthsList.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                      {weaknessesList.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-red-600">⚠ Areas to improve:</p>
                          <ul className="list-disc list-inside text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {weaknessesList.map((w, i) => <li key={i}>{w}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aggregated strengths & weaknesses */}
            {strengths.length > 0 && (
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: `${'var(--color-success)'}10` }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-success)' }}><i className="fas fa-star"></i> Top Strengths (Overall)</h3>
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><i className="fas fa-check-circle text-green-500 mt-0.5"></i><span style={{ color: 'var(--color-text-primary)' }}>{s}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {weaknesses.length > 0 && (
              <div className="mb-8 p-4 rounded-xl" style={{ backgroundColor: `${'var(--color-error)'}10` }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-error)' }}><i className="fas fa-chart-line"></i> Areas for Improvement (Overall)</h3>
                <ul className="space-y-2">
                  {weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><i className="fas fa-arrow-up text-red-500 mt-0.5"></i><span style={{ color: 'var(--color-text-primary)' }}>{w}</span></li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={resetInterview} className="flex-1 py-3 border rounded-xl transition-all" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }}>
                <i className="fas fa-redo mr-2"></i> Practice Again
              </button>
              <button onClick={() => navigate("/dashboard")} className="flex-1 py-3 text-white rounded-xl transition-all" style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}>
                <i className="fas fa-tachometer-alt mr-2"></i> Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error fallback for results
  if (showResults && finalReport?.error) {
    return (
      <div className="animate-fadeIn min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-2xl shadow-2xl border p-8" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <i className="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Error Generating Report</h2>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>{finalReport.message}</p>
            <button onClick={resetInterview} className="px-6 py-3 rounded-xl text-white" style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  // Start screen
  if (!interviewStarted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 animate-fadeIn">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}>
              <i className="fas fa-clipboard-list text-white text-4xl"></i>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg animate-bounce">
              <i className="fas fa-microphone-alt text-white text-xs"></i>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Resume‑Based Interview</h2>
          <p className="text-sm sm:text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>Answer questions tailored to your resume and the job description</p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <i className="fas fa-briefcase text-primary text-xl mb-2 block"></i>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Role</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{jobTitle || "Not specified"}</p>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <i className="fas fa-question-circle text-secondary text-xl mb-2 block"></i>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Questions</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{questions.length}</p>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <i className="fas fa-hourglass-half text-accent text-xl mb-2 block"></i>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Duration</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{totalTimeSeconds / 60} minutes</p>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <i className="fas fa-chart-line text-primary text-xl mb-2 block"></i>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Match</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{isHighMatch ? "High" : "Standard"}</p>
            </div>
          </div>
          <div className="p-5 rounded-xl border mb-8 text-left" style={{ backgroundColor: `${'var(--color-primary)'}05`, borderColor: `${'var(--color-primary)'}20` }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}><i className="fas fa-info-circle text-primary"></i> Assessment Format</h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <li className="flex items-center gap-2"><i className="fas fa-infinity text-primary text-xs"></i> Dynamic question flow</li>
              <li className="flex items-center gap-2"><i className="fas fa-stopwatch text-primary text-xs"></i> Time‑bound assessment</li>
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

  // Batch evaluation screen
  if (isBatchEvaluating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center"><i className="fas fa-brain text-primary text-2xl animate-pulse"></i></div>
        </div>
        <p className="mt-6 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Evaluating your responses...</p>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Questions answered: {allAnswers.filter(a => a).length} / {questions.length}</p>
        <div className="mt-4 w-48 h-1 bg-primary/20 rounded-full overflow-hidden"><div className="h-full w-3/4 bg-primary rounded-full animate-progress"></div></div>
      </div>
    );
  }

  // Live interview UI (unchanged)
  return (
    <div className="animate-fadeIn relative min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
              <i className="fas fa-check-circle text-primary text-sm"></i>
              <div><p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Answered</p><p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{allAnswers.filter(a => a).length}</p></div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-secondary)'}10` }}>
              <i className="fas fa-question-circle text-secondary text-sm"></i>
              <div><p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Current</p><p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>#{currentQuestionIndex + 1}</p></div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: `${'var(--color-accent)'}10` }}>
              <i className="fas fa-clock text-accent text-sm"></i>
              <div><p className="text-xs opacity-70" style={{ color: 'var(--color-text-secondary)' }}>Avg Time</p><p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{averageResponseTime || 0}s</p></div>
            </div>
          </div>
          <div className="relative">
            <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="var(--color-border)" strokeWidth="6" fill="none" />
              <circle cx="50" cy="50" r="42" stroke={getTimeColor()} strokeWidth="6" fill="none" strokeDasharray="264" strokeDashoffset={264 * (1 - getTimePercentage() / 100)} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-base sm:text-lg font-bold" style={{ color: getTimeColor() }}>{formatTime(timeRemaining)}</span></div>
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
                  <div className="flex items-center gap-2"><i className="fas fa-question-circle text-primary text-sm"></i><span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Question #{currentQuestionIndex + 1}</span></div>
                  {currentQuestionTime > 0 && (<div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${'var(--color-primary)'}10` }}><i className="fas fa-hourglass-half text-primary text-xs"></i><span className="text-xs font-mono" style={{ color: 'var(--color-primary)' }}>{currentQuestionTime}s</span></div>)}
                </div>
                <div className="min-h-[100px]">
                  {isGeneratingNext || isProcessingAnswer ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="flex gap-1 mb-3"><div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div><div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div><div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div></div>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{isProcessingAnswer ? 'Evaluating your answer...' : 'Loading question...'}</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{typedQuestion}{isPlaying && <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-blink"></span>}</p>
                      {currentQuestionObj && !isGeneratingNext && !isProcessingAnswer && (
                        <button onClick={() => playAudioAndType(currentQuestionObj)} disabled={isPlaying} className="mt-3 text-xs flex items-center gap-1 transition-colors hover:text-primary" style={{ color: 'var(--color-text-secondary)' }}><i className="fas fa-volume-up"></i> Replay question</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Area */}
        {currentFeedback && (
          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: `${'var(--color-primary)'}10`, borderLeft: `3px solid var(--color-primary)` }}>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}><i className="fas fa-comment-dots mr-1"></i> Recruiter says:</p>
            <p className="text-base" style={{ color: 'var(--color-text-primary)' }}>{typedFeedback}{typedFeedback.length < currentFeedback.length && <span className="animate-blink">|</span>}</p>
          </div>
        )}

        {/* Answer Section */}
        <div className="relative">
          <div className="p-5 rounded-xl border shadow-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}><i className="fas fa-edit text-secondary"></i><span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Your Response</span></div>
            <textarea className="w-full p-4 rounded-lg border resize-none transition-all focus:outline-none focus:ring-2" placeholder="Type your answer here... or click the microphone to record" value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} rows={5} disabled={isGeneratingNext || isProcessingAnswer || !interviewActive} style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
            <div className="flex flex-wrap gap-3 mt-4">
              <button onClick={isRecording ? stopRecording : startRecording} disabled={isGeneratingNext || isProcessingAnswer || !interviewActive} className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'border-2 hover:scale-105'}`} style={{ backgroundColor: isRecording ? '#ef4444' : 'transparent', borderColor: 'var(--color-primary)', color: isRecording ? 'white' : 'var(--color-primary)' }}><i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>{isRecording ? 'Stop Recording' : 'Record Answer'}</button>
              <button onClick={submitAnswer} disabled={!currentAnswer.trim() || isGeneratingNext || isProcessingAnswer || !interviewActive} className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}><i className="fas fa-paper-plane"></i> Submit Answer</button>
            </div>
            {showSubmitConfirmation && (
              <div className="mt-3 p-2 rounded-lg text-center animate-slideUp" style={{ backgroundColor: `${'var(--color-primary)'}10` }}><i className="fas fa-check-circle text-green-500 mr-2"></i><span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Submitted! Processing feedback...</span></div>
            )}
            <div className="mt-5 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}><span>Assessment Progress</span><span>{allAnswers.filter(a => a).length} / {questions.length} responses</span></div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(allAnswers.filter(a => a).length / questions.length) * 100}%`, background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}></div></div>
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

export default ResumeInterview;