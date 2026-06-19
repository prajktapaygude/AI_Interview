import React from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config';


const BackButton = ({ fallbackPath }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1); // go back if there's history
    } else {
      navigate(fallbackPath); // otherwise go to fallback
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
      style={{ color: 'var(--color-text-primary)' }}
    >
      <i className="fas fa-arrow-left"></i>
      <span>Back</span>
    </button>
  );
};

export default BackButton;