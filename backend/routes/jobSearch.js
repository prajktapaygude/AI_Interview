const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const router = express.Router();

require('dotenv').config();

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authentication required', needsSubscription: true });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const user = await User.findById(decoded.userId || decoded.id || decoded._id);
        if (!user) {
            return res.status(401).json({ error: 'User not found', needsSubscription: true });
        }
        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token', needsSubscription: true });
    }
};

// Check if user has access to Job Search (Only Pro plan)
const hasJobSearchAccess = async (userId) => {
    try {
        const user = await User.findById(userId);
        console.log(`Checking Job Search Access for user ${user?.email}: Membership = ${user?.membership}`);
        
        if (user && user.membership === 'Pro') {
            if (user.subscriptionExpiryDate && new Date(user.subscriptionExpiryDate) > new Date()) {
                console.log(`✅ User ${user.email} has Pro plan, granting Job Search access`);
                return true;
            }
        }
        
        const subscription = await Subscription.findOne({
            userId: userId,
            status: 'success',
            plan: 'Pro',
            expiryDate: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        
        const hasAccess = !!subscription;
        console.log(`Job Search Access for user ${user?.email}: ${hasAccess}`);
        return hasAccess;
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
};

// Check if user has access to Resume Analyzer (Basic or Pro plan)
const hasResumeAnalyzerAccess = async (userId) => {
    try {
        const user = await User.findById(userId);
        console.log(`Checking Resume Analyzer Access for user ${user?.email}: Membership = ${user?.membership}`);
        
        if (user && (user.membership === 'Basic' || user.membership === 'Pro')) {
            if (user.subscriptionExpiryDate && new Date(user.subscriptionExpiryDate) > new Date()) {
                console.log(`✅ User ${user.email} has ${user.membership} plan, granting Resume Analyzer access`);
                return true;
            }
        }
        
        const subscription = await Subscription.findOne({
            userId: userId,
            status: 'success',
            plan: { $in: ['Basic', 'Pro'] },
            expiryDate: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        
        const hasAccess = !!subscription;
        console.log(`Resume Analyzer Access for user ${user?.email}: ${hasAccess}`);
        return hasAccess;
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
};

// Adzuna API configuration
let APP_ID = process.env.ADZUNA_APP_ID || '';
let APP_KEY = process.env.ADZUNA_APP_KEY || '';

async function fetchFromAdzuna(skills, location, country) {
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`;
    const params = {
        app_id: APP_ID,
        app_key: APP_KEY,
        what: skills,
        where: location,
        results_per_page: 20,
        sort_by: 'date'
    };
    
    return axios.get(url, { params, timeout: 15000 });
}

async function searchRealJobs(skills, location) {
    try {
        let response;
        let usedCountry = "in";
        try {
            response = await fetchFromAdzuna(skills, location, "in");
        } catch (err) {
            console.log("⚠️ India endpoint failed, trying GB...");
            usedCountry = "gb";
            response = await fetchFromAdzuna(skills, location, "gb");
        }
        
        if (!response.data?.results?.length) return null;
        
        const jobs = response.data.results
            .filter(job => job.title && job.company?.display_name && job.redirect_url)
            .map(job => ({
                id: job.id,
                title: job.title,
                company: job.company.display_name.replace(/\b(ltd|limited|jobs|careers)\b/gi, '').trim(),
                location: job.location?.display_name || location,
                apply_link: job.redirect_url,
                description: job.description?.substring(0, 250) + "...",
                salary: job.salary_min && job.salary_max ? 
                    `₹${Math.round(job.salary_min).toLocaleString()} - ₹${Math.round(job.salary_max).toLocaleString()}` : 
                    "Not specified",
                created: job.created ? new Date(job.created).toLocaleDateString() : "Recent"
            }));
        
        // Remove duplicates
        const unique = [];
        const seen = new Set();
        for (const job of jobs) {
            const key = job.title + job.company;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(job);
            }
        }
        
        return { jobs: unique, source: 'adzuna' };
    } catch (error) {
        console.error("API Error:", error.message);
        return null;
    }
}

function getMockJobs(skills, location) {
    const skillKeywords = skills.toLowerCase().split(/[ ,]+/);
    const locationKeywords = location.toLowerCase();
    
    const jobDatabase = [
        { title: "React Developer", company: "Tech Mahindra", locations: ["mumbai", "navi mumbai", "delhi", "bangalore"], skills: ["react", "javascript", "frontend"], salary: "₹6L - ₹10L", description: "Looking for experienced React developer with strong JavaScript skills" },
        { title: "Full Stack Developer", company: "Infosys", locations: ["mumbai", "pune", "bangalore", "delhi"], skills: ["react", "node.js", "javascript", "python"], salary: "₹8L - ₹14L", description: "Full stack developer with React and Node.js experience" },
        { title: "Python Developer", company: "TCS", locations: ["mumbai", "bangalore", "pune", "delhi"], skills: ["python", "django", "flask"], salary: "₹5L - ₹9L", description: "Python developer for backend services" },
        { title: "Java Engineer", company: "Oracle", locations: ["mumbai", "hyderabad", "bangalore", "delhi"], skills: ["java", "spring", "microservices"], salary: "₹10L - ₹18L", description: "Senior Java developer with Spring Boot experience" },
        { title: "Frontend Developer", company: "Flipkart", locations: ["bangalore", "delhi", "mumbai"], skills: ["react", "angular", "vue", "javascript"], salary: "₹12L - ₹20L", description: "Frontend developer for e-commerce platform" },
        { title: "Data Scientist", company: "Amazon", locations: ["bangalore", "hyderabad", "delhi"], skills: ["python", "data science", "machine learning", "sql"], salary: "₹15L - ₹25L", description: "Data scientist for ML models" },
        { title: "DevOps Engineer", company: "Razorpay", locations: ["bangalore", "mumbai"], skills: ["aws", "devops", "docker", "kubernetes"], salary: "₹12L - ₹22L", description: "DevOps engineer for cloud infrastructure" },
        { title: "Node.js Developer", company: "Swiggy", locations: ["bangalore", "delhi"], skills: ["node.js", "javascript", "mongodb"], salary: "₹8L - ₹15L", description: "Backend developer with Node.js expertise" },
        { title: "Angular Developer", company: "Persistent Systems", locations: ["pune", "mumbai"], skills: ["angular", "typescript", "javascript"], salary: "₹5L - ₹9L", description: "Angular developer for web applications" },
        { title: "Remote React Developer", company: "Zoho", locations: ["remote", "work from home"], skills: ["react", "javascript", "frontend"], salary: "₹8L - ₹14L", description: "Remote React developer position" },
        { title: "MERN Stack Developer", company: "Paytm", locations: ["noida", "delhi", "gurgaon"], skills: ["react", "node.js", "mongodb", "javascript"], salary: "₹8L - ₹15L", description: "MERN stack developer" },
    ];
    
    const matchedJobs = jobDatabase.filter(job => {
        const locationMatch = job.locations.some(loc => 
            locationKeywords.includes(loc) || loc.includes(locationKeywords)
        );
        const skillMatch = skillKeywords.some(skill => 
            skill.length > 1 && job.skills.some(jobSkill => 
                jobSkill.includes(skill) || skill.includes(jobSkill)
            )
        );
        return locationMatch && skillMatch;
    });
    
    let finalJobs = matchedJobs;
    if (matchedJobs.length === 0) {
        finalJobs = jobDatabase.filter(job =>
            job.locations.some(loc => locationKeywords.includes(loc) || loc.includes(locationKeywords))
        );
    }
    
    return finalJobs.map((job, index) => ({
        id: `mock_${Date.now()}_${index}`,
        title: job.title,
        company: job.company,
        location: job.locations[0],
        apply_link: `https://${job.company.toLowerCase().replace(/\s/g, '')}.com/careers`,
        description: `${job.description} Required skills: ${job.skills.join(", ")}.`,
        salary: job.salary,
        created: new Date().toLocaleDateString()
    }));
}

// ========== ROUTES ==========

// GET /api/jobs - Main job search endpoint
router.get('/jobs', authenticateUser, async (req, res) => {
    const { skills, location } = req.query;
    
    console.log(`\n🔍 Job Search Request:`);
    console.log(`User: ${req.user.email} (Membership: ${req.user.membership})`);
    console.log(`Skills: ${skills}, Location: ${location}`);
    
    const hasAccess = await hasJobSearchAccess(req.userId);
    
    if (!hasAccess) {
        console.log(`❌ Access denied for ${req.user.email}`);
        return res.status(403).json({ 
            error: 'Job search requires Pro subscription',
            needsSubscription: true,
            requiredPlan: 'Pro',
            message: 'Upgrade to Pro (₹299) to access job search',
            subscriptionCost: 299,
            currentMembership: req.user.membership || 'Free'
        });
    }
    
    if (!skills || !location) {
        return res.status(400).json({ error: "skills and location required", jobs: [] });
    }
    
    let jobs = [];
    let source = 'mock';
    
    // Try real API if keys are available
    if (APP_ID && APP_KEY) {
        const result = await searchRealJobs(skills, location);
        if (result?.jobs?.length) {
            jobs = result.jobs;
            source = result.source;
        }
    }
    
    // Fallback to mock data
    if (!jobs.length) {
        jobs = getMockJobs(skills, location);
    }
    
    // Additional client-side filtering to ensure relevance
    const filteredJobs = jobs.filter(job => {
        const jobTitle = job.title.toLowerCase();
        const jobDesc = (job.description || "").toLowerCase();
        const jobLocation = job.location.toLowerCase();
        const searchSkills = skills.toLowerCase();
        const searchLocation = location.toLowerCase();
        
        const skillsMatch = searchSkills.split(/[ ,]+/).some(skill => 
            skill.length > 2 && (jobTitle.includes(skill) || jobDesc.includes(skill))
        );
        const locationMatch = jobLocation.includes(searchLocation) || searchLocation.includes(jobLocation);
        
        return skillsMatch && locationMatch;
    });
    
    console.log(`✅ Found ${filteredJobs.length} jobs for ${req.user.email}`);
    
    res.json({
        jobs: filteredJobs,
        source,
        total: filteredJobs.length,
        searchCriteria: { skills, location },
        userMembership: req.user.membership
    });
});

// GET /api/jobs/check-access - Check subscription status
router.get('/jobs/check-access', authenticateUser, async (req, res) => {
    console.log(`🔍 Check access for user: ${req.user.email}`);
    
    const hasJobAccess = await hasJobSearchAccess(req.userId);
    const hasResumeAccess = await hasResumeAnalyzerAccess(req.userId);
    let expiryDate = null;
    let activePlan = null;
    
    console.log(`- Resume Analyzer Access: ${hasResumeAccess}`);
    console.log(`- Job Search Access: ${hasJobAccess}`);
    console.log(`- Membership: ${req.user.membership}`);
    
    if (hasJobAccess || hasResumeAccess) {
        const subscription = await Subscription.findOne({
            userId: req.userId,
            status: 'success',
            expiryDate: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        
        if (subscription) {
            expiryDate = subscription.expiryDate;
            activePlan = subscription.plan;
        } else if (req.user.subscriptionExpiryDate) {
            expiryDate = req.user.subscriptionExpiryDate;
            activePlan = req.user.membership;
        }
    }
    
    res.json({
        hasJobSearchAccess: hasJobAccess,
        hasResumeAnalyzerAccess: hasResumeAccess,
        expiryDate,
        activePlan,
        currentMembership: req.user.membership || 'Free'
    });
});

// GET /api/jobs/subscription-info - Get subscription info
router.get('/jobs/subscription-info', authenticateUser, async (req, res) => {
    console.log(`📋 Subscription info for user: ${req.user.email}`);
    
    const user = req.user;
    
    const subscription = await Subscription.findOne({
        userId: req.userId,
        status: 'success',
        expiryDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    const hasJobAccess = user.membership === 'Pro';
    const hasResumeAccess = user.membership === 'Basic' || user.membership === 'Pro';
    
    res.json({
        membership: user.membership || 'Free',
        hasJobSearchAccess: hasJobAccess,
        hasResumeAnalyzerAccess: hasResumeAccess,
        activeSubscription: subscription ? {
            plan: subscription.plan,
            expiryDate: subscription.expiryDate,
            amount: subscription.amount
        } : null,
        expiryDate: user.subscriptionExpiryDate
    });
});

// GET /api/jobs/suggestions - Get suggestions (public)
router.get('/jobs/suggestions', (req, res) => {
    console.log('📋 Suggestions requested');
    res.json({
        skills: [
            'React', 'Node.js', 'JavaScript', 'Python', 'Java', 'Angular', 'Vue', 'AWS', 'DevOps',
            'Data Science', 'Machine Learning', 'SQL', 'MongoDB', 'TypeScript', 'PHP', 'Ruby', 'Go',
            'C++', 'C#', '.NET', 'Flutter', 'Swift', 'Kotlin', 'Django', 'Spring Boot'
        ],
        locations: [
            'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad',
            'Noida', 'Gurgaon', 'Jaipur', 'Lucknow', 'Chandigarh', 'Bhopal', 'Remote', 'Work From Home', 'Hybrid'
        ]
    });
});

module.exports = router;