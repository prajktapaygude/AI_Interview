import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SystemCheck = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state;

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(() => alert("Camera/Mic permission required"));
  }, []);

  return (
    <div className="interview-container">
      <h1>System Check</h1>
      <video ref={videoRef} autoPlay muted className="camera-preview" />
      <button
        className="primary-btn"
        onClick={() => navigate("/instructions", { state: formData })}
      >
        Continue to Instructions
      </button>
    </div>
  );
};

export default SystemCheck;