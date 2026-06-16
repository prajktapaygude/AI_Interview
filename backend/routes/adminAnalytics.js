const express = require('express');
const router = express.Router();
const UserInterview = require('../models/UserInterview');
const Interview = require('../models/Interview');
const User = require('../models/User');
const { authenticateAdmin } = require('./adminAuth');

// GET /api/admin/analytics/overview - Main analytics dashboard data
router.get('/analytics/overview', authenticateAdmin, async (req, res) => {
  try {
    // Get all interviews from both collections
    const [userInterviews, interviews, totalUsers] = await Promise.all([
      UserInterview.find({}).populate('userId', 'name email'),
      Interview.find({}),
      User.countDocuments({ is_active: true })
    ]);

    // Combine interviews from both sources
    const allInterviews = [...userInterviews, ...interviews];
    
    // Calculate total sessions
    const totalSessions = allInterviews.length;
    
    // Calculate average score
    const validScores = allInterviews.filter(i => i.score || i.percentage);
    const averageScore = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, i) => sum + (i.score || i.percentage || 0), 0) / validScores.length)
      : 0;
    
    // Calculate average by role
    const roleScores = {};
    allInterviews.forEach(interview => {
      const role = interview.role || 'Unknown';
      const score = interview.score || interview.percentage || 0;
      if (!roleScores[role]) {
        roleScores[role] = { total: 0, count: 0 };
      }
      roleScores[role].total += score;
      roleScores[role].count++;
    });
    
    const averageByRole = {};
    Object.keys(roleScores).forEach(role => {
      averageByRole[role] = Math.round(roleScores[role].total / roleScores[role].count);
    });
    
    // Calculate score distribution
    const scoreDistribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };
    
    allInterviews.forEach(interview => {
      const score = interview.score || interview.percentage || 0;
      if (score <= 20) scoreDistribution['0-20']++;
      else if (score <= 40) scoreDistribution['21-40']++;
      else if (score <= 60) scoreDistribution['41-60']++;
      else if (score <= 80) scoreDistribution['61-80']++;
      else scoreDistribution['81-100']++;
    });
    
    // Calculate role distribution (most popular roles)
    const roleCount = {};
    allInterviews.forEach(interview => {
      const role = interview.role || 'Unknown';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });
    
    const topRoles = Object.entries(roleCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([role, count]) => ({ role, count }));
    
    // Calculate weekly trend (last 7 days)
    const weeklyTrend = [];
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();
    
    last7Days.forEach(date => {
      const dayInterviews = allInterviews.filter(i => {
        const interviewDate = new Date(i.createdAt || i.createdAt);
        interviewDate.setHours(0, 0, 0, 0);
        return interviewDate.getTime() === date.getTime();
      });
      const avgScore = dayInterviews.length > 0
        ? Math.round(dayInterviews.reduce((sum, i) => sum + (i.score || i.percentage || 0), 0) / dayInterviews.length)
        : 0;
      weeklyTrend.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayInterviews.length,
        avgScore
      });
    });
    
    // Calculate completion rate (interviews with answers vs total)
    const completedInterviews = allInterviews.filter(i => i.answers?.length > 0 || i.percentage > 0);
    const completionRate = totalSessions > 0 
      ? Math.round((completedInterviews.length / totalSessions) * 100)
      : 0;
    
    // Calculate category distribution based on role categories
    const categoryDistribution = {
      'Technology': 0,
      'Business': 0,
      'Science': 0,
      'Other': 0
    };
    
    const techKeywords = ['developer', 'engineer', 'programming', 'frontend', 'backend', 'devops', 'data', 'ai', 'ml'];
    const businessKeywords = ['marketing', 'finance', 'hr', 'operations', 'management', 'business'];
    const scienceKeywords = ['physics', 'chemistry', 'biology', 'research', 'science'];
    
    allInterviews.forEach(interview => {
      const role = (interview.role || '').toLowerCase();
      if (techKeywords.some(keyword => role.includes(keyword))) {
        categoryDistribution['Technology']++;
      } else if (businessKeywords.some(keyword => role.includes(keyword))) {
        categoryDistribution['Business']++;
      } else if (scienceKeywords.some(keyword => role.includes(keyword))) {
        categoryDistribution['Science']++;
      } else {
        categoryDistribution['Other']++;
      }
    });
    
    // Extract weak topics from interview data (if available)
    const weakTopics = extractWeakTopics(allInterviews);
    
    res.json({
      totalSessions,
      averageScore,
      averageByRole,
      scoreDistribution,
      weakTopics,
      topRoles,
      weeklyTrend,
      completionRate,
      categoryDistribution,
      totalUsers,
      activeUsers: totalUsers // You can add active users logic if needed
    });
    
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to load analytics data' });
  }
});

// Helper function to extract weak topics from interviews
function extractWeakTopics(interviews) {
  const topicWeakness = {};
  
  interviews.forEach(interview => {
    // If interview has answers with evaluations
    if (interview.answers && Array.isArray(interview.answers)) {
      interview.answers.forEach(answer => {
        if (answer.evaluation && answer.evaluation.weaknesses) {
          answer.evaluation.weaknesses.forEach(weakness => {
            const topic = weakness.toLowerCase();
            topicWeakness[topic] = (topicWeakness[topic] || 0) + 1;
          });
        }
      });
    }
  });
  
  // Get top 5 weak topics
  return Object.entries(topicWeakness)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);
}

// GET /api/admin/analytics/roles - Role-based performance
router.get('/analytics/roles', authenticateAdmin, async (req, res) => {
  try {
    const [userInterviews, interviews] = await Promise.all([
      UserInterview.find({}).populate('userId', 'name email'),
      Interview.find({})
    ]);
    
    const allInterviews = [...userInterviews, ...interviews];
    
    const roleStats = {};
    
    allInterviews.forEach(interview => {
      const role = interview.role || 'Unknown';
      const score = interview.score || interview.percentage || 0;
      
      if (!roleStats[role]) {
        roleStats[role] = {
          totalScore: 0,
          count: 0,
          scores: []
        };
      }
      
      roleStats[role].totalScore += score;
      roleStats[role].count++;
      roleStats[role].scores.push(score);
    });
    
    const result = Object.entries(roleStats).map(([role, stats]) => ({
      role,
      averageScore: Math.round(stats.totalScore / stats.count),
      totalInterviews: stats.count,
      highestScore: Math.max(...stats.scores),
      lowestScore: Math.min(...stats.scores)
    })).sort((a, b) => b.averageScore - a.averageScore);
    
    res.json(result);
    
  } catch (error) {
    console.error('Role analytics error:', error);
    res.status(500).json({ error: 'Failed to load role analytics' });
  }
});

// GET /api/admin/analytics/trends - Time-based trends
router.get('/analytics/trends', authenticateAdmin, async (req, res) => {
  try {
    const { period = 'week' } = req.query; // week, month, year
    
    const [userInterviews, interviews] = await Promise.all([
      UserInterview.find({}),
      Interview.find({})
    ]);
    
    const allInterviews = [...userInterviews, ...interviews];
    
    let startDate;
    const now = new Date();
    
    switch(period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }
    
    const filteredInterviews = allInterviews.filter(i => 
      new Date(i.createdAt || i.createdAt) >= startDate
    );
    
    // Group by date
    const trends = {};
    filteredInterviews.forEach(interview => {
      const date = new Date(interview.createdAt || interview.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!trends[dateKey]) {
        trends[dateKey] = { totalScore: 0, count: 0 };
      }
      
      trends[dateKey].totalScore += (interview.score || interview.percentage || 0);
      trends[dateKey].count++;
    });
    
    const result = Object.entries(trends).map(([date, data]) => ({
      date,
      averageScore: Math.round(data.totalScore / data.count),
      totalInterviews: data.count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json(result);
    
  } catch (error) {
    console.error('Trend analytics error:', error);
    res.status(500).json({ error: 'Failed to load trend analytics' });
  }
});

// GET /api/admin/analytics/users - User performance
router.get('/analytics/users', authenticateAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const [userInterviews, interviews] = await Promise.all([
      UserInterview.find({}).populate('userId', 'name email'),
      Interview.find({})
    ]);
    
    const allInterviews = [...userInterviews, ...interviews];
    
    const userStats = {};
    
    allInterviews.forEach(interview => {
      const userId = interview.userId?._id || interview.userId;
      const userName = interview.userId?.name || interview.userName || 'Unknown';
      const userEmail = interview.userId?.email || interview.userEmail || '';
      const score = interview.score || interview.percentage || 0;
      
      if (!userStats[userId]) {
        userStats[userId] = {
          name: userName,
          email: userEmail,
          totalScore: 0,
          count: 0,
          roles: new Set()
        };
      }
      
      userStats[userId].totalScore += score;
      userStats[userId].count++;
      if (interview.role) userStats[userId].roles.add(interview.role);
    });
    
    const result = Object.entries(userStats)
      .map(([userId, stats]) => ({
        userId,
        name: stats.name,
        email: stats.email,
        averageScore: Math.round(stats.totalScore / stats.count),
        totalInterviews: stats.count,
        uniqueRoles: Array.from(stats.roles)
      }))
      .sort((a, b) => b.totalInterviews - a.totalInterviews)
      .slice(0, parseInt(limit));
    
    res.json(result);
    
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to load user analytics' });
  }
});

module.exports = router;