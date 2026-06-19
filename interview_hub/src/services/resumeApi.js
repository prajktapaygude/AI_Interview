// const API_BASE_URL = "http://localhost:5000/api";

// export const uploadResume = async (file) => {
//   const formData = new FormData();
//   formData.append("resume", file);

//   const response = await fetch(`${API_BASE_URL}/upload-resume`, {
//     method: "POST",
//     body: formData,
//   });

//   if (!response.ok) {
//     throw new Error("Upload failed");
//   }

//   return response.json();
// };

// export const getQuestions = async (resumeId) => {
//   const response = await fetch(`${API_BASE_URL}/questions/${resumeId}`);
  
//   if (!response.ok) {
//     throw new Error("Failed to fetch questions");
//   }

//   return response.json();
// };

// export const saveAnswers = async (resumeId, answers) => {
//   const response = await fetch(`${API_BASE_URL}/save-answers/${resumeId}`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ answers }),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to save answers");
//   }

//   return response.json();
// };


const API_BASE_URL = "http://localhost:5000/api";
const AI_BACKEND_URL = `${BASE_URL}`;  // Add this

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch(`${API_BASE_URL}/upload-resume`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
};

export const getQuestions = async (resumeId) => {
  const response = await fetch(`${API_BASE_URL}/questions/${resumeId}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }

  return response.json();
};

export const saveAnswers = async (resumeId, answers) => {
  const response = await fetch(`${API_BASE_URL}/save-answers/${resumeId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    throw new Error("Failed to save answers");
  }

  return response.json();
};

// ✅ NEW: Evaluate a single answer with resume context
export const evaluateAnswer = async (resumeId, role, question, answer) => {
  const response = await fetch(`${AI_BACKEND_URL}/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Id: resumeId,
      userId: localStorage.getItem("userId") || "guest",
      role: role || "Software Developer",
      question: question,
      answer: answer,
      resumeId: resumeId  // Pass resumeId for context
    }),
  });

  if (!response.ok) {
    throw new Error("Evaluation failed");
  }

  return response.json();
};

// ✅ NEW: Batch evaluate all answers at the end
export const batchEvaluateAnswers = async (resumeId, role, questions, answers) => {
  const response = await fetch(`${AI_BACKEND_URL}/batch-evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Id: resumeId,
      userId: localStorage.getItem("userId") || "guest",
      role: role || "Software Developer",
      techStack: "",  // Can be populated from resume
      level: "Mid-Level",
      questions: questions,
      answers: answers
    }),
  });

  if (!response.ok) {
    throw new Error("Batch evaluation failed");
  }

  return response.json();
};