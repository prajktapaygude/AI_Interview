import React, { useRef } from "react";
import { useTheme } from "../ThemeContext";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InterviewSummary = ({ report }) => {
  const { isDarkMode } = useTheme();
  const summaryRef = useRef(null);
  
  // Default values if report is not provided
  const data = report || {
    score: 82,
    technical: 85,
    clarity: 78,
    confidence: 83,
    role: "Developer",
    level: "Mid-Level",
    totalQuestions: 5,
    answered: 5,
    evaluations: [],
    answers: []
  };

  // Check if we have detailed evaluations from AI
  const hasDetailedEvaluations = data.evaluations && data.evaluations.length > 0;

  // Format date for PDF
  const formatDate = () => {
    const date = new Date();
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  // Calculate average scores
  const calculateAverages = () => {
    if (!hasDetailedEvaluations) return null;
    
    const avgScore = data.evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / data.evaluations.length;
    const avgRelevance = data.evaluations.reduce((sum, e) => sum + (e.relevance_score || 0), 0) / data.evaluations.length;
    const avgAccuracy = data.evaluations.reduce((sum, e) => sum + (e.accuracy_score || 0), 0) / data.evaluations.length;
    const avgCommunication = data.evaluations.reduce((sum, e) => sum + (e.communication_score || 0), 0) / data.evaluations.length;
    
    return {
      score: avgScore.toFixed(1),
      relevance: avgRelevance.toFixed(1),
      accuracy: avgAccuracy.toFixed(1),
      communication: avgCommunication.toFixed(1)
    };
  };

  // Calculate aggregated feedback for overall sections
  const allFeedback = hasDetailedEvaluations ? (() => {
    const strengths = [];
    const weaknesses = [];
    const improvements = [];
    
    data.answers.forEach((item) => {
      const eval_ = item.evaluation || data.evaluations.find(e => e.question === item.question) || {};
      if (eval_.strengths) strengths.push(...eval_.strengths);
      if (eval_.weaknesses) weaknesses.push(...eval_.weaknesses);
      if (eval_.improvement) improvements.push(...eval_.improvement);
    });
    
    const uniqueStrengths = Array.from(new Set(strengths)).slice(0, 12);
    const uniqueWeaknesses = Array.from(new Set(weaknesses)).slice(0, 12);
    const uniqueImprovements = Array.from(new Set(improvements)).slice(0, 12);
    
    return { strengths: uniqueStrengths, weaknesses: uniqueWeaknesses, improvements: uniqueImprovements };
  })() : null;

  // Generate and download PDF
  const downloadPDF = async () => {
    try {
      const pdfContent = document.createElement('div');
      pdfContent.style.padding = '40px';
      pdfContent.style.backgroundColor = 'white';
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      pdfContent.style.width = '800px';
      pdfContent.style.maxWidth = '800px';
      
      const allStrengths = [];
      const allWeaknesses = [];
      const allImprovements = [];
      const allScores = [];
      
      if (hasDetailedEvaluations) {
        data.answers.forEach((item, index) => {
          const eval_ = item.evaluation || data.evaluations[index];
          if (eval_) {
            if (eval_.score) allScores.push(eval_.score);
            if (eval_.strengths) allStrengths.push(...eval_.strengths);
            if (eval_.weaknesses) allWeaknesses.push(...eval_.weaknesses);
            if (eval_.improvement) allImprovements.push(...eval_.improvement);
          }
        });
      }
      
      const avgMetrics = calculateAverages();
      
      pdfContent.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.6; }
            .container { max-width: 100%; }
            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #4F46E5; }
            .title { font-size: 28px; font-weight: bold; color: #4F46E5; margin-bottom: 10px; }
            .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
            .score-section { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white; }
            .overall-score { font-size: 48px; font-weight: bold; margin: 10px 0; }
            .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .metric-card { background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; border-left: 4px solid #4F46E5; }
            .metric-value { font-size: 28px; font-weight: bold; color: #4F46E5; }
            .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 20px; font-weight: bold; color: #4F46E5; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; margin-bottom: 15px; }
            .strength-item { background: #e8f5e9; padding: 10px; margin: 8px 0; border-radius: 8px; border-left: 3px solid #4caf50; }
            .weakness-item { background: #ffebee; padding: 10px; margin: 8px 0; border-radius: 8px; border-left: 3px solid #f44336; }
            .improvement-item { background: #fff3e0; padding: 10px; margin: 8px 0; border-radius: 8px; border-left: 3px solid #ff9800; }
            .question-card { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 12px; page-break-inside: avoid; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .question-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #ddd; }
            .question-number { font-size: 18px; font-weight: bold; color: #4F46E5; }
            .question-score { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; }
            .score-high { background: #4caf50; color: white; }
            .score-medium { background: #ff9800; color: white; }
            .score-low { background: #f44336; color: white; }
            .question-text { font-size: 16px; font-weight: bold; color: #333; margin: 15px 0; padding: 10px; background: white; border-radius: 8px; }
            .answer-text { color: #555; margin: 10px 0; padding: 10px; background: white; border-radius: 8px; font-style: italic; border-left: 3px solid #4F46E5; }
            .feedback-spoken { background: #e3f2fd; padding: 12px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2196f3; font-style: normal; color: #0d47a1; }
            .feedback-section { margin-top: 15px; }
            .feedback-subsection { margin: 12px 0; }
            .feedback-title { font-weight: bold; margin-bottom: 8px; font-size: 14px; }
            .feedback-list { padding-left: 20px; margin-top: 5px; }
            .feedback-list li { margin: 5px 0; line-height: 1.4; }
            .strength-text { color: #4caf50; }
            .weakness-text { color: #f44336; }
            .improvement-text { color: #ff9800; }
            .skill-badge { display: inline-block; padding: 3px 10px; margin: 3px; border-radius: 15px; font-size: 11px; background: #e0e0e0; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; padding-top: 20px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-right: 8px; }
            .badge-high { background: #4caf50; color: white; }
            .badge-medium { background: #ff9800; color: white; }
            .badge-low { background: #f44336; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">🎯 Interview Performance Report</div>
              <div class="subtitle">Generated on ${formatDate()}</div>
              <div class="subtitle">Role: ${data.role} | Level: ${data.level}</div>
            </div>
            
            <div class="score-section">
              <div>Overall Performance Score</div>
              <div class="overall-score">${data.score}%</div>
              <div>${data.score >= 80 ? '🌟 Excellent! Outstanding performance!' : data.score >= 60 ? '👍 Good job! Keep improving!' : '📚 Keep learning! Focus on fundamentals!'}</div>
            </div>
            
            <div class="metrics-grid">
              <div class="metric-card"><div class="metric-value">${data.technical}%</div><div class="metric-label">Technical Knowledge</div></div>
              <div class="metric-card"><div class="metric-value">${data.clarity}%</div><div class="metric-label">Communication Clarity</div></div>
              <div class="metric-card"><div class="metric-value">${data.confidence}%</div><div class="metric-label">Confidence Level</div></div>
            </div>
            
            ${hasDetailedEvaluations && avgMetrics ? `
              <div class="metrics-grid">
                <div class="metric-card"><div class="metric-value">${avgMetrics.relevance}/10</div><div class="metric-label">Avg Relevance Score</div></div>
                <div class="metric-card"><div class="metric-value">${avgMetrics.accuracy}/10</div><div class="metric-label">Avg Technical Accuracy</div></div>
                <div class="metric-card"><div class="metric-value">${avgMetrics.communication}/10</div><div class="metric-label">Avg Communication</div></div>
              </div>
            ` : ''}
            
            <div class="section">
              <div class="section-title">📊 Interview Statistics</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8f9fa; padding: 15px; border-radius: 10px;">
                <div><strong>Total Questions:</strong> ${data.totalQuestions}</div>
                <div><strong>Questions Answered:</strong> ${data.answered}</div>
                <div><strong>Completion Rate:</strong> ${Math.round((data.answered / data.totalQuestions) * 100)}%</div>
                <div><strong>Average Score:</strong> ${allScores.length > 0 ? (allScores.reduce((a,b) => a+b, 0) / allScores.length).toFixed(1) : 'N/A'}/10</div>
              </div>
            </div>
            
            ${allStrengths.length > 0 ? `<div class="section"><div class="section-title">✅ Key Strengths (Overall)</div>${allStrengths.slice(0, 8).map(s => `<div class="strength-item">• ${s}</div>`).join('')}</div>` : ''}
            ${allWeaknesses.length > 0 ? `<div class="section"><div class="section-title">⚠️ Areas for Improvement (Overall)</div>${allWeaknesses.slice(0, 8).map(w => `<div class="weakness-item">• ${w}</div>`).join('')}</div>` : ''}
            ${allImprovements.length > 0 ? `<div class="section"><div class="section-title">💡 Recommendations (Overall)</div>${allImprovements.slice(0, 8).map(i => `<div class="improvement-item">• ${i}</div>`).join('')}</div>` : ''}
            
            ${hasDetailedEvaluations ? `
              <div class="section">
                <div class="section-title">📝 Detailed Question-by-Question Analysis</div>
                ${data.answers.map((item, index) => {
                  const eval_ = item.evaluation || data.evaluations[index];
                  if (!eval_) return '';
                  const scoreClass = eval_.score >= 7 ? 'score-high' : eval_.score >= 4 ? 'score-medium' : 'score-low';
                  const scoreText = eval_.score >= 7 ? 'Strong' : eval_.score >= 4 ? 'Needs Improvement' : 'Weak';
                  return `
                    <div class="question-card">
                      <div class="question-header">
                        <div class="question-number">Question ${index + 1}</div>
                        <div class="question-score ${scoreClass}">Score: ${eval_.score}/10 (${scoreText})</div>
                      </div>
                      <div class="question-text"><strong>❓ Question:</strong><br>${item.question}</div>
                      <div class="answer-text"><strong>💬 Your Answer:</strong><br>${item.answer}</div>
                      ${eval_.feedbackSpoken ? `<div class="feedback-spoken"><strong>🗣️ Recruiter's Feedback:</strong> ${eval_.feedbackSpoken}</div>` : ''}
                      <div class="feedback-section">
                        ${eval_.strengths && eval_.strengths.length > 0 ? `
                          <div class="feedback-subsection">
                            <div class="feedback-title strength-text">✅ Strengths:</div>
                            <ul class="feedback-list">${eval_.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                          </div>
                        ` : ''}
                        ${eval_.weaknesses && eval_.weaknesses.length > 0 ? `
                          <div class="feedback-subsection">
                            <div class="feedback-title weakness-text">⚠️ Areas for Improvement:</div>
                            <ul class="feedback-list">${eval_.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
                          </div>
                        ` : ''}
                        ${eval_.improvement && eval_.improvement.length > 0 ? `
                          <div class="feedback-subsection">
                            <div class="feedback-title improvement-text">💡 Suggestions for Improvement:</div>
                            <ul class="feedback-list">${eval_.improvement.map(i => `<li>${i}</li>`).join('')}</ul>
                          </div>
                        ` : ''}
                        ${eval_.skill_breakdown ? `<div class="feedback-subsection"><div class="feedback-title">📈 Skill Breakdown:</div><div>${Object.entries(eval_.skill_breakdown).map(([k,v]) => `<span class="skill-badge">${k.replace('_',' ')}: ${v}</span>`).join('')}</div></div>` : ''}
                        ${eval_.answer_quality ? `<div class="feedback-subsection"><div class="feedback-title">🏷️ Answer Quality:</div><div><span class="badge ${eval_.answer_quality === 'excellent' ? 'badge-high' : eval_.answer_quality === 'good' ? 'badge-high' : eval_.answer_quality === 'average' ? 'badge-medium' : 'badge-low'}">${eval_.answer_quality.toUpperCase()}</span></div></div>` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
            
            <div class="footer">
              <p>🤖 AI Interview Mentor - Professional Interview Preparation System</p>
              <p>This report provides detailed, personalized feedback to help you improve your interview skills.</p>
              <p style="margin-top: 10px;">💡 Tip: Review each question's feedback carefully and practice the suggested improvements.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      document.body.appendChild(pdfContent);
      const canvas = await html2canvas(pdfContent, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true, windowWidth: pdfContent.scrollWidth, windowHeight: pdfContent.scrollHeight });
      document.body.removeChild(pdfContent);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const filename = `interview_report_${data.role.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      console.log('PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again. Error: ' + error.message);
    }
  };

  return (
    <div ref={summaryRef} className="space-y-8 rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
             style={{ background: `linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))` }}>
          <i className="fas fa-chart-bar text-white text-xl"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Interview Summary</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Your performance review</p>
        </div>
      </div>

      {/* Score Circle */}
      <div className="flex justify-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-border)" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${data.score * 2.83} 283`} strokeDashoffset="0" transform="rotate(-90 50 50)" className="transition-all duration-1000" />
            <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-secondary)" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{data.score}%</span>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Overall</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${'var(--color-primary)'}10` }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>{data.technical}%</div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Technical</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${'var(--color-secondary)'}10` }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-secondary)' }}>{data.clarity}%</div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Clarity</div>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${'var(--color-accent)'}10` }}>
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent)' }}>{data.confidence}%</div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Confidence</div>
        </div>
      </div>

      {/* Message */}
      <div className="rounded-xl p-6 text-center" style={{ background: `linear-gradient(to bottom right, ${'var(--color-primary)'}10, ${'var(--color-secondary)'}10)` }}>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
          {data.score >= 80 ? "🎉 Excellent work! You've demonstrated strong technical knowledge and communication skills." :
           data.score >= 60 ? "👍 Good job! You have solid fundamentals. Keep practicing to improve further." :
           "📚 Keep learning! Focus on building stronger foundations and answer structure."}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg p-3" style={{ backgroundColor: `${'var(--color-primary)'}5` }}>
          <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Questions</div>
          <div className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{data.answered}/{data.totalQuestions}</div>
        </div>
        <div className="rounded-lg p-3" style={{ backgroundColor: `${'var(--color-secondary)'}5` }}>
          <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Role</div>
          <div className="text-lg font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{data.role}</div>
        </div>
      </div>

      {/* Detailed Question-by-Question Feedback (including spoken feedback) */}
      {hasDetailedEvaluations && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            <i className="fas fa-list-ul mr-2" style={{ color: 'var(--color-primary)' }}></i>
            Detailed Feedback
          </h3>
          
          {data.answers && data.answers.map((item, index) => {
            const eval_ = item.evaluation || data.evaluations[index];
            if (!eval_) return null;
            
            return (
              <div key={index} className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                {/* Question */}
                <div className="mb-3">
                  <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: `${'var(--color-primary)'}15`, color: 'var(--color-primary)' }}>
                    Q{index + 1}
                  </span>
                  <p className="text-sm mt-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.question}</p>
                </div>
                
                {/* Answer */}
                <div className="mb-3 pl-3 border-l-2" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Your Answer:</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{item.answer}</p>
                </div>
                
                {/* Score Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: eval_.score >= 7 ? `${'var(--color-success)'}20` : eval_.score >= 4 ? `${'var(--color-accent)'}20` : `${'var(--color-error)'}20`, color: eval_.score >= 7 ? 'var(--color-success)' : eval_.score >= 4 ? 'var(--color-accent)' : 'var(--color-error)' }}>
                    Score: {eval_.score}/10
                  </span>
                  {eval_.answer_quality && (
                    <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ backgroundColor: `${'var(--color-secondary)'}15`, color: 'var(--color-secondary)' }}>
                      {eval_.answer_quality}
                    </span>
                  )}
                </div>
                
                {/* 🆕 Recruiter's Spoken Feedback */}
                {eval_.feedbackSpoken && (
                  <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: `${'var(--color-primary)'}10`, borderLeft: `3px solid var(--color-primary)` }}>
                    <p className="text-xs font-semibold mb-1 flex items-center" style={{ color: 'var(--color-primary)' }}>
                      <i className="fas fa-comment-dots mr-1"></i> Recruiter's Feedback (spoken)
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>"{eval_.feedbackSpoken}"</p>
                  </div>
                )}
                
                {/* Strengths */}
                {eval_.strengths && eval_.strengths.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium mb-1 flex items-center" style={{ color: 'var(--color-success)' }}>
                      <i className="fas fa-thumbs-up mr-1"></i> Strengths
                    </p>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {eval_.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-1"><span className="text-success">•</span> {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Weaknesses */}
                {eval_.weaknesses && eval_.weaknesses.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium mb-1 flex items-center" style={{ color: 'var(--color-error)' }}>
                      <i className="fas fa-thumbs-down mr-1"></i> Areas for Improvement
                    </p>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {eval_.weaknesses.map((weakness, i) => (
                        <li key={i} className="flex items-start gap-1"><span className="text-error">•</span> {weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Suggestions */}
                {eval_.improvement && eval_.improvement.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1 flex items-center" style={{ color: 'var(--color-accent)' }}>
                      <i className="fas fa-lightbulb mr-1"></i> Suggestions
                    </p>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {eval_.improvement.map((imp, i) => (
                        <li key={i} className="flex items-start gap-1"><span className="text-accent">•</span> {imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Overall Summary Sections (unchanged) */}
      {hasDetailedEvaluations && allFeedback && (
        <>
          {allFeedback.strengths.length > 0 && (
            <div className="space-y-3 pt-8 border-t border-border/50">
              <h3 className="text-xl font-bold flex items-center gap-3 bg-gradient-to-r from-success/10 to-green-500/10 p-4 rounded-2xl" style={{ color: 'var(--color-success)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-success/20 text-2xl"><i className="fas fa-check-circle"></i></div>
                Key Strengths <span className="text-sm opacity-75 font-normal ml-auto">({allFeedback.strengths.length} total)</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-72 overflow-hidden hover:overflow-y-auto p-4 rounded-2xl scrollbar-thin" style={{ backgroundColor: `var(--color-success)04`, border: `1px solid var(--color-success)10` }}>
                {allFeedback.strengths.slice(0, 8).map((strength, i) => (
                  <div key={i} className="group p-4 rounded-xl flex items-start gap-3 hover:bg-white/30 transition-all border-l-4 border-success hover:shadow-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-success/20 group-hover:bg-success/30 transition-all"><i className="fas fa-star text-success text-lg"></i></div>
                    <div><p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{strength}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allFeedback.weaknesses.length > 0 && (
            <div className="space-y-3 pt-8 border-t border-border/50">
              <h3 className="text-xl font-bold flex items-center gap-3 bg-gradient-to-r from-error/10 to-red-500/10 p-4 rounded-2xl" style={{ color: 'var(--color-error)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-error/20 text-2xl"><i className="fas fa-exclamation-triangle"></i></div>
                Areas for Improvement <span className="text-sm opacity-75 font-normal ml-auto">({allFeedback.weaknesses.length} total)</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-72 overflow-hidden hover:overflow-y-auto p-4 rounded-2xl" style={{ backgroundColor: `var(--color-error)04`, border: `1px solid var(--color-error)10` }}>
                {allFeedback.weaknesses.slice(0, 8).map((weakness, i) => (
                  <div key={i} className="group p-4 rounded-xl flex items-start gap-3 hover:bg-white/30 transition-all border-l-4 border-error hover:shadow-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-error/20 group-hover:bg-error/30 transition-all"><i className="fas fa-info-circle text-error text-lg"></i></div>
                    <div><p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{weakness}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allFeedback.improvements.length > 0 && (
            <div className="space-y-3 pt-8 border-t border-border/50 pb-8">
              <h3 className="text-xl font-bold flex items-center gap-3 bg-gradient-to-r from-accent/10 to-orange-500/10 p-4 rounded-2xl" style={{ color: 'var(--color-accent)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-accent/20 text-2xl"><i className="fas fa-lightbulb"></i></div>
                Actionable Recommendations <span className="text-sm opacity-75 font-normal ml-auto">({allFeedback.improvements.length} total)</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-72 overflow-hidden hover:overflow-y-auto p-4 rounded-2xl" style={{ backgroundColor: `var(--color-accent)04`, border: `1px solid var(--color-accent)10` }}>
                {allFeedback.improvements.slice(0, 8).map((improvement, i) => (
                  <div key={i} className="group p-4 rounded-xl flex items-start gap-3 hover:bg-white/30 transition-all border-l-4 border-accent hover:shadow-lg bg-gradient-to-r from-accent/5" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent/20 group-hover:bg-accent/30 transition-all"><i className="fas fa-arrow-right text-accent text-lg"></i></div>
                    <div><p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{improvement}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Download Button */}
      <button
        onClick={downloadPDF}
        className="w-full py-4 px-6 text-white font-semibold rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-3"
        style={{ background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))` }}
      >
        <i className="fas fa-download"></i>
        Download Detailed Report (PDF)
      </button>
    </div>
  );
};

export default InterviewSummary;