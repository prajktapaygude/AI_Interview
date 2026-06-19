import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import BASE_URL from '../config';

const PlanManagement = () => {
  const { isDarkMode } = useTheme();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Basic',
    price: '',
    features: '',
    description: '',
    badge: 'none',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  // UPDATED: Use public endpoint instead of admin/all
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching plans from public endpoint...');
      
      // CHANGE THIS LINE - Use public endpoint
      const res = await axios.get(`${BASE_URL}/api/plans/public/all`);
      
      if (res.data.success) {
        setPlans(res.data.plans);
        console.log('Plans fetched:', res.data.plans.length);
      } else {
        setError('Failed to fetch plans');
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Using public endpoint...');
        // Try fallback to public endpoint if needed
        try {
          const fallbackRes = await axios.get(`${BASE_URL}/api/plans`);
          if (fallbackRes.data.success) {
            setPlans(fallbackRes.data.plans);
            setError(null);
          }
        } catch (fallbackErr) {
          setError('Failed to fetch plans: ' + (err.response?.data?.error || err.message));
        }
      } else {
        setError('Failed to fetch plans: ' + (err.response?.data?.error || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
      
      const planData = {
        name: formData.name,
        price: parseInt(formData.price),
        features: featuresArray,
        description: formData.description || '',
        badge: formData.badge,
        isActive: formData.isActive,
        sortOrder: parseInt(formData.sortOrder) || 0
      };

      if (editingPlan) {
        await axios.put(`${BASE_URL}/api/plans/${editingPlan._id}`, planData);
        alert('Plan updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/plans`, planData);
        alert('Plan created successfully');
      }

      setShowModal(false);
      setEditingPlan(null);
      resetForm();
      fetchPlans();
    } catch (err) {
      console.error('Failed to save plan:', err);
      alert('Failed to save plan: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      await axios.delete(`${BASE_URL}/api/plans/${id}`);
      alert('Plan deleted successfully');
      fetchPlans();
    } catch (err) {
      console.error('Failed to delete plan:', err);
      alert('Failed to delete plan: ' + (err.response?.data?.error || err.message));
    }
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      features: plan.features.join(', '),
      description: plan.description || '',
      badge: plan.badge || 'none',
      isActive: plan.isActive,
      sortOrder: plan.sortOrder || 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: 'Basic',
      price: '',
      features: '',
      description: '',
      badge: 'none',
      isActive: true,
      sortOrder: 0
    });
  };

  const getBadgeDisplay = (badge) => {
    if (badge === 'popular') return { text: '🔥 Popular', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    if (badge === 'new') return { text: '✨ New', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
    return { text: '', color: '' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
          <button
            onClick={fetchPlans}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Subscription Plan Management
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Create and manage subscription plans
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingPlan(null);
                setShowModal(true);
              }}
              className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 shadow-md flex items-center gap-2"
              style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Plan
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Plans</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{plans.length}</p>
          </div>
          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Active Plans</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{plans.filter(p => p.isActive).length}</p>
          </div>
          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Inactive Plans</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{plans.filter(p => !p.isActive).length}</p>
          </div>
          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Features</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{plans.reduce((sum, p) => sum + p.features.length, 0)}</p>
          </div>
        </div>

        {/* Plans Table */}
        <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Plan Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Features</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Badge</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Sort</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => {
                  const badgeDisplay = getBadgeDisplay(plan.badge);
                  return (
                    <tr key={plan._id} className="border-b transition-all hover:bg-primary/5" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-4 py-3">
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{plan.name}</span>
                       </td>
                      <td className="px-4 py-3">
                        <span className="font-bold" style={{ color: 'var(--color-primary)' }}>₹{plan.price}</span>
                       </td>
                      <td className="px-4 py-3">
                        <ul className="text-sm space-y-1">
                          {plan.features.slice(0, 2).map((f, i) => (
                            <li key={i} className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-xs truncate max-w-[150px]">{f}</span>
                            </li>
                          ))}
                          {plan.features.length > 2 && (
                            <li className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>+{plan.features.length - 2} more</li>
                          )}
                        </ul>
                       </td>
                      <td className="px-4 py-3">
                        {plan.badge !== 'none' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeDisplay.color}`}>
                            {badgeDisplay.text}
                          </span>
                        )}
                        {plan.badge === 'none' && <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>—</span>}
                       </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plan.isActive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                       </td>
                      <td className="px-4 py-3 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>{plan.sortOrder}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(plan)}
                            className="p-2 rounded-lg transition-all hover:scale-110"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(plan._id)}
                            className="p-2 rounded-lg transition-all hover:scale-110"
                            style={{ color: 'var(--color-error)' }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                       </td>
                     </tr>
                  );
                })}
                {plans.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="text-4xl mb-2">📦</div>
                      <p style={{ color: 'var(--color-text-secondary)' }}>No plans found. Click "Add New Plan" to create your first subscription plan.</p>
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: `${'var(--color-primary)'}08`, borderColor: `${'var(--color-primary)'}20` }}>
          <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <span className="text-xl">📌</span> How it works:
          </h3>
          <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
            <li>• Admin adds plans with custom features, prices, and badges</li>
            <li>• Only "Active" plans appear on the user subscription page</li>
            <li>• Sort order determines the display order on user page</li>
            <li>• "Popular" and "New" badges help highlight specific plans</li>
            <li>• Features are displayed as bullet points on user page</li>
          </ul>
        </div>
      </div>

      {/* Modal for Add/Edit Plan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <div className="sticky top-0 p-4 border-b" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Plan Name *</label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  required
                >
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  required
                  min="0"
                  placeholder="e.g., 99, 299, 499"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Features * (comma separated)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  rows="4"
                  placeholder="Mock Tests (5/month), Resume Analyzer, AI Interview Practice"
                  required
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Separate each feature with a comma</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Description (optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder="Perfect for beginners"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Badge</label>
                <select
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  <option value="none">None</option>
                  <option value="popular">🔥 Popular (shows as "Most Popular")</option>
                  <option value="new">✨ New (shows as "New")</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Status</label>
                <select
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                >
                  <option value="true">Active (Visible to users)</option>
                  <option value="false">Inactive (Hidden from users)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  min="0"
                  placeholder="0, 1, 2..."
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>Lower numbers appear first on user page</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
                  style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPlan(null);
                  }}
                  className="flex-1 py-2 rounded-lg font-semibold transition-all duration-300 border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;