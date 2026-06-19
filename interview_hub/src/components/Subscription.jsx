import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config';

const API_BASE_URL = `${BASE_URL}/api`;

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [currentMembership, setCurrentMembership] = useState('Free');
  const [updatingMembership, setUpdatingMembership] = useState(false);
  const navigate = useNavigate();

  // Fetch user's active subscription and plans
  useEffect(() => {
    fetchUserProfile();
    fetchUserSubscription();
    fetchPlans();
  }, []);

  // Fetch user profile to get current membership
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentMembership(res.data.user.membership || 'Free');
    } catch (err) {
      console.log('Could not fetch profile:', err);
    }
  };

  // Fetch user's active subscription from backend
  const fetchUserSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setActiveSubscription(null);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/payment/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.hasActiveSubscription) {
        setActiveSubscription(res.data.subscription);
      } else {
        setActiveSubscription(null);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setActiveSubscription(null);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/plans`);
      
      if (response.data && response.data.success) {
        setPlans(response.data.plans);
      } else if (response.data && Array.isArray(response.data)) {
        setPlans(response.data);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      setError('Failed to load subscription plans. Please try again later.');
      // Fallback mock data
      setPlans([
        { _id: '1', name: 'Basic', price: 99, features: ['5 Mock Interviews per month', 'Basic Resume Analysis', 'MCQ Tests Access'], badge: 'none', isActive: true },
        { _id: '2', name: 'Pro', price: 299, features: ['Unlimited Mock Interviews', 'Advanced Resume Analysis', 'All MCQ Tests', 'Priority Support'], badge: 'popular', isActive: true },
        { _id: '3', name: 'Premium', price: 499, features: ['Everything in Pro', '1-on-1 Mock Interviews', 'Career Coaching Sessions', '24/7 Support'], badge: 'new', isActive: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('User session expired. Please login again.');
        navigate('/login');
        return;
      }

      console.log('Creating payment for plan:', plan.name);
      
      const res = await axios.post(
        `${API_BASE_URL}/payment/create`,
        { plan: plan.name },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      const data = res.data;

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://test.payu.in/_payment';
      form.target = '_self';
      form.style.display = 'none';

      const fields = {
        key: data.key,
        txnid: data.txnid,
        amount: data.amount,
        productinfo: data.productinfo,
        firstname: data.firstname,
        email: data.email,
        phone: data.phone,
        surl: data.surl,
        furl: data.furl,
        hash: data.hash
      };

      const missingFields = Object.entries(fields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);
      
      if (missingFields.length > 0) {
        console.error('Missing form fields:', missingFields);
        alert('Payment configuration error. Missing: ' + missingFields.join(', '));
        return;
      }

      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 1000);
      
    } catch (err) {
      console.error('Payment error:', err);
      
      let errorMessage = 'Could not start payment. ';
      if (err.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please try again.';
      } else if (err.response?.status === 401) {
        errorMessage += 'Please login again to continue.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += err.message;
      }
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonText = (planName) => {
    if (activeSubscription?.plan === planName) {
      return 'Current Plan';
    }
    if (planName === 'Basic') return 'Get Started';
    if (planName === 'Pro') return 'Upgrade to Pro';
    if (planName === 'Premium') return 'Upgrade to Premium';
    return 'Subscribe Now';
  };

  const getButtonColor = (planName) => {
    if (activeSubscription?.plan === planName) {
      return 'bg-gray-500 cursor-not-allowed';
    }
    if (planName === 'Basic') return 'bg-blue-600 hover:bg-blue-700';
    if (planName === 'Pro') return 'bg-gradient-to-r from-blue-600 to-purple-600';
    return 'bg-purple-600 hover:bg-purple-700';
  };

  const getCardBorder = (badge, planName) => {
    if (activeSubscription?.plan === planName) {
      return 'border-2 border-green-500';
    }
    if (badge === 'popular') return 'border-2 border-blue-500';
    return 'border';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isExpiringSoon = (expiryDateStr) => {
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 5 && diffDays > 0;
  };

  // Update membership level
  const handleUpdateMembership = async (newMembership) => {
    if (updatingMembership) return;
    
    try {
      setUpdatingMembership(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        navigate('/login');
        return;
      }

      const res = await axios.put(`${API_BASE_URL}/user/membership`, 
        { membership: newMembership },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentMembership(newMembership);
      
      // Update localStorage user
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.membership = newMembership;
        localStorage.setItem('user', JSON.stringify(user));
      }

      alert(`Membership updated to ${newMembership}!`);
      fetchUserProfile(); // Refresh

    } catch (err) {
      console.error('Update membership error:', err);
      alert(err.response?.data?.message || 'Failed to update membership');
    } finally {
      setUpdatingMembership(false);
    }
  };

  const getMembershipFeatures = (membership) => {
    const features = {
      Free: [
        'Limited AI Mock Interviews (3/month)',
        'Basic Resume Analyzer',
        '20 Practice Questions',
        'Community Support'
      ],
      Pro: [
        'Unlimited AI Mock Interviews',
        'Advanced Resume Analyzer',
        '200+ Practice Questions',
        'Real-time Voice Analysis',
        'Priority Email Support'
      ],
      Premium: [
        'Unlimited Everything',
        'Premium Resume Analysis',
        '500+ Questions',
        'Video Analysis',
        'Monthly 1-on-1 Coaching',
        '24/7 Support'
      ]
    };
    return features[membership] || features.Free;
  };

  const getPlanFeatures = (planName) => {
    const features = {
      Basic: [
        '5 AI Mock Interviews per month',
        'Basic Resume Analyzer',
        '50+ Practice Questions',
        'Email Support'
      ],
      Pro: [
        'Unlimited AI Mock Interviews',
        'Advanced Resume Analyzer',
        'All MCQ Tests',
        'Priority Support'
      ],
      Premium: [
        'Everything in Pro',
        '1-on-1 Mock Interviews',
        'Career Coaching Sessions',
        '24/7 Support'
      ]
    };
    return features[planName] || features['Basic'];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  const activePlans = plans.filter(plan => plan.isActive !== false);

  return (
    <div className="min-h-screen py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
         style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 md:mb-4"
              style={{ color: 'var(--color-text-primary)' }}>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {activeSubscription ? 'Manage Your Subscription' : 'Choose Your Plan'}
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4"
             style={{ color: 'var(--color-text-secondary)' }}>
            {activeSubscription 
              ? 'View your current plan and upgrade anytime' 
              : 'AI-powered practice & feedback — affordable for everyone.'}
          </p>
        </div>

        {/* Active Subscription Card (if exists) */}
        {activeSubscription && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl border-2 border-green-500/50">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-white font-bold text-lg">🎉 Active Subscription</h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                  Active until {formatDate(activeSubscription.expiryDate)}
                </span>
              </div>
            </div>
            <div className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {activeSubscription.plan} Plan
                    </h3>
                    {isExpiringSoon(activeSubscription.expiryDate) && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        Expiring Soon!
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <div>
                      <p><span className="font-semibold">💰 Price paid:</span> ₹{activeSubscription.amount}</p>
                      <p><span className="font-semibold">📅 Purchased on:</span> {formatDate(activeSubscription.purchasedOn || activeSubscription.createdAt)}</p>
                    </div>
                    <div>
                      <p><span className="font-semibold">⏰ Expires on:</span> {formatDate(activeSubscription.expiryDate)}</p>
                      <p><span className="font-semibold">🆔 Transaction ID:</span> <span className="font-mono text-xs">{activeSubscription.transactionId}</span></p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💡 Your premium features are active. Enjoy unlimited access to AI mock interviews, resume analysis, and more!
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowUpgrade(!showUpgrade)}
                  className="px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition"
                >
                  {showUpgrade ? 'Hide Plans' : 'Upgrade Plan →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Features */}
        {activeSubscription && !showUpgrade && (
          <div className="mb-8 rounded-xl border p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              ✨ What's included in your {activeSubscription.plan} plan:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {getPlanFeatures(activeSubscription.plan).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plans Grid - Show when no active subscription OR upgrade button clicked */}
        {(!activeSubscription || showUpgrade) && (
          <>
            {activeSubscription && showUpgrade && (
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Upgrade to a better plan
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Choose a plan with more features and benefits
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
              {activePlans.map((plan) => {
                const isCurrentPlan = activeSubscription?.plan === plan.name;
                const isUpgrade = activeSubscription && getPlanLevel(plan.name) > getPlanLevel(activeSubscription.plan);
                
                return (
                  <div
                    key={plan._id}
                    className={`rounded-2xl p-5 sm:p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 relative ${getCardBorder(plan.badge, plan.name)} ${isCurrentPlan ? 'opacity-90' : ''}`}
                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                  >
                    {/* Current Plan Badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-md whitespace-nowrap">
                        ✅ CURRENT PLAN
                      </div>
                    )}
                    
                    {/* Popular Badge */}
                    {plan.badge === 'popular' && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md whitespace-nowrap">
                        🔥 MOST POPULAR
                      </div>
                    )}
                    
                    {/* New Badge */}
                    {plan.badge === 'new' && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md whitespace-nowrap">
                        ✨ NEW
                      </div>
                    )}
                    
                    {/* Recommended Upgrade Badge */}
                    {!isCurrentPlan && activeSubscription && isUpgrade && (
                      <div className="absolute -top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-md">
                        ⭐ RECOMMENDED
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        {plan.name}
                      </h3>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4" style={{ color: 'var(--color-primary)' }}>
                        ₹{plan.price} <span className="text-sm sm:text-base font-normal" style={{ color: 'var(--color-text-secondary)' }}>/ month</span>
                      </p>
                      {plan.description && (
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                          {plan.description}
                        </p>
                      )}
                    </div>
                    
                    <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                      {plan.features && plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          <i className="fas fa-check-circle text-green-500 text-xs sm:text-sm mt-0.5 flex-shrink-0"></i>
                          <span className="break-words">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => !isCurrentPlan && handleSubscribe(plan)}
                      disabled={isProcessing || isCurrentPlan}
                      className={`w-full py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base text-white transition-all duration-300 ${getButtonColor(plan.name)} ${(!isCurrentPlan) ? 'hover:scale-105 hover:shadow-lg' : ''} ${(isProcessing || isCurrentPlan) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isProcessing ? 'Processing...' : getButtonText(plan.name)}
                    </button>
                    
                    {isCurrentPlan && (
                      <p className="text-center text-xs mt-2 text-green-600">
                        Your subscription is active
                      </p>
                    )}
                    
                    {activeSubscription && isUpgrade && !isCurrentPlan && (
                      <p className="text-center text-xs mt-2 text-amber-600">
                        Upgrade to get more features
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        
        {/* Info Box */}
        <div className="mt-10 sm:mt-12 md:mt-16 p-4 sm:p-5 md:p-6 rounded-lg border text-center"
             style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            💡 All plans include access to AI-powered mock interviews, resume analysis, and MCQ tests.
            {activeSubscription && (
              <span className="block mt-1 text-blue-600">Need help? Contact support@interviewhub.com</span>
            )}
          </p>
        </div>

      </div>
    </div>
  );
};

// Helper function to get plan level for upgrade comparison
function getPlanLevel(planName) {
  const levels = {
    'Basic': 1,
    'Pro': 2,
    'Premium': 3
  };
  return levels[planName] || 0;
}

export default Subscription;