// const express = require('express');
// const router = express.Router();
// const InterviewConfig = require('../models/InterviewConfig');

// // Middleware to verify admin authentication
// const verifyAdmin = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ error: 'Authentication required' });
//   }
//   // You can add proper token verification here
//   // For now, we'll assume the token is valid if it exists
//   next();
// };

// // Get complete configuration
// router.get('/config', verifyAdmin, async (req, res) => {
//   try {
//     let config = await InterviewConfig.findOne();
    
//     if (!config) {
//       // Return default empty config
//       return res.json({
//         categories: [],
//         levels: [],
//         difficulties: [],
//         durations: [],
//         prompts: {
//           default: "Generate {count} {difficulty} interview questions for a {level} {role} position with expertise in {techStack}. Include the question, four options, the correct answer index, and a brief explanation.",
//           evaluationCriteria: {
//             weights: { technical: 50, clarity: 30, confidence: 20 }
//           }
//         }
//       });
//     }
    
//     res.json(config);
//   } catch (error) {
//     console.error('Error fetching config:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Save complete configuration
// router.put('/config', verifyAdmin, async (req, res) => {
//   try {
//     const { categories, levels, difficulties, durations, prompts } = req.body;
    
//     let config = await InterviewConfig.findOne();
    
//     if (config) {
//       config.categories = categories;
//       config.levels = levels;
//       config.difficulties = difficulties;
//       config.durations = durations;
//       config.prompts = prompts;
//       config.updatedAt = new Date();
//     } else {
//       config = new InterviewConfig({
//         categories,
//         levels,
//         difficulties,
//         durations,
//         prompts
//       });
//     }
    
//     await config.save();
//     res.json({ message: 'Configuration saved successfully', config });
//   } catch (error) {
//     console.error('Error saving config:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Category CRUD
// router.post('/categories', verifyAdmin, async (req, res) => {
//   try {
//     const { name } = req.body;
//     let config = await InterviewConfig.findOne();
    
//     const newCategory = {
//       id: `cat-${Date.now()}`,
//       name,
//       roles: []
//     };
    
//     if (!config) {
//       config = new InterviewConfig({
//         categories: [newCategory],
//         levels: [],
//         difficulties: [],
//         durations: [],
//         prompts: {
//           default: "Generate {count} {difficulty} interview questions for a {level} {role} position with expertise in {techStack}.",
//           evaluationCriteria: { weights: { technical: 50, clarity: 30, confidence: 20 } }
//         }
//       });
//     } else {
//       config.categories.push(newCategory);
//     }
    
//     await config.save();
//     res.status(201).json(newCategory);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.put('/categories/:categoryId', verifyAdmin, async (req, res) => {
//   try {
//     const { categoryId } = req.params;
//     const { name } = req.body;
    
//     const config = await InterviewConfig.findOne();
//     if (!config) return res.status(404).json({ error: 'Config not found' });
    
//     const category = config.categories.find(c => c.id === categoryId);
//     if (!category) return res.status(404).json({ error: 'Category not found' });
    
//     category.name = name;
//     await config.save();
//     res.json(category);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.delete('/categories/:categoryId', verifyAdmin, async (req, res) => {
//   try {
//     const { categoryId } = req.params;
//     const config = await InterviewConfig.findOne();
//     if (!config) return res.status(404).json({ error: 'Config not found' });
    
//     config.categories = config.categories.filter(c => c.id !== categoryId);
//     await config.save();
//     res.json({ message: 'Category deleted' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Role CRUD
// router.post('/categories/:categoryId/roles', verifyAdmin, async (req, res) => {
//   try {
//     const { categoryId } = req.params;
//     const { name, techStacks } = req.body;
    
//     const config = await InterviewConfig.findOne();
//     if (!config) return res.status(404).json({ error: 'Config not found' });
    
//     const category = config.categories.find(c => c.id === categoryId);
//     if (!category) return res.status(404).json({ error: 'Category not found' });
    
//     const newRole = {
//       id: `role-${Date.now()}`,
//       name,
//       techStacks: techStacks || []
//     };
    
//     category.roles.push(newRole);
//     await config.save();
//     res.status(201).json(newRole);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.put('/categories/:categoryId/roles/:roleId', verifyAdmin, async (req, res) => {
//   try {
//     const { categoryId, roleId } = req.params;
//     const { name, techStacks } = req.body;
    
//     const config = await InterviewConfig.findOne();
//     if (!config) return res.status(404).json({ error: 'Config not found' });
    
//     const category = config.categories.find(c => c.id === categoryId);
//     if (!category) return res.status(404).json({ error: 'Category not found' });
    
//     const role = category.roles.find(r => r.id === roleId);
//     if (!role) return res.status(404).json({ error: 'Role not found' });
    
//     role.name = name;
//     role.techStacks = techStacks;
//     await config.save();
//     res.json(role);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.delete('/categories/:categoryId/roles/:roleId', verifyAdmin, async (req, res) => {
//   try {
//     const { categoryId, roleId } = req.params;
//     const config = await InterviewConfig.findOne();
//     if (!config) return res.status(404).json({ error: 'Config not found' });
    
//     const category = config.categories.find(c => c.id === categoryId);
//     if (!category) return res.status(404).json({ error: 'Category not found' });
    
//     category.roles = category.roles.filter(r => r.id !== roleId);
//     await config.save();
//     res.json({ message: 'Role deleted' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Levels CRUD
// router.post('/levels', verifyAdmin, async (req, res) => {
//   try {
//     const { label, icon, description } = req.body;
//     let config = await InterviewConfig.findOne();
    
//     const newLevel = {
//       id: `level-${Date.now()}`,
//       label,
//       icon,
//       description
//     };
    
//     if (!config) {
//       config = new InterviewConfig({
//         categories: [],
//         levels: [newLevel],
//         difficulties: [],
//         durations: [],
//         prompts: {
//           default: "Generate {count} {difficulty} interview questions for a {level} {role} position with expertise in {techStack}.",
//           evaluationCriteria: { weights: { technical: 50, clarity: 30, confidence: 20 } }
//         }
//       });
//     } else {
//       config.levels.push(newLevel);
//     }
    
//     await config.save();
//     res.status(201).json(newLevel);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.put('/levels/:levelId', verifyAdmin, async (req, res) => {
//   try {
//     const { levelId } = req.params;
//     const { label, icon, description } = req.body;
    
//     const config = await InterviewConfig.findOne();
//     if (!config) return res.status(404).json({ error: 'Config not found' });
    
//     const level = config.levels.find(l => l.id === levelId);
//     if (!level) return res.status(404).json({ error: 'Level not found' });
    
//     level.label = label;
//     level.icon = icon;
//     level.description = description;
//     await config.save();
//     res.json(level);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.delete('/levels/:levelId', verifyAdmin, async (req, res) => {
//   try {
//     const { levelId } = req.params;
//     const config = await InterviewConfig.findOne();
//     if (!config) return res.status(404).json({ error: 'Config not found' });
    
//     config.levels = config.levels.filter(l => l.id !== levelId);
//     await config.save();
//     res.json({ message: 'Level deleted' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Difficulties CRUD
// router.post('/difficulties', verifyAdmin, async (req, res) => {
//   try {
//     const { label, icon } = req.body;
//     let config = await InterviewConfig.findOne();
    
//     const newDifficulty = {
//       id: `diff-${Date.now()}`,
//       label,
//       icon
//     };
    
//     if (!config) {
//       config = new InterviewConfig({
//         categories: [],
//         levels: [],
//         difficulties: [newDifficulty],
//         durations: [],
//         prompts: {
//           default: "Generate {count} {difficulty} interview questions for a {level} {role} position with expertise in {techStack}.",
//           evaluationCriteria: { weights: { technical: 50, clarity: 30, confidence: 20 } }
//         }
//       });
//     } else {
//       config.difficulties.push(newDifficulty);
//     }
    
//     await config.save();
//     res.status(201).json(newDifficulty);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.put('/difficulties/:difficultyId', verifyAdmin, async (req, res) => {
//   try {
//     const { difficultyId } = req.params;
//     const { label, icon } = req.body;
    
//     const config = await InterviewConfig.findOne();
//     if (!config) return res.status(404).json({ error: 'Config not found' });
    
//     const difficulty = config.difficulties.find(d => d.id === difficultyId);
//     if (!difficulty) return res.status(404).json({ error: 'Difficulty not found' });
    
//     difficulty.label = label;
//     difficulty.icon = icon;
//     await config.save();
//     res.json(difficulty);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.delete('/difficulties/:difficultyId', verifyAdmin, async (req, res) => {
//   try {
//     const { difficultyId } = req.params;
//     const config = await InterviewConfig.findOne();
//     if (!config) return res.status(404).json({ error: 'Config not found' });
    
//     config.difficulties = config.difficulties.filter(d => d.id !== difficultyId);
//     await config.save();
//     res.json({ message: 'Difficulty deleted' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Durations CRUD
// router.post('/durations', verifyAdmin, async (req, res) => {
//   try {
//     const { value, label, icon } = req.body;
//     let config = await InterviewConfig.findOne();
    
//     const newDuration = { value, label, icon };
    
//     if (!config) {
//       config = new InterviewConfig({
//         categories: [],
//         levels: [],
//         difficulties: [],
//         durations: [newDuration],
//         prompts: {
//           default: "Generate {count} {difficulty} interview questions for a {level} {role} position with expertise in {techStack}.",
//           evaluationCriteria: { weights: { technical: 50, clarity: 30, confidence: 20 } }
//         }
//       });
//     } else {
//       config.durations.push(newDuration);
//     }
    
//     await config.save();
//     res.status(201).json(newDuration);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.put('/durations/:durationValue', verifyAdmin, async (req, res) => {
//   try {
//     const { durationValue } = req.params;
//     const { value, label, icon } = req.body;
    
//     const config = await InterviewConfig.findOne();
//     if (!config) return res.status(404).json({ error: 'Config not found' });
    
//     const index = config.durations.findIndex(d => d.value === durationValue);
//     if (index === -1) return res.status(404).json({ error: 'Duration not found' });
    
//     config.durations[index] = { value, label, icon };
//     await config.save();
//     res.json(config.durations[index]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.delete('/durations/:durationValue', verifyAdmin, async (req, res) => {
//   try {
//     const { durationValue } = req.params;
//     const config = await InterviewConfig.findOne();
//     if (!config) return res.status(404).json({ error: 'Config not found' });
    
//     config.durations = config.durations.filter(d => d.value !== durationValue);
//     await config.save();
//     res.json({ message: 'Duration deleted' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const InterviewConfig = require('../models/InterviewConfig');

// Get configuration
router.get('/config', async (req, res) => {
  try {
    let config = await InterviewConfig.findOne();
    if (!config) {
      return res.json({
        categories: [],
        levels: [],
        difficulties: [],
        durations: [],
        prompts: {
          default: "Generate {count} {difficulty} interview questions for a {level} {role} position with expertise in {techStack}. Include the question, four options, the correct answer index, and a brief explanation.",
          evaluationCriteria: { weights: { technical: 50, clarity: 30, confidence: 20 } }
        }
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save configuration
router.put('/config', async (req, res) => {
  try {
    const { categories, levels, difficulties, durations, prompts } = req.body;
    let config = await InterviewConfig.findOne();
    
    if (config) {
      config.categories = categories;
      config.levels = levels;
      config.difficulties = difficulties;
      config.durations = durations;
      config.prompts = prompts;
      config.updatedAt = new Date();
    } else {
      config = new InterviewConfig({ categories, levels, difficulties, durations, prompts });
    }
    
    await config.save();
    res.json({ message: 'Configuration saved successfully', config });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;