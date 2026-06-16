const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Groq = require('groq-sdk');
const { authenticateUser } = require('./auth');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOC files are allowed.'));
    }
  }
});

let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log('✅ Groq client initialized for resume analysis');
} else {
  console.log('⚠️ GROQ_API_KEY not found');
}

async function extractTextFromFile(file) {
  try {
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      return data.text;
    } else if (file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }
    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
}

function extractSkillsFromText(text) {
  const skillsList = [
    'JavaScript', 'Python', 'Java', 'React', 'Angular', 'Vue', 'Node.js', 'Express',
    'Django', 'Flask', 'Spring Boot', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure',
    'GCP', 'Docker', 'Kubernetes', 'Git', 'TypeScript', 'HTML', 'CSS', 'SASS', 'Tailwind',
    'Bootstrap', 'Redux', 'Next.js', 'GraphQL', 'REST API', 'Machine Learning', 'AI',
    'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'C++', 'C#', '.NET', 'PHP',
    'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'iOS', 'Android',
    'DevOps', 'CI/CD', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Bash', 'SQL', 'NoSQL',
    'Redis', 'Elasticsearch', 'Kafka', 'RabbitMQ', 'Microservices', 'System Design'
  ];
  
  const found = skillsList.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  return found;
}

// NEW: Generate comprehensive resume suggestions
async function generateResumeSuggestions(resumeText, jobDescription, matchResult) {
  const score = matchResult.score;
  const matchedSkills = matchResult.matchedSkills || [];
  const missingSkills = matchResult.missingSkills || [];
  
  if (!groqClient) {
    return generateFallbackSuggestions(score, matchedSkills, missingSkills);
  }

  const prompt = `You are an expert resume optimization consultant like Enhancv. Based on the resume analysis, provide detailed suggestions to improve the resume.

RESUME SCORE: ${score}/100
MATCHED SKILLS: ${matchedSkills.slice(0, 10).join(', ')}
MISSING SKILLS: ${missingSkills.slice(0, 10).join(', ')}
JOB DESCRIPTION: ${(jobDescription || 'Not provided').substring(0, 500)}

Return ONLY valid JSON with this exact structure:
{
  "suggestions": {
    "quickWins": [
      {
        "title": "Suggestion title",
        "description": "Detailed description",
        "priority": "high|medium|low",
        "effort": "easy|medium|hard"
      }
    ],
    "formatting": [
      {
        "title": "Formatting tip",
        "description": "Detailed description",
        "example": "Example of improvement"
      }
    ],
    "content": [
      {
        "title": "Content suggestion",
        "description": "Detailed description",
        "skillToAdd": "Specific skill if applicable"
      }
    ],
    "atsOptimization": [
      {
        "title": "ATS tip",
        "description": "Detailed description",
        "keywordToAdd": "Keyword if applicable"
      }
    ]
  },
  "summary": "Overall resume assessment in 2-3 sentences",
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`;

  try {
    const response = await groqClient.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert resume consultant. Provide actionable, specific suggestions. Return only valid JSON." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return generateFallbackSuggestions(score, matchedSkills, missingSkills);
  } catch (error) {
    console.error('Suggestion generation error:', error);
    return generateFallbackSuggestions(score, matchedSkills, missingSkills);
  }
}

// Fallback suggestions based on score
function generateFallbackSuggestions(score, matchedSkills, missingSkills) {
  const suggestions = {
    quickWins: [],
    formatting: [],
    content: [],
    atsOptimization: [],
    summary: "",
    nextSteps: []
  };

  if (score >= 80) {
    suggestions.summary = "Excellent resume! Minor optimizations will make it outstanding.";
    suggestions.quickWins.push({
      title: "Add Quantifiable Achievements",
      description: "Add numbers and metrics to your achievements (e.g., 'Increased performance by 30%')",
      priority: "medium",
      effort: "easy"
    });
    suggestions.quickWins.push({
      title: "Optimize for ATS Keywords",
      description: "Include industry-specific keywords from job descriptions",
      priority: "low",
      effort: "easy"
    });
    suggestions.nextSteps = ["Add more metrics", "Get a second opinion", "Tailor for specific roles"];
  } 
  else if (score >= 60) {
    suggestions.summary = "Good foundation! Focus on highlighting your achievements and adding missing skills.";
    suggestions.quickWins.push({
      title: "Add Missing Skills",
      description: `Add these skills to your resume: ${missingSkills.slice(0, 3).join(', ')}`,
      priority: "high",
      effort: "medium"
    });
    suggestions.quickWins.push({
      title: "Improve Bullet Points",
      description: "Use action verbs and start each bullet point with strong words like 'Led', 'Developed', 'Implemented'",
      priority: "high",
      effort: "easy"
    });
    suggestions.content.push({
      title: "Expand Project Descriptions",
      description: "Add 2-3 more bullet points for each project with specific technologies used",
      skillToAdd: missingSkills[0] || "Relevant technologies"
    });
    suggestions.nextSteps = ["Add missing skills", "Improve bullet points", "Add quantifiable results"];
  }
  else if (score >= 40) {
    suggestions.summary = "Needs significant improvement. Focus on structure, keywords, and relevant experience.";
    suggestions.quickWins.push({
      title: "Completely Revamp Skills Section",
      description: `Add these essential skills: ${missingSkills.slice(0, 5).join(', ')}`,
      priority: "high",
      effort: "hard"
    });
    suggestions.quickWins.push({
      title: "Restructure Resume Format",
      description: "Use a clean, ATS-friendly format with clear sections (Summary, Skills, Experience, Education)",
      priority: "high",
      effort: "medium"
    });
    suggestions.formatting.push({
      title: "Use Standard Section Headings",
      description: "Use standard headings like 'Work Experience', 'Technical Skills', 'Education'",
      example: "Instead of 'My Work History', use 'Work Experience'"
    });
    suggestions.atsOptimization.push({
      title: "Add Job Description Keywords",
      description: `Include these keywords: ${missingSkills.slice(0, 5).join(', ')}`,
      keywordToAdd: missingSkills[0] || "Relevant skills"
    });
    suggestions.nextSteps = ["Restructure resume", "Add missing skills", "Use ATS-friendly format", "Get professional review"];
  }
  else {
    suggestions.summary = "Your resume needs major improvements to be competitive.";
    suggestions.quickWins.push({
      title: "Start with a Template",
      description: "Use a professional resume template as your foundation",
      priority: "high",
      effort: "medium"
    });
    suggestions.quickWins.push({
      title: "Add Relevant Experience",
      description: "Include internships, freelance work, or personal projects relevant to the role",
      priority: "high",
      effort: "hard"
    });
    suggestions.formatting.push({
      title: "Fix Basic Formatting",
      description: "Use consistent fonts, spacing, and avoid images/tables",
      example: "Use Calibri or Arial font, 11-12pt size"
    });
    suggestions.content.push({
      title: "Build a Portfolio Project",
      description: "Create a project using the skills required for your target role",
      skillToAdd: missingSkills[0] || "Industry-relevant technology"
    });
    suggestions.nextSteps = ["Get professional resume template", "Add personal projects", "Take relevant courses", "Get certifications"];
  }

  // Add common ATS optimization tips
  suggestions.atsOptimization.push({
    title: "Use Standard File Format",
    description: "Always use .docx or .pdf format for better ATS parsing",
    keywordToAdd: null
  });
  
  suggestions.atsOptimization.push({
    title: "Avoid Graphics and Tables",
    description: "Remove images, logos, graphs, and tables that confuse ATS systems",
    keywordToAdd: null
  });

  return {
    suggestions: suggestions,
    summary: suggestions.summary,
    nextSteps: suggestions.nextSteps
  };
}

// Calculate match score between resume and job description
async function calculateMatchScore(resumeText, jobDescription) {
  if (!groqClient || !jobDescription) {
    const resumeSkills = extractSkillsFromText(resumeText);
    const jdSkills = jobDescription ? extractSkillsFromText(jobDescription) : [];
    const matched = resumeSkills.filter(skill => jdSkills.includes(skill));
    const score = jdSkills.length > 0 ? (matched.length / jdSkills.length) * 100 : 50;
    return {
      score: Math.min(100, Math.max(0, Math.round(score))),
      matchedSkills: matched,
      missingSkills: jdSkills.filter(skill => !resumeSkills.includes(skill)),
      resumeSkills: resumeSkills,
      jdSkills: jdSkills,
      analysis: `Found ${matched.length} matching skills out of ${jdSkills.length} required.`,
      recommendations: jdSkills.filter(skill => !resumeSkills.includes(skill)).slice(0, 3).map(s => `Consider adding ${s} to your resume`)
    };
  }

  const prompt = `You are an expert ATS analyzer. Analyze the resume against the job description.

RESUME TEXT:
${resumeText.substring(0, 3000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

Return ONLY valid JSON:
{
  "matchScore": 0-100,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "analysis": "Brief analysis",
  "recommendations": ["rec1", "rec2"]
}`;

  try {
    const response = await groqClient.chat.completions.create({
      messages: [
        { role: "system", content: "Return only valid JSON. Be strict but fair in scoring." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        score: result.matchScore || 50,
        matchedSkills: result.matchedSkills || [],
        missingSkills: result.missingSkills || [],
        resumeSkills: extractSkillsFromText(resumeText),
        jdSkills: result.matchedSkills?.concat(result.missingSkills || []) || [],
        analysis: result.analysis || "",
        recommendations: result.recommendations || []
      };
    }
    throw new Error('Invalid JSON');
  } catch (error) {
    console.error('Match score error:', error);
    const resumeSkills = extractSkillsFromText(resumeText);
    const jdSkills = jobDescription ? extractSkillsFromText(jobDescription) : [];
    const matched = resumeSkills.filter(skill => jdSkills.includes(skill));
    return {
      score: Math.min(100, Math.max(0, Math.round((matched.length / (jdSkills.length || 1)) * 100))),
      matchedSkills: matched,
      missingSkills: jdSkills.filter(skill => !resumeSkills.includes(skill)),
      resumeSkills: resumeSkills,
      jdSkills: jdSkills,
      analysis: "Analysis complete using keyword matching.",
      recommendations: []
    };
  }
}

// Generate questions based on match score
async function generateQuestionsByScore(resumeText, jobDescription, matchResult, jobTitle) {
  const score = matchResult.score;
  const isHighMatch = score >= 60;
  const isMediumMatch = score >= 40 && score < 60;
  
  if (!groqClient) {
    return generateDefaultQuestions(matchResult);
  }

  let prompt = '';

  if (isHighMatch) {
    prompt = `Generate 12 challenging interview questions for a candidate with ${score}% match for ${jobTitle || 'the role'}.
Skills: ${matchResult.matchedSkills.slice(0, 8).join(', ')}
Return ONLY JSON array of 12 strings.`;
  } 
  else if (isMediumMatch) {
    prompt = `Generate 12 balanced interview questions for a candidate with ${score}% match.
Strengths: ${matchResult.matchedSkills.slice(0, 5).join(', ')}
Gaps: ${matchResult.missingSkills.slice(0, 5).join(', ')}
Return ONLY JSON array of 12 strings.`;
  } 
  else {
    prompt = `Generate 12 encouraging interview questions focusing on learning ability and potential.
Current skills: ${matchResult.resumeSkills?.slice(0, 8).join(', ') || 'Various'}
Return ONLY JSON array of 12 strings.`;
  }

  try {
    const response = await groqClient.chat.completions.create({
      messages: [
        { role: "system", content: "Return only valid JSON array of strings." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = response.choices[0].message.content;
    let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return generateDefaultQuestions(matchResult);
  } catch (error) {
    console.error('Question generation error:', error);
    return generateDefaultQuestions(matchResult);
  }
}

function generateDefaultQuestions(matchResult) {
  const questions = [];
  
  if (matchResult.matchedSkills && matchResult.matchedSkills.length > 0) {
    questions.push(`Tell me about your experience with ${matchResult.matchedSkills[0]}.`);
    if (matchResult.matchedSkills[1]) {
      questions.push(`How have you used ${matchResult.matchedSkills[1]} in production?`);
    }
  }
  
  questions.push("Describe your most challenging technical project.");
  questions.push("How do you approach learning new technologies?");
  questions.push("Tell me about a time you solved a difficult bug.");
  questions.push("How do you handle tight deadlines?");
  questions.push("Where do you see yourself in 2 years?");
  questions.push("What's your preferred development workflow?");
  questions.push("How do you ensure code quality?");
  questions.push("Describe your experience with team collaboration.");
  
  if (matchResult.missingSkills && matchResult.missingSkills.length > 0) {
    questions.push(`How would you approach learning ${matchResult.missingSkills[0]}?`);
  }
  
  return questions.slice(0, 12);
}

// Main upload endpoint with suggestions
router.post('/upload-resume', authenticateUser, upload.single('resume'), async (req, res) => {
  try {
    console.log('📄 Upload request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jobDescription = req.body.jobDescription || '';
    const jobTitle = req.body.jobTitle || '';

    console.log(`📄 File: ${req.file.originalname}`);
    console.log(`💼 Job Title: ${jobTitle}`);
    
    const resumeText = await extractTextFromFile(req.file);
    console.log(`✅ Extracted ${resumeText.length} characters`);
    
    let matchResult = {
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      analysis: "",
      recommendations: [],
      resumeSkills: extractSkillsFromText(resumeText),
      jdSkills: []
    };
    
    // Calculate match score if job description provided
    if (jobDescription) {
      matchResult = await calculateMatchScore(resumeText, jobDescription);
      console.log(`🎯 Match Score: ${matchResult.score}%`);
      console.log(`✅ Matched: ${matchResult.matchedSkills.length} skills`);
      console.log(`❌ Missing: ${matchResult.missingSkills.length} skills`);
    } else {
      matchResult.resumeSkills = extractSkillsFromText(resumeText);
      matchResult.analysis = "Resume analyzed successfully. Add a job description to get match score.";
      matchResult.recommendations = ["Add a job description for personalized recommendations"];
    }
    
    // NEW: Generate comprehensive suggestions
    const suggestions = await generateResumeSuggestions(resumeText, jobDescription, matchResult);
    
    // Generate questions
    const questions = await generateQuestionsByScore(resumeText, jobDescription, matchResult, jobTitle);
    
    const resumeId = `resume_${Date.now()}_${req.user._id || 'user'}`;
    
    const responseData = {
      success: true,
      resumeId: resumeId,
      atsScore: matchResult.score,
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      analysis: matchResult.analysis,
      recommendations: matchResult.recommendations,
      suggestions: suggestions, // NEW: Add suggestions to response
      questions: questions,
      jobTitle: jobTitle,
      jobDescriptionProvided: !!jobDescription,
      isHighMatch: matchResult.score >= 60,
      isMediumMatch: matchResult.score >= 40 && matchResult.score < 60,
      isLowMatch: matchResult.score < 40,
      totalQuestions: questions.length,
      resumeSkills: matchResult.resumeSkills,
      jdSkills: matchResult.jdSkills
    };
    
    res.json(responseData);
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;