import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, deleteProject, setCurrentProject } = useProjects();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Activity');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'Activity') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Updated just now';
    if (diffInMinutes < 60) return `Updated ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Updated ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Updated ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    setOpenMenuId(null);
  };

  const handleProjectClick = (project: any) => {
    setCurrentProject(project);
    navigate(`/CreateProject/${project.id}`);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
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
            title="Go to main chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Projects</h1>
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
          <button
            className="px-4 py-2 rounded-lg font-medium shadow transition-colors text-sm sm:text-base"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
            }}
            onClick={() => navigate('/NewProjectCreate')}
          >
            + New project
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8">
        <div className="w-full max-w-3xl mt-4 sm:mt-8">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm sm:text-base outline-none"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">Sort by</span>
            <select 
              className="px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-sm sm:text-base outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Activity</option>
              <option>Name</option>
            </select>
          </div>
        </div>

        {sortedProjects.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {sortedProjects.map((project) => (
              <div
                key={project.id}
                className="relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-3 sm:p-4 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                onClick={() => handleProjectClick(project)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium mb-1 truncate">{project.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {getTimeAgo(project.updatedAt)}
                    </p>
                  </div>
                  
                  <div className="relative flex-shrink-0">
                    <button
                      className="p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === project.id ? null : project.id);
                      }}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    {openMenuId === project.id && (
                      <div className="absolute right-0 top-8 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg shadow-lg py-1 z-10 min-w-[120px] sm:min-w-[140px]">
                        <button
                          className="w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Star
                        </button>
                        <button
                          className="w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit details
                        </button>
                        <button
                          className="w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2 text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-16 sm:mt-32 px-4">
            <div className="mb-6">
              <svg width="48" height="48" fill="none" viewBox="0 0 64 64" className="sm:w-16 sm:h-16">
                <rect x="8" y="24" width="48" height="32" rx="4" fill="#222" stroke="#444" strokeWidth="2" />
                <rect x="20" y="12" width="24" height="12" rx="2" fill="#333" stroke="#444" strokeWidth="2" />
                <rect x="28" y="36" width="8" height="8" rx="1" fill="#444" />
              </svg>
            </div>
            <div className="text-base sm:text-lg font-medium mb-2 text-center">
              {searchTerm ? 'No projects found' : 'Looking to start a project?'}
            </div>
            <div className="text-sm sm:text-base text-[var(--text-secondary)] mb-4 text-center max-w-md">
              {searchTerm 
                ? 'Try adjusting your search terms or create a new project.'
                : 'Upload materials, set custom instructions, and organize conversations in one space.'
              }
            </div>
            <button
              className="px-4 py-2 rounded-lg bg-white text-black font-medium shadow hover:bg-gray-100 transition-colors text-sm sm:text-base"
              onClick={() => navigate('/NewProjectCreate')}
            >
              + New project
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
