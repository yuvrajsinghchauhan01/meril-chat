import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';

const NewProjectCreate: React.FC = () => {
  const { theme } = useTheme();
  const { addProject } = useProjects();
  const { user, logout } = useAuth();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const navigate = useNavigate();

  const handleCreateProject = () => {
    if (name.trim()) {
      addProject(name.trim(), desc.trim());
      // Navigate to the project workspace after creating
      navigate('/CreateProject');
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
            onClick={() => navigate('/projectsPage')} 
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
            <span className="hidden sm:inline">All projects</span>
            <span className="sm:hidden">Back</span>
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-sm transition-colors px-3 py-1.5 rounded-md"
            style={{ 
              color: 'var(--text-secondary)',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-secondary)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Go to main chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] px-2 py-1 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="hidden md:inline truncate max-w-[120px]">{user.email}</span>
              </div>
              <button
                onClick={async () => {
                  try {
                    await logout();
                    navigate('/login');
                  } catch (error) {
                    console.error('Logout failed:', error);
                    navigate('/login');
                  }
                }}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title="Logout"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-xl sm:rounded-2xl shadow-lg"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(26, 21, 32, 0.8)' : 'rgba(248, 249, 250, 0.95)',
          border: '1px solid var(--border-secondary)',
        }}
      >
        <div className="px-6 sm:px-10 pt-8 sm:pt-12 pb-6 sm:pb-10 flex flex-col gap-6 sm:gap-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center mb-2">Create a personal project</h1>
          <div className="rounded-xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            <div className="font-semibold mb-2">How to use projects</div>
            <div>Projects help organize your work and leverage knowledge across multiple conversations. Upload docs, code, and files to create themed collections that Claude can reference again and again.</div>
            <div className="mt-2">Start by creating a memorable title and description to organize your project. You can always edit it later.</div>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium">What are you working on?</label>
              <input
                className="w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent border border-[var(--border-primary)] outline-none text-sm sm:text-base"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)' }}
                placeholder="Name your project"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium">What are you trying to achieve?</label>
              <textarea
                className="w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent border border-[var(--border-primary)] outline-none text-sm sm:text-base resize-none"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)' }}
                placeholder="Describe your project, goals, subject, etc..."
                rows={3}
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-2">
            <button
              className="px-4 sm:px-5 py-2 rounded-lg font-medium border border-[var(--border-primary)] text-[var(--text-secondary)] bg-transparent hover:bg-[var(--bg-hover)] transition-colors text-sm sm:text-base order-2 sm:order-1"
              type="button"
              onClick={() => navigate('/projectsPage')}
            >
              Cancel
            </button>
            <button
              className="px-4 sm:px-5 py-2 rounded-lg font-medium bg-white text-black shadow hover:bg-gray-100 transition-colors text-sm sm:text-base order-1 sm:order-2"
              style={theme === 'dark' ? { backgroundColor: '#e6e3ea', color: '#1b1723' } : {}}
              type="button"
              disabled={!name.trim()}
              onClick={handleCreateProject}
            >
              Create project
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default NewProjectCreate;
