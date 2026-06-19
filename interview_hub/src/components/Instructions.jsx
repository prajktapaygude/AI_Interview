import React from "react";
import { useTheme } from "../ThemeContext";
import ThemeToggle from "../ThemeToggle";
import BASE_URL from "../config";
const Instructions = ({ interviewData, onStart }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
             style={{ background: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))` }}>
          <i className="fas fa-list-check text-white text-xl"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Interview Instructions
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Review before starting</p>
        </div>
      </div>

      {/* Setup Summary */}
      <div className="rounded-xl p-5 border"
           style={{ 
             background: `linear-gradient(to bottom right, ${'var(--color-primary)'}10, ${'var(--color-secondary)'}10)`,
             borderColor: `${'var(--color-primary)'}20`
           }}>
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-primary)' }}>Your Interview Setup:</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div style={{ color: 'var(--color-text-secondary)' }}>Role:</div>
          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.role}</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Tech Stack:</div>
          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.techStack}</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Level:</div>
          <div className="font-medium capitalize" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.level}</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Difficulty:</div>
          <div className="font-medium capitalize" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.difficulty}</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Duration:</div>
          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{interviewData?.duration} minutes</div>
        </div>
      </div>

      {/* Instructions List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Guidelines:</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${'var(--color-success)'}20` }}>
              <i className="fas fa-wifi text-xs" style={{ color: 'var(--color-success)' }}></i>
            </div>
            <span>Ensure stable internet connection</span>
          </li>
          <li className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${'var(--color-success)'}20` }}>
              <i className="fas fa-video text-xs" style={{ color: 'var(--color-success)' }}></i>
            </div>
            <span>Your session will be recorded for analysis</span>
          </li>
          <li className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${'var(--color-error)'}20` }}>
              <i className="fas fa-ban text-xs" style={{ color: 'var(--color-error)' }}></i>
            </div>
            <span>Do not switch tabs during the interview</span>
          </li>
          <li className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${'var(--color-success)'}20` }}>
              <i className="fas fa-microphone text-xs" style={{ color: 'var(--color-success)' }}></i>
            </div>
            <span>Answer clearly and confidently</span>
          </li>
          <li className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: `${'var(--color-accent)'}20` }}>
              <i className="fas fa-clock text-xs" style={{ color: 'var(--color-accent)' }}></i>
            </div>
            <span>Take your time, there's no rush</span>
          </li>
        </ul>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="w-full py-4 px-6 text-white font-semibold rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-3"
        style={{ 
          background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
        }}
      >
        <i className="fas fa-play-circle"></i>
        Start Interview
      </button>
    </div>
  );
};

export default Instructions;