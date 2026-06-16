import Interview from '../models/Interview.js';

export const getInterviewSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const roleFilter = req.query.role || 'all';

    let pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $addFields: {
          userName: { $arrayElemAt: ['$user.name', 0] }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ];

    // Add match stage after lookup for proper search
    if (roleFilter !== 'all' || search) {
      const matchStage = { $match: {} };
      if (roleFilter !== 'all') {
        matchStage.$match.role = roleFilter;
      }
      if (search) {
        matchStage.$match.$or = [
          { role: { $regex: search, $options: 'i' } },
          { userName: { $regex: search, $options: 'i' } }
        ];
      }
      pipeline.push(matchStage);
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $skip: skip },
          { $limit: limit }
        ]
      }
    });

    const [result] = await Interview.aggregate(pipeline);

    const totalCount = result.metadata[0]?.total || 0;
    let sessions = result.data.map(doc => ({
      _id: doc._id,
      userName: doc.userName || 'Unknown',
      role: doc.role,
      techStack: doc.role?.includes('Frontend') ? 'React, JavaScript, CSS' : 
                 doc.role?.includes('Backend') ? 'Node.js, Express, MongoDB' : 
                 doc.role?.includes('Fullstack') ? 'React, Node.js' : 'Various',
      level: doc.level || 'Intermediate',
      overallScore: doc.score || 0,
      startTime: doc.createdAt
    }));

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      sessions,
      totalPages
    });
  } catch (error) {
    console.error('Error getting interview sessions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sessions',
      sessions: [],
      totalPages: 0 
    });
  }
};

