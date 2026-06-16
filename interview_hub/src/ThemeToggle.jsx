import React from 'react';
import { useTheme } from './ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  // Define all styles inline - no external CSS dependencies
  const buttonStyle = {
    position: 'relative',
    zIndex: 9999,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
    color: isDarkMode ? '#fbbf24' : '#6b7280',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  };

  const iconStyle = {
    fontSize: '20px',
    transition: 'transform 0.3s ease'
  };

  const tooltipStyle = {
    position: 'absolute',
    bottom: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    color: isDarkMode ? '#f3f4f6' : '#1f2937',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'none',
    border: '1px solid',
    borderColor: isDarkMode ? '#4b5563' : '#e5e7eb'
  };

  return (
    <button
      onClick={toggleTheme}
      style={buttonStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1) rotate(180deg)';
        const tooltip = e.currentTarget.querySelector('.tooltip');
        if (tooltip) tooltip.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        const tooltip = e.currentTarget.querySelector('.tooltip');
        if (tooltip) tooltip.style.opacity = '0';
      }}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span style={iconStyle}>
        {isDarkMode ? '☀️' : '🌙'}
      </span>
      <span className="tooltip" style={tooltipStyle}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;

