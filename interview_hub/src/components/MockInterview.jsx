import React, { useState, useEffect } from "react";
import InterviewSetup from "./InterviewSetup";
import Instructions from "./Instructions";
import LiveInterview from "./LiveInterview";
import InterviewSummary from "./InterviewSummary";
import { useTheme } from "../ThemeContext";
import ThemeToggle from "../ThemeToggle";
import { getStoredUser } from "../services/authApi";

const MockInterview = () => {
  const { isDarkMode } = useTheme()
  const [step, setStep] = useState("setup");
  const [interviewData, setInterviewData] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get the logged in user
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleSetupComplete = (data) => {
    console.log("Setup data received:", data);
    setInterviewData(data);
    setStep("instructions");
  };

  const handleStartInterview = () => {
    console.log("Starting interview with data:", interviewData);
    setStep("live");
  };

  const handleInterviewComplete = (report) => {
    console.log("Interview complete:", report);
    setFinalReport(report);
    setStep("summary");
  };

  const steps = [
    { id: "setup", label: "Setup", icon: "fa-cog", description: "Configure your interview" },
    { id: "instructions", label: "Instructions", icon: "fa-list", description: "Review guidelines" },
    { id: "live", label: "Live Interview", icon: "fa-microphone", description: "Start practicing" },
    { id: "summary", label: "Summary", icon: "fa-chart-bar", description: "View results" }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen transition-colors duration-300"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-64 sm:w-96 h-64 sm:h-96" 
             style={{ backgroundColor: 'var(--color-primary)', opacity: '0.05' }}></div>
        <div className="absolute bottom-0 -right-40 w-64 sm:w-96 h-64 sm:h-96" 
             style={{ backgroundColor: 'var(--color-secondary)', opacity: '0.05' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-[500px] h-64 sm:h-[500px]" 
             style={{ background: `linear-gradient(to right, ${'var(--color-primary)'}10, ${'var(--color-secondary)'}10)`, borderRadius: '50%', filter: 'blur(80px)' }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        {/* Professional Progress Tracker */}
        <div className="mb-12 sm:mb-16 relative">
          {/* Background Track */}
          <div className="absolute top-6 left-0 right-0 h-1 rounded-full"
               style={{ backgroundColor: 'var(--color-border)' }}></div>
          
          {/* Animated Progress */}
          <div className="absolute top-6 left-0 h-1 rounded-full transition-all duration-700 shadow-lg"
               style={{ 
                 width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                 background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`
               }}></div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between relative">
            {steps.map((s, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              
              return (
                <div key={s.id} className="relative flex flex-col items-center group">
                  {/* Step Icon Container */}
                  <div className={`
                    relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl
                    transition-all duration-500 transform
                    ${isCompleted ? 'text-white shadow-xl scale-110' : ''}
                    ${isCurrent ? 'shadow-2xl scale-110 sm:scale-125' : ''}
                  `}
                  style={{
                    backgroundColor: isCompleted ? 'var(--color-primary)' : 
                                   isCurrent ? 'var(--color-bg-secondary)' : 
                                   'var(--color-bg-secondary)',
                    border: !isCompleted && !isCurrent ? `2px solid var(--color-border)` : 'none',
                    color: isCompleted ? 'white' : 
                          isCurrent ? 'var(--color-primary)' : 
                          'var(--color-text-secondary)',
                    boxShadow: isCurrent ? `0 15px 25px -10px ${'var(--color-primary)'}30` : 
                               isCompleted ? `0 10px 20px -8px ${'var(--color-primary)'}30` : 'none'
                  }}>
                    {isCompleted ? (
                      <i className="fas fa-check text-sm sm:text-base"></i>
                    ) : (
                      <i className={`fas ${s.icon} text-sm sm:text-base`}></i>
                    )}

                    {/* Pulse Effect for Current Step */}
                    {isCurrent && (
                      <>
                        <span className="absolute inset-0 rounded-xl sm:rounded-2xl animate-ping" 
                              style={{ backgroundColor: `${'var(--color-primary)'}30` }}></span>
                        <span className="absolute -inset-2 sm:-inset-3 rounded-2xl sm:rounded-3xl animate-pulse" 
                              style={{ backgroundColor: `${'var(--color-primary)'}10` }}></span>
                      </>
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 sm:mt-3 md:mt-4 text-center max-w-[60px] sm:max-w-none">
                    <span className="text-[10px] sm:text-xs md:text-sm font-bold block transition-colors duration-300"
                          style={{ 
                            color: isCurrent ? 'var(--color-primary)' : 
                                   isCompleted ? 'var(--color-secondary)' : 
                                   'var(--color-text-secondary)'
                          }}>
                      {s.label}
                    </span>
                    <span className="text-[8px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 block hidden sm:block" 
                          style={{ color: 'var(--color-text-secondary)' }}>
                      {s.description}
                    </span>
                  </div>

                  {/* Elegant Connector Dots */}
                  {idx < steps.length - 1 && (
                    <div className="absolute -right-4 sm:-right-6 md:-right-8 top-5 sm:top-6 md:top-8 hidden md:flex gap-0.5 sm:gap-1">
                      <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: `${'var(--color-primary)'}50` }}></div>
                      <div className="w-1 h-1 rounded-full animate-pulse delay-150" style={{ backgroundColor: `${'var(--color-secondary)'}50` }}></div>
                      <div className="w-1 h-1 rounded-full animate-pulse delay-300" style={{ backgroundColor: `${'var(--color-accent)'}50` }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="relative group">
          {/* Card Glow Effect */}
          <div className="absolute -inset-1 rounded-2xl sm:rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"
               style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary), var(--color-accent))` }}></div>
          
          {/* Main Card */}
          <div className="relative rounded-xl sm:rounded-2xl shadow-2xl border overflow-hidden"
               style={{ 
                 backgroundColor: 'var(--color-bg-secondary)',
                 borderColor: 'var(--color-border)'
               }}>
            
            {/* Step Header with Gradient */}
            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b"
                 style={{ 
                   borderColor: 'var(--color-border)',
                   background: `linear-gradient(to right, ${'var(--color-primary)'}08, ${'var(--color-secondary)'}08, ${'var(--color-accent)'}08)`
                 }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl shadow-lg"
                       style={{ background: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))` }}>
                    <i className={`fas ${steps[currentStepIndex]?.icon}`}></i>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {steps[currentStepIndex]?.label}
                    </h2>
                    <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {steps[currentStepIndex]?.description}
                    </p>
                  </div>
                </div>
                
                {/* Elegant Step Counter */}
                <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full"
                     style={{ background: `linear-gradient(to right, ${'var(--color-primary)'}15, ${'var(--color-secondary)'}15)` }}>
                  <i className="fas fa-flag-checkered text-[10px] sm:text-xs" style={{ color: 'var(--color-primary)' }}></i>
                  <span className="text-[10px] sm:text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                    Step {currentStepIndex + 1}/{steps.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-4 sm:p-6 md:p-8 animate-fadeIn" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              {step === "setup" && (
                <InterviewSetup onComplete={handleSetupComplete} />
              )}

              {step === "instructions" && interviewData && (
                <Instructions
                  interviewData={interviewData}
                  onStart={handleStartInterview}
                />
              )}

              {step === "live" && interviewData && (
                <LiveInterview
                  interviewData={interviewData}
                  user={user}
                  onFinish={handleInterviewComplete}
                />
              )}

              {step === "summary" && finalReport && (
                <InterviewSummary report={finalReport} />
              )}
            </div>
          </div>
        </div>

        {/* Professional Tip Section */}
        {step !== "summary" && (
          <div className="mt-6 sm:mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg border"
                 style={{ 
                   backgroundColor: 'var(--color-bg-secondary)',
                   borderColor: 'var(--color-border)'
                 }}>
              <i className="fas fa-lightbulb text-xs sm:text-sm" style={{ color: 'var(--color-accent)' }}></i>
              <span className="text-[11px] sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {step === "setup" && "Fill in your details to begin the interview setup"}
                {step === "instructions" && "Take a moment to read through the guidelines carefully"}
                {step === "live" && "Speak clearly and take your time with each answer"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .delay-150 { animation-delay: 150ms; }
        .delay-300 { animation-delay: 300ms; }
        
        @media (max-width: 640px) {
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-out forwards;
          }
        }
      `}</style>
    </div>
  );
};

export default MockInterview;