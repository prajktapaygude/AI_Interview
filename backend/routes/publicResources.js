// const express = require('express');
// const router = express.Router();
// const Resource = require('../models/Resource');

// // GET /api/resources - Public access for users (no auth required)
// router.get('/', async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 12, 
//       search = '', 
//       category = 'all', 
//       type = 'all', 
//       difficulty = 'all',
//       sort = 'newest' 
//     } = req.query;

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Build query
//     let query = { isActive: { $ne: false } }; // Exclude deleted/disabled

//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } },
//         { tags: { $in: [new RegExp(search, 'i')] } }
//       ];
//     }

//     if (category !== 'all') query.category = category;
//     if (type !== 'all') query.type = type;
//     if (difficulty !== 'all') query.difficulty = difficulty;

//     // Sorting
//     let sortOptions = {};
//     switch (sort) {
//       case 'popular':
//         sortOptions = { views: -1, createdAt: -1 };
//         break;
//       case 'alphabetical':
//         sortOptions = { title: 1 };
//         break;
//       default:
//         sortOptions = { createdAt: -1 };
//     }

//     // Get total count first
//     const total = await Resource.countDocuments(query);

//     // Fetch paginated results
//     const resources = await Resource.find(query)
//       .populate('createdBy', 'name')
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(parseInt(limit))
//       .lean();

//     res.json({
//       resources,
//       total,
//       totalPages: Math.ceil(total / limit),
//       currentPage: parseInt(page),
//       hasNext: parseInt(page) * parseInt(limit) < total
//     });

//   } catch (error) {
//     console.error('Public resources error:', error);
//     res.status(500).json({ error: 'Failed to fetch resources' });
//   }
// });

// // GET /api/resources/:id - Single resource (public)
// router.get('/:id', async (req, res) => {
//   try {
//     const resource = await Resource.findOne({ 
//       _id: req.params.id, 
//       isActive: { $ne: false } 
//     }).populate('createdBy', 'name');

//     if (!resource) {
//       return res.status(404).json({ message: 'Resource not found' });
//     }

//     // Increment view count
//     resource.views = (resource.views || 0) + 1;
//     await resource.save();

//     res.json(resource);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch resource' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// GET /api/resources - Public access for users (no auth required)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      category = 'all', 
      type = 'all', 
      difficulty = 'all',
      sort = 'newest' 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = { isActive: { $ne: false } }; // Show all non-deleted resources

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    // Sorting
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { views: -1, createdAt: -1 };
        break;
      case 'alphabetical':
        sortOptions = { title: 1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Get total count first
    const total = await Resource.countDocuments(query);

    // Fetch paginated results
    const resources = await Resource.find(query)
      .select('-__v') // Exclude version field
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // If no resources in DB, return empty array instead of mock data
    res.json({
      success: true,
      resources: resources || [],
      total: total || 0,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: parseInt(page),
      hasNext: parseInt(page) * parseInt(limit) < total
    });

  } catch (error) {
    console.error('Public resources error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch resources',
      resources: [],
      total: 0,
      totalPages: 1
    });
  }
});

// GET /api/resources/:id - Single resource (public)
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findOne({ 
      _id: req.params.id, 
      isActive: { $ne: false }
    }).lean();

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment view count (optional)
    await Resource.updateOne(
      { _id: req.params.id },
      { $inc: { views: 1 } }
    );

    res.json(resource);
  } catch (error) {
    console.error('Error fetching single resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// GET /api/resources/health - Health check for resources endpoint
router.get('/health', async (req, res) => {
  try {
    // Same base query as main resources endpoint (no filters for check)
    let query = { isActive: { $ne: false } };
    
    // Get total count of active resources
    const total = await Resource.countDocuments(query);
    
    // Log success to console (visible after hitting this endpoint post-server-start)
    console.log(`✅ Resources endpoint healthy - ${total} active resources available`);
    
    res.json({
      status: 'OK',
      resourcesAvailable: total,
      message: 'Resources endpoint working correctly - DB connected, model accessible, query successful',
      mainEndpoint: '/api/resources',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Resources health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      resourcesAvailable: 0,
      error: 'Resources query failed',
      message: 'Check MongoDB connection and Resource collection'
    });
  }
});

module.exports = router;
