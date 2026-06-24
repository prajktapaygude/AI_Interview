// const express = require('express');
// const crypto = require('crypto');
// const User = require('../models/User');
// const Subscription = require('../models/Subscription');
// const Plan = require('../models/Plan');
// const jwt = require('jsonwebtoken');
// const router = express.Router();

// // Authentication middleware for payment routes
// const { authenticateUser } = require('../routes/auth');

// // Test endpoint
// router.get('/test', (req, res) => {
//   res.json({ message: 'Payment route is working' });
// });

// // ========== CREATE PAYMENT ==========
// router.post('/create', authenticateUser, async (req, res) => {
//   try {
//     const { plan: planName } = req.body;
//     const user = req.user;

//     console.log('💰 Creating payment for user:', user.email, 'Plan:', planName);

//     // Fetch plan from database
//     const plan = await Plan.findOne({ name: planName, isActive: true });
//     if (!plan) {
//       console.log('❌ Plan not found:', planName);
//       return res.status(400).json({ error: 'Invalid or inactive plan selected' });
//     }

//     const amount = plan.price;
//     const txnid = `TXN_${Date.now()}_${user._id}`;
//     const key = process.env.PAYU_KEY;
//     const salt = process.env.PAYU_SALT;

//     if (!key || !salt) {
//       console.error('❌ PayU credentials missing');
//       return res.status(500).json({ error: 'Payment gateway not configured' });
//     }
    
//     const productinfo = `${plan.name} Subscription`;
//     const firstname = user.name || user.username || 'User';
//     const email = user.email;
//     const phone = user.phone || '9999999999';

//     // Generate PayU hash
//     const udf1 = '';
//     const udf2 = '';
//     const udf3 = '';
//     const udf4 = '';
//     const udf5 = '';

//     const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;

//     const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    
//     // Create pending subscription
//     await Subscription.create({
//       userId: user._id,
//       plan: plan.name,
//       amount,
//       transactionId: txnid,
//       status: 'pending'
//     });

//     // Use backend URLs for PayU callbacks (not frontend directly)
//     const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
//     console.log('✅ Payment created:', { txnid, amount, plan: plan.name });

//     res.json({
//       key,
//       txnid,
//       amount,
//       productinfo,
//       firstname,
//       email,
//       phone,
//       surl: `https://interglandular-spottedly-gladis.ngrok-free.dev/api/payment/payu-success`,
//       furl: `https://interglandular-spottedly-gladis.ngrok-free.dev/api/payment/payu-failure`,
//       hash
//     });
//   } catch (err) {
//     console.error('Payment creation error:', err);
//     res.status(500).json({ error: 'Failed to initiate payment: ' + err.message });
//   }
// });

// // ========== PAYU SUCCESS WEBHOOK (Handles POST from PayU) ==========
// router.post('/payu-success', async (req, res) => {
//   try {
//     console.log('✅ PayU Success Webhook Received:', req.body);
    
//     const { txnid, status, mihpayid, mode, amount, bank_ref_num, unmappedstatus } = req.body;
    
//     // Update subscription status
//     const subscription = await Subscription.findOne({ transactionId: txnid });
    
//     if (!subscription) {
//       console.log('❌ Transaction not found:', txnid);
//       return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure?error=Transaction not found`);
//     }
    
//     if (status === 'success' || unmappedstatus === 'success') {
//       // Calculate expiry date (30 days from now)
//       const expiryDate = new Date();
//       expiryDate.setDate(expiryDate.getDate() + 30);
      
//       // Update subscription
//       subscription.status = 'success';
//       subscription.expiryDate = expiryDate;
//       subscription.paymentDetails = { 
//         mihpayid, 
//         mode, 
//         amount, 
//         bank_ref_num,
//         paidAt: new Date()
//       };
//       await subscription.save();
      
//       // 🔥 CRITICAL: Update user's membership and subscription details
//       const updatedUser = await User.findByIdAndUpdate(
//         subscription.userId, 
//         {
//           membership: subscription.plan,  // Update membership to the plan name
//           isPremium: true,
//           activeSubscriptionId: subscription._id,
//           subscriptionExpiryDate: expiryDate,
//           subscriptionPlan: subscription.plan,
//           subscriptionStatus: 'active',
//           lastSubscriptionUpdate: new Date()
//         },
//         { new: true } // Return updated document
//       );
      
//       console.log(`✅ User ${updatedUser.email} membership updated to: ${updatedUser.membership}`);
//       console.log(`✅ Payment successful: ${subscription.userId} - ${subscription.plan} plan expires on ${expiryDate.toDateString()}`);
      
//       // Redirect to frontend success page with GET parameters
//       const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//       return res.redirect(`${frontendUrl}/payment-success?txnid=${txnid}&status=success&plan=${subscription.plan}`);
//     } else {
//       subscription.status = 'failed';
//       subscription.failureReason = `Status: ${status}, Unmapped: ${unmappedstatus}`;
//       await subscription.save();
      
//       console.log(`❌ Payment failed: ${txnid} - Status: ${status}`);
      
//       const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//       return res.redirect(`${frontendUrl}/payment-failure?txnid=${txnid}&error=Payment failed with status: ${status}`);
//     }
//   } catch (err) {
//     console.error('Success webhook error:', err);
//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//     res.redirect(`${frontendUrl}/payment-failure?error=Verification failed: ${err.message}`);
//   }
// });

// // ========== PAYU FAILURE WEBHOOK (Handles POST from PayU) ==========
// router.post('/payu-failure', async (req, res) => {
//   try {
//     console.log('❌ PayU Failure Webhook Received:', req.body);
    
//     const { txnid, status, error, error_Message, unmappedstatus } = req.body;
    
//     // Update subscription status
//     const subscription = await Subscription.findOne({ transactionId: txnid });
    
//     if (subscription) {
//       subscription.status = 'failed';
//       subscription.failureReason = error_Message || error || `Status: ${status}, Unmapped: ${unmappedstatus}`;
//       await subscription.save();
      
//       console.log(`❌ Payment failed recorded: ${txnid}`);
//     } else {
//       console.log('⚠️ Transaction not found for failure:', txnid);
//     }
    
//     // Redirect to frontend failure page
//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//     const errorMsg = error_Message || error || 'Payment failed';
//     res.redirect(`${frontendUrl}/payment-failure?txnid=${txnid || ''}&error=${encodeURIComponent(errorMsg)}`);
//   } catch (err) {
//     console.error('Failure webhook error:', err);
//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//     res.redirect(`${frontendUrl}/payment-failure?error=${encodeURIComponent(err.message)}`);
//   }
// });

// // ========== VERIFY PAYMENT (For manual verification) ==========
// router.post('/verify', async (req, res) => {
//   try {
//     const { txnid, status } = req.body;
    
//     console.log('🔍 Verifying payment:', { txnid, status });

//     const subscription = await Subscription.findOne({ transactionId: txnid });
//     if (!subscription) {
//       console.log('❌ Transaction not found:', txnid);
//       return res.status(404).json({ error: 'Transaction not found' });
//     }

//     if (status === 'success') {
//       // Calculate expiry date (30 days from now)
//       const expiryDate = new Date();
//       expiryDate.setDate(expiryDate.getDate() + 30);

//       // Update subscription
//       subscription.status = 'success';
//       subscription.expiryDate = expiryDate;
//       await subscription.save();

//       // 🔥 CRITICAL: Update user's membership
//       const updatedUser = await User.findByIdAndUpdate(
//         subscription.userId,
//         {
//           membership: subscription.plan,
//           isPremium: true,
//           activeSubscriptionId: subscription._id,
//           subscriptionExpiryDate: expiryDate,
//           subscriptionPlan: subscription.plan,
//           subscriptionStatus: 'active',
//           lastSubscriptionUpdate: new Date()
//         },
//         { new: true }
//       );

//       console.log(`✅ User ${updatedUser.email} membership updated to: ${updatedUser.membership}`);
//       console.log(`✅ Payment verified: ${subscription.userId} - ${subscription.plan} plan`);

//       return res.json({ 
//         success: true, 
//         message: 'Subscription activated',
//         expiryDate: expiryDate,
//         membership: updatedUser.membership
//       });
//     } else {
//       subscription.status = 'failed';
//       await subscription.save();
//       console.log(`❌ Payment failed: ${txnid}`);
//       return res.status(400).json({ error: 'Payment failed' });
//     }
//   } catch (err) {
//     console.error('Payment verification error:', err);
//     res.status(500).json({ error: 'Verification failed: ' + err.message });
//   }
// });

// // ========== GET USER'S SUBSCRIPTION ==========
// router.get('/my-subscription', authenticateUser, async (req, res) => {
//   try {
//     const userId = req.user._id;
    
//     // Get user to check membership
//     const user = await User.findById(userId);
    
//     const subscription = await Subscription.findOne({
//       userId: userId,
//       status: 'success',
//       expiryDate: { $gt: new Date() }
//     }).sort({ createdAt: -1 });
    
//     if (subscription && user.membership !== 'Free') {
//       return res.json({
//         hasActiveSubscription: true,
//         subscription: {
//           plan: subscription.plan,
//           expiryDate: subscription.expiryDate,
//           transactionId: subscription.transactionId,
//           amount: subscription.amount
//         },
//         userMembership: user.membership
//       });
//     } else {
//       return res.json({
//         hasActiveSubscription: false,
//         subscription: null,
//         userMembership: user.membership || 'Free'
//       });
//     }
//   } catch (err) {
//     console.error('Error fetching subscription:', err);
//     res.status(500).json({ error: 'Failed to fetch subscription status' });
//   }
// });

// // ========== REFRESH USER MEMBERSHIP (Called after successful payment) ==========
// router.post('/refresh-membership', authenticateUser, async (req, res) => {
//   try {
//     const userId = req.user._id;
    
//     // Fetch latest user data
//     const user = await User.findById(userId);
    
//     // Check for active subscription
//     const activeSubscription = await Subscription.findOne({
//       userId: userId,
//       status: 'success',
//       expiryDate: { $gt: new Date() }
//     }).sort({ createdAt: -1 });
    
//     let membership = user.membership || 'Free';
    
//     if (activeSubscription && activeSubscription.expiryDate > new Date()) {
//       membership = activeSubscription.plan;
      
//       // Update user if needed
//       if (user.membership !== membership) {
//         await User.findByIdAndUpdate(userId, {
//           membership: membership,
//           isPremium: true,
//           subscriptionExpiryDate: activeSubscription.expiryDate
//         });
//         console.log(`🔄 Updated user ${user.email} membership to ${membership}`);
//       }
//     } else if (user.membership !== 'Free') {
//       // Check if subscription expired
//       if (user.subscriptionExpiryDate && new Date(user.subscriptionExpiryDate) < new Date()) {
//         await User.findByIdAndUpdate(userId, {
//           membership: 'Free',
//           isPremium: false,
//           subscriptionStatus: 'expired'
//         });
//         membership = 'Free';
//         console.log(`⏰ User ${user.email} subscription expired, reset to Free`);
//       }
//     }
    
//     res.json({
//       success: true,
//       membership: membership,
//       hasActiveSubscription: membership !== 'Free',
//       subscription: activeSubscription ? {
//         plan: activeSubscription.plan,
//         expiryDate: activeSubscription.expiryDate
//       } : null
//     });
//   } catch (err) {
//     console.error('Error refreshing membership:', err);
//     res.status(500).json({ error: 'Failed to refresh membership' });
//   }
// });

// module.exports = router;



const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Authentication middleware for payment routes
const { authenticateUser } = require('../routes/auth');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Payment route is working' });
});

// ========== CREATE PAYMENT ==========
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const { plan: planName } = req.body;
    const user = req.user;

    console.log('💰 Creating payment for user:', user.email, 'Plan:', planName);

    // Fetch plan from database
    const plan = await Plan.findOne({ name: planName, isActive: true });
    if (!plan) {
      console.log('❌ Plan not found:', planName);
      return res.status(400).json({ error: 'Invalid or inactive plan selected' });
    }

    const amount = plan.price;
    const txnid = `TXN_${Date.now()}_${user._id}`;
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    if (!key || !salt) {
      console.error('❌ PayU credentials missing');
      return res.status(500).json({ error: 'Payment gateway not configured' });
    }
    
    const productinfo = `${plan.name} Subscription`;
    const firstname = user.name || user.username || 'User';
    const email = user.email;
    const phone = user.phone || '9999999999';

    // Generate PayU hash
    const udf1 = '';
    const udf2 = '';
    const udf3 = '';
    const udf4 = '';
    const udf5 = '';

    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;

    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    
    // Create pending subscription
    await Subscription.create({
      userId: user._id,
      plan: plan.name,
      amount,
      transactionId: txnid,
      status: 'pending'
    });

    // 🔥 FIXED: Use environment variable for backend URL – no hardcoded ngrok
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    console.log('✅ Payment created:', { txnid, amount, plan: plan.name });

    res.json({
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl: `${BACKEND_URL}/api/payment/payu-success`,   // Dynamic backend URL
      furl: `${BACKEND_URL}/api/payment/payu-failure`,   // Dynamic backend URL
      hash
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    res.status(500).json({ error: 'Failed to initiate payment: ' + err.message });
  }
});

// ========== PAYU SUCCESS WEBHOOK (Handles POST from PayU) ==========
router.post('/payu-success', async (req, res) => {
  try {
    console.log('✅ PayU Success Webhook Received:', req.body);
    
    const { txnid, status, mihpayid, mode, amount, bank_ref_num, unmappedstatus } = req.body;
    
    // Update subscription status
    const subscription = await Subscription.findOne({ transactionId: txnid });
    
    if (!subscription) {
      console.log('❌ Transaction not found:', txnid);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure?error=Transaction not found`);
    }
    
    if (status === 'success' || unmappedstatus === 'success') {
      // Calculate expiry date (30 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      // Update subscription
      subscription.status = 'success';
      subscription.expiryDate = expiryDate;
      subscription.paymentDetails = { 
        mihpayid, 
        mode, 
        amount, 
        bank_ref_num,
        paidAt: new Date()
      };
      await subscription.save();
      
      // 🔥 CRITICAL: Update user's membership and subscription details
      const updatedUser = await User.findByIdAndUpdate(
        subscription.userId, 
        {
          membership: subscription.plan,  // Update membership to the plan name
          isPremium: true,
          activeSubscriptionId: subscription._id,
          subscriptionExpiryDate: expiryDate,
          subscriptionPlan: subscription.plan,
          subscriptionStatus: 'active',
          lastSubscriptionUpdate: new Date()
        },
        { new: true } // Return updated document
      );
      
      console.log(`✅ User ${updatedUser.email} membership updated to: ${updatedUser.membership}`);
      console.log(`✅ Payment successful: ${subscription.userId} - ${subscription.plan} plan expires on ${expiryDate.toDateString()}`);
      
      // Redirect to frontend success page with GET parameters
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/payment-success?txnid=${txnid}&status=success&plan=${subscription.plan}`);
    } else {
      subscription.status = 'failed';
      subscription.failureReason = `Status: ${status}, Unmapped: ${unmappedstatus}`;
      await subscription.save();
      
      console.log(`❌ Payment failed: ${txnid} - Status: ${status}`);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/payment-failure?txnid=${txnid}&error=Payment failed with status: ${status}`);
    }
  } catch (err) {
    console.error('Success webhook error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/payment-failure?error=Verification failed: ${err.message}`);
  }
});

// ========== PAYU FAILURE WEBHOOK (Handles POST from PayU) ==========
router.post('/payu-failure', async (req, res) => {
  try {
    console.log('❌ PayU Failure Webhook Received:', req.body);
    
    const { txnid, status, error, error_Message, unmappedstatus } = req.body;
    
    // Update subscription status
    const subscription = await Subscription.findOne({ transactionId: txnid });
    
    if (subscription) {
      subscription.status = 'failed';
      subscription.failureReason = error_Message || error || `Status: ${status}, Unmapped: ${unmappedstatus}`;
      await subscription.save();
      
      console.log(`❌ Payment failed recorded: ${txnid}`);
    } else {
      console.log('⚠️ Transaction not found for failure:', txnid);
    }
    
    // Redirect to frontend failure page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const errorMsg = error_Message || error || 'Payment failed';
    res.redirect(`${frontendUrl}/payment-failure?txnid=${txnid || ''}&error=${encodeURIComponent(errorMsg)}`);
  } catch (err) {
    console.error('Failure webhook error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/payment-failure?error=${encodeURIComponent(err.message)}`);
  }
});

// ========== VERIFY PAYMENT (For manual verification) ==========
router.post('/verify', async (req, res) => {
  try {
    const { txnid, status } = req.body;
    
    console.log('🔍 Verifying payment:', { txnid, status });

    const subscription = await Subscription.findOne({ transactionId: txnid });
    if (!subscription) {
      console.log('❌ Transaction not found:', txnid);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (status === 'success') {
      // Calculate expiry date (30 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      // Update subscription
      subscription.status = 'success';
      subscription.expiryDate = expiryDate;
      await subscription.save();

      // 🔥 CRITICAL: Update user's membership
      const updatedUser = await User.findByIdAndUpdate(
        subscription.userId,
        {
          membership: subscription.plan,
          isPremium: true,
          activeSubscriptionId: subscription._id,
          subscriptionExpiryDate: expiryDate,
          subscriptionPlan: subscription.plan,
          subscriptionStatus: 'active',
          lastSubscriptionUpdate: new Date()
        },
        { new: true }
      );

      console.log(`✅ User ${updatedUser.email} membership updated to: ${updatedUser.membership}`);
      console.log(`✅ Payment verified: ${subscription.userId} - ${subscription.plan} plan`);

      return res.json({ 
        success: true, 
        message: 'Subscription activated',
        expiryDate: expiryDate,
        membership: updatedUser.membership
      });
    } else {
      subscription.status = 'failed';
      await subscription.save();
      console.log(`❌ Payment failed: ${txnid}`);
      return res.status(400).json({ error: 'Payment failed' });
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: 'Verification failed: ' + err.message });
  }
});

// ========== GET USER'S SUBSCRIPTION ==========
router.get('/my-subscription', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user to check membership
    const user = await User.findById(userId);
    
    const subscription = await Subscription.findOne({
      userId: userId,
      status: 'success',
      expiryDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (subscription && user.membership !== 'Free') {
      return res.json({
        hasActiveSubscription: true,
        subscription: {
          plan: subscription.plan,
          expiryDate: subscription.expiryDate,
          transactionId: subscription.transactionId,
          amount: subscription.amount
        },
        userMembership: user.membership
      });
    } else {
      return res.json({
        hasActiveSubscription: false,
        subscription: null,
        userMembership: user.membership || 'Free'
      });
    }
  } catch (err) {
    console.error('Error fetching subscription:', err);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// ========== REFRESH USER MEMBERSHIP (Called after successful payment) ==========
router.post('/refresh-membership', authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Fetch latest user data
    const user = await User.findById(userId);
    
    // Check for active subscription
    const activeSubscription = await Subscription.findOne({
      userId: userId,
      status: 'success',
      expiryDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    let membership = user.membership || 'Free';
    
    if (activeSubscription && activeSubscription.expiryDate > new Date()) {
      membership = activeSubscription.plan;
      
      // Update user if needed
      if (user.membership !== membership) {
        await User.findByIdAndUpdate(userId, {
          membership: membership,
          isPremium: true,
          subscriptionExpiryDate: activeSubscription.expiryDate
        });
        console.log(`🔄 Updated user ${user.email} membership to ${membership}`);
      }
    } else if (user.membership !== 'Free') {
      // Check if subscription expired
      if (user.subscriptionExpiryDate && new Date(user.subscriptionExpiryDate) < new Date()) {
        await User.findByIdAndUpdate(userId, {
          membership: 'Free',
          isPremium: false,
          subscriptionStatus: 'expired'
        });
        membership = 'Free';
        console.log(`⏰ User ${user.email} subscription expired, reset to Free`);
      }
    }
    
    res.json({
      success: true,
      membership: membership,
      hasActiveSubscription: membership !== 'Free',
      subscription: activeSubscription ? {
        plan: activeSubscription.plan,
        expiryDate: activeSubscription.expiryDate
      } : null
    });
  } catch (err) {
    console.error('Error refreshing membership:', err);
    res.status(500).json({ error: 'Failed to refresh membership' });
  }
});

module.exports = router;