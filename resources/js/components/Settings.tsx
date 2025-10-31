import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, resetPassword, error } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (formError) setFormError(null);
    if (success) setSuccess(null);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    
    // Validate form
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setFormError('All fields are required');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setFormError('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setFormError('New password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(formData.currentPassword, formData.newPassword, formData.confirmPassword);
      setSuccess('Password reset successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      // Error is handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        // Force navigation even if logout fails
        navigate('/login');
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-sm transition-colors px-3 py-1.5 rounded-md"
            style={{ 
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-quaternary)',
              border: '1px solid var(--border-secondary)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-quaternary)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 text-[var(--text-secondary)] px-2 py-1 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="hidden md:inline truncate max-w-[120px]">{user.email}</span>
            </div>
          )}
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div 
            className="rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(26, 21, 32, 0.8)' : 'rgba(248, 249, 250, 0.95)',
              border: '1px solid var(--border-secondary)',
            }}
          >
            {/* User Info Section */}
            {user && (
              <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h2 className="text-lg font-semibold mb-2">Account Information</h2>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                </div>
              </div>
            )}

            {/* Password Reset Form */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg px-3 py-2.5 bg-transparent border outline-none text-sm"
                    style={{ 
                      color: 'var(--text-primary)', 
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)'
                    }}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg px-3 py-2.5 bg-transparent border outline-none text-sm"
                    style={{ 
                      color: 'var(--text-primary)', 
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)'
                    }}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-lg px-3 py-2.5 bg-transparent border outline-none text-sm"
                    style={{ 
                      color: 'var(--text-primary)', 
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)'
                    }}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                {/* Error Messages */}
                {(formError || error) && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {formError || error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg font-medium transition-colors text-white"
                  style={{ 
                    backgroundColor: loading ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                    }
                  }}
                >
                  {loading ? 'Updating...' : 'Reset Password'}
                </button>
              </form>
            </div>

            {/* Logout Section */}
            <div className="border-t pt-6" style={{ borderColor: 'var(--border-secondary)' }}>
              <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;