import { useRef, useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import type { ChatItem } from '../App';
import { SUGGESTIONS, EXAMPLE_PROMPTS } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import type { ApiModelItem, ApiConversation } from '../api/client';
import { ProjectsAPI } from '../api/client';
import ProjectChat from './ProjectChat';
import ModelSelector from './ModelSelector';
import Markdown from './Markdown';
import GlobalSearch from './GlobalSearch';
import type { SearchResult } from '../api/client';

interface HomeProps {
  message: string;
  setMessage: (msg: string) => void;
  items: ChatItem[];
  setItems: (items: ChatItem[]) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleSend: (searchMode?: boolean) => void;
  handleNewChat: () => void;
  useExample: (text: string) => void;
  models: ApiModelItem[];
  selectedModel: string | null;
  setSelectedModel: (modelId: string | null) => void;
  // conversations
  conversationId: number | null;
  conversations: ApiConversation[];
  openConversation: (id: number) => Promise<void> | void;
  deleteConversation: (id: number) => Promise<void> | void;
  renameConversation: (id: number, title: string) => Promise<void> | void;
  // message actions
  editMessage: (messageId: number, content: string) => Promise<void> | void;
  deleteMessage: (messageId: number) => Promise<void> | void;
  regenerateMessage: (messageId: number) => Promise<void> | void;
  editAndContinue: (messageId: number, content: string) => Promise<void> | void;
  // when true, allow unauthenticated viewing and redirect to login on interaction
  publicMode?: boolean;
}

export default function Home(props: HomeProps) {
  const { user, logout } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const {
    message,
    setMessage,
    items,
    sidebarOpen,
    setSidebarOpen,
    handleSend,
    handleNewChat,
    useExample,
    models,
    selectedModel,
    setSelectedModel,
    conversationId,
    conversations,
    openConversation,
    deleteConversation,
    renameConversation,
    editMessage,
    deleteMessage,
    regenerateMessage,
    editAndContinue,
    publicMode,
  } = props;
  // Modal state for search and selection
  const [projectSearch, setProjectSearch] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { projectId: routeProjectId } = useParams();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [editing, setEditing] = useState<{ id: number; value: string } | null>(null);
  const [editingActive, setEditingActive] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [showProjectChat, setShowProjectChat] = useState(false);
  // Sidebar chat menu/modal state
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  // Search mode state
  const [searchMode, setSearchMode] = useState(false);
  // Global search modal state
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  // Copy state for showing feedback
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { projects } = useProjects();

  const toggleProjectChat = () => {
    setShowProjectChat(prev => !prev);
  };

  // Handle GlobalSearch result selection
  const handleGlobalSearchResult = (result: SearchResult) => {
    if (result.type === 'conversation' && result.conversation_id) {
      openConversation(result.conversation_id);
    } else if (result.type === 'message' && result.conversation_id) {
      openConversation(result.conversation_id);
    } else if (result.type === 'web' && result.url) {
      window.open(result.url, '_blank');
    }
  };

  // Copy message content to clipboard
  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Clear after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  

// Check authentication and redirect if needed (disabled in publicMode)
  useEffect(() => {
    if (!publicMode && !user) {
      navigate('/login');
    }
  }, [user, navigate, publicMode]);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const isSmall = window.innerWidth < 768;
      setIsSmallScreen(isSmall);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Leave edit mode when switching conversations
  useEffect(() => {
    setEditing(null);
    setEditingActive(false);
  }, [conversationId]);

  // Leave edit mode whenever the message list changes (e.g., after send)
  useEffect(() => {
    setEditing(null);
    setEditingActive(false);
  }, [items.length]);

  // Leave edit mode when the main input is cleared (typically after send)
  useEffect(() => {
    if (message === '') { setEditing(null); setEditingActive(false); }
  }, [message]);

  // Close conversation menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpenId !== null) {
        // Check if the click is outside the menu and the three-dots button
        const target = event.target as HTMLElement;
        const isMenuButton = target.closest('[data-menu-button]');
        const isMenu = target.closest('[data-menu]');
        
        if (!isMenuButton && !isMenu) {
          setMenuOpenId(null);
        }
      }
    };
    
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpenId !== null) {
        setMenuOpenId(null);
      }
    };
    
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [menuOpenId]);

  // Global search keyboard shortcut
  useEffect(() => {
    const handleGlobalSearch = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setGlobalSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalSearch);
    return () => document.removeEventListener('keydown', handleGlobalSearch);
  }, []);
  

  return (
    <div>
      {routeProjectId && showProjectChat && (
        <ProjectChat 
          projectId={parseInt(routeProjectId, 10)} 
          onClose={() => setShowProjectChat(false)}
          models={models}
        />
      )}
      
      {/* Floating chat button for project pages */}
      {routeProjectId && !showProjectChat && (
        <button
          onClick={toggleProjectChat}
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg z-50"
          aria-label="Open project chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
      
      <div
        className={
          sidebarOpen && !isSmallScreen
            ? 'grid h-screen overflow-hidden grid-cols-[320px_1fr] lg:grid-cols-[320px_1fr] md:grid-cols-[300px_1fr]'
            : 'grid h-screen overflow-hidden grid-cols-[0_1fr]'
        }
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        {/* Mobile Overlay */}
        {isSmallScreen && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={
            `sidebar-transition ` +
            (sidebarOpen && !isSmallScreen
              ? 'flex flex-col h-full overflow-hidden border-r'
              : isSmallScreen && sidebarOpen
                ? 'fixed inset-y-0 left-0 z-50 flex flex-col h-full overflow-hidden border-r bg-[var(--bg-secondary)] w-[300px]'
                : 'flex flex-col h-full overflow-hidden border-r w-0 p-0 border-none')
          }
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            width: sidebarOpen && !isSmallScreen ? 'clamp(280px, 320px, 320px)' : isSmallScreen && sidebarOpen ? '300px' : 0,
            minWidth: sidebarOpen && !isSmallScreen ? 'clamp(280px, 320px, 320px)' : isSmallScreen && sidebarOpen ? '300px' : 0,
            padding: sidebarOpen ? undefined : 0,
          }}
        >
          <div className={`sidebar-content-fade ${sidebarOpen ? 'open' : 'closed'} h-full`}>
            {sidebarOpen && (
              <div className="flex flex-col p-4 h-full overflow-visible">
                {/* Logo/Brand */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    className="p-1.5 rounded-md transition-colors"
                    style={{ '--hover-bg': 'var(--bg-hover)' } as React.CSSProperties & { '--hover-bg': string }}
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                      <span className="text-white font-bold text-xs sm:text-sm">M</span>
                    </div>
                    <span className="font-bold text-sm sm:text-base truncate bg-gradient-to-r from-purple-600 via-violet-600 via-pink-600 to-blue-600 bg-clip-text text-transparent tracking-wider">
                      Meril Chat
                    </span>
                  </div>
                </div>
                {/* New Chat Button */}
                <button
                  onClick={handleNewChat}
                  className="w-full rounded-lg px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white',
                    boxShadow: 'var(--shadow-primary)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                  }}
                >
                  New Chat
                </button>
                {/* Search Input */}
                <div className="mt-4 flex items-center gap-2 rounded-lg px-2 sm:px-3 py-2" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)', border: '1px solid' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60 flex-shrink-0">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    className="w-full bg-transparent outline-none text-xs sm:text-sm"
                    style={{ color: 'var(--text-secondary)', '--placeholder-color': 'var(--text-tertiary)' } as React.CSSProperties & { '--placeholder-color': string }}
                    placeholder="Search..."
                  />
                </div>
                {/* Conversations List */}
                <div className="mt-4 flex-1 overflow-y-auto overflow-x-visible rounded-lg" style={{ border: '1px solid var(--border-secondary)' }}>
                  {conversations.length === 0 ? (
                    <div className="p-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>No conversations yet</div>
                  ) : (
                    <ul className="divide-y relative" style={{ borderColor: 'var(--border-secondary)' }}>
                      {conversations.map(c => (
                        <li
                            key={c.id}
                            className="group flex items-center gap-3 px-3 py-2.5 cursor-pointer relative rounded-xl border transition-all duration-200"
                            onClick={() => openConversation(c.id)}
                            style={{
                              zIndex: menuOpenId === c.id ? 100 : 'auto',
                              borderColor: 'var(--border-secondary)',
                              background: c.id === conversationId ? 'linear-gradient(0deg, var(--bg-hover-light), var(--bg-hover-light))' : 'transparent',
                              boxShadow: c.id === conversationId ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.background = c.id === conversationId ? 'linear-gradient(0deg, var(--bg-hover-light), var(--bg-hover-light))' : 'var(--bg-hover)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.background = c.id === conversationId ? 'linear-gradient(0deg, var(--bg-hover-light), var(--bg-hover-light))' : 'transparent';
                            }}
                          >
                          {/* Active accent bar */}
                          <span
                            className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-full opacity-0 group-hover:opacity-60 transition-opacity"
                            style={{
                              background: 'linear-gradient(180deg, var(--accent-primary), var(--accent-hover))',
                              opacity: c.id === conversationId ? 1 : undefined
                            }}
                          />
                          {/* Icon */}
                          <div
                            className="flex-shrink-0 grid place-items-center rounded-md h-7 w-7"
                            style={{ backgroundColor: 'var(--bg-quaternary)', border: '1px solid var(--border-secondary)', color: 'var(--text-secondary)' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M8 12h.01M12 12h.01M16 12h.01" />
                              <path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                              {c.title || `Chat #${c.id}`}
                            </div>
                            <div className="text-[10px] opacity-70 truncate" style={{ color: 'var(--text-tertiary)' }}>
                              {c.model_id || ''}
                            </div>
                          </div>
                          {/* Three dots icon, only visible on hover */}
                          <button
                            type="button"
                            className="absolute top-2 right-2 p-1 rounded transition-all opacity-0 group-hover:opacity-100"
                            style={{
                              color: 'var(--text-tertiary)',
                              zIndex: 100
                            }}
                            title="Options"
                            data-menu-button
                            onMouseDown={e => e.stopPropagation()}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                              e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--text-tertiary)';
                            }}
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === c.id ? null : c.id);
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                          </button>
                          {/* Menu: only visible when menuOpenId === c.id */}
                          {menuOpenId === c.id && (
                            <div 
                              className="absolute bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg shadow-lg py-1 min-w-[140px]" 
                              style={{ 
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                                zIndex: 9999,
                                top: '100%',
                                right: '8px',
                                marginTop: '4px'
                              }}
                              data-menu
                              onClick={e => e.stopPropagation()}
                              onMouseDown={e => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 rounded-t-lg"
                                style={{ color: 'var(--text-primary)' }}
                                onMouseDown={e => e.stopPropagation()}
                                onMouseEnter={e => {
                                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const title = window.prompt('Rename conversation', c.title || `Chat #${c.id}`);
                                  if (title !== null) renameConversation(c.id, title);
                                  setMenuOpenId(null);
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Rename
                              </button>
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2"
                                style={{ color: '#ef4444' }}
                                onMouseDown={e => e.stopPropagation()}
                                onMouseEnter={e => {
                                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (confirm('Delete this conversation?')) deleteConversation(c.id);
                                  setMenuOpenId(null);
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 rounded-b-lg"
                                style={{ color: 'var(--text-primary)' }}
                                onMouseDown={e => e.stopPropagation()}
                                onMouseEnter={e => {
                                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedConvId(c.id);
                                  setShowProjectModal(true);
                                  setMenuOpenId(null);
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                Add to Project
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                      {/* Modal for project selection */}
                      {showProjectModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                          <div className="bg-[var(--bg-primary)] rounded-lg shadow-xl w-full max-w-md p-0">
                            <div className="px-8 pt-8 pb-4">
                              <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-bold">Move chat</h2>
                                <button className="text-2xl font-bold opacity-60 hover:opacity-100" onClick={() => setShowProjectModal(false)}>&times;</button>
                              </div>
                              <div className="text-sm mb-4 opacity-80">Select a project to move this chat into.</div>
                              <input
                                type="text"
                                className="w-full mb-4 p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-secondary)] text-sm"
                                placeholder="Search or create a project"
                                value={projectSearch || ''}
                                onChange={e => setProjectSearch(e.target.value)}
                              />
                              <div className="max-h-64 overflow-y-auto rounded bg-[var(--bg-secondary)] border border-[var(--border-secondary)]">
                                {projects
                                  .filter((p: any) => !projectSearch || p.name.toLowerCase().includes(projectSearch.toLowerCase()))
                                  .map((p: any) => (
                                    <div
                                      key={p.id}
                                      className={`flex items-center px-4 py-3 cursor-pointer hover:bg-[var(--bg-hover)] ${selectedProjectId === p.id ? 'bg-[var(--bg-hover)]' : ''}`}
                                      onClick={() => setSelectedProjectId(p.id)}
                                    >
                                      <span className="mr-2">📁</span>
                                      <span className="font-medium">{p.name}</span>
                                    </div>
                                  ))}
                                {projects.filter((p: any) => !projectSearch || p.name.toLowerCase().includes(projectSearch.toLowerCase())).length === 0 && (
                                  <div className="px-4 py-3 text-sm opacity-60">No projects found.</div>
                                )}
                              </div>
                              <div className="flex gap-2 justify-end mt-6">
                                <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowProjectModal(false)}>Cancel</button>
                                <button
                                  className="px-4 py-2 rounded bg-blue-600 text-white"
                                  disabled={!selectedProjectId}
                                  onClick={async () => {
                                    try {
                                      if (!selectedConvId || !selectedProjectId) {
                                        throw new Error('No conversation or project selected');
                                      }
                                      
                                      const result = await ProjectsAPI.addConversations(
                                        selectedProjectId,
                                        [selectedConvId]
                                      );
                                      
                                      // Show success message
                                      const message = (result && result.message) ? result.message : 'Chat added to project successfully!';
                                      setSuccessMessage(message);
                                      setTimeout(() => setSuccessMessage(null), 3000); // Hide after 3 seconds
                                      
                                      setShowProjectModal(false);
                                      setSelectedProjectId(null);
                                      setSelectedConvId(null);
                                      setProjectSearch('');
                                      
                                      // Trigger a refresh of conversations list if user is currently viewing projects
                                      // This helps ensure the added conversation shows up in the project view
                                      window.dispatchEvent(new CustomEvent('conversationAddedToProject', {
                                        detail: { conversationId: selectedConvId, projectId: selectedProjectId }
                                      }));
                                    } catch (error: any) {
                                      console.error('Failed to add chat to project:', error);
                                      const errorMessage = error.message || 'Failed to add chat to project. Please try again.';
                                      setSuccessMessage(`Error: ${errorMessage}`);
                                      setTimeout(() => setSuccessMessage(null), 4000); // Hide after 4 seconds for errors
                                    }
                                  }}
                                >Add</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </ul>
                  )}
                </div>
{/* Login/User Button at bottom */}
                {!user ? (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center gap-2 text-[var(--text-secondary)] px-2 sm:px-4 py-2 mb-0 font-medium text-sm sm:text-base hover:bg-[var(--bg-hover)] rounded-md transition-colors"
                    >
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="flex-shrink-0"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                      <span className="hidden sm:inline">Login</span>
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="flex items-center gap-2 text-[var(--text-secondary)] px-2 sm:px-4 py-2 mb-0 font-medium text-sm sm:text-base hover:bg-[var(--bg-hover)] rounded-md transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                      <span className="hidden sm:inline">Sign up</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] px-2 sm:px-4 py-2 font-medium text-sm sm:text-base">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span className="hidden sm:inline truncate">{user.email}</span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await logout();
                          navigate('/login');
                        } catch (error) {
                          console.error('Logout failed:', error);
                          // Force logout even if API call fails
                          navigate('/login');
                        }
                      }}
                      className="flex items-center gap-2 text-[var(--text-secondary)] px-2 sm:px-4 py-2 font-medium text-sm sm:text-base hover:bg-[var(--bg-hover)] rounded-md transition-colors"
                    >
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="flex-shrink-0">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
        {/* Sidebar Toggle Button (when closed) - Desktop only */}
        {!sidebarOpen && !isSmallScreen && (
          <button
            className="absolute top-4 left-4 z-50 p-2 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow hover:bg-[var(--bg-hover)] transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path></svg>
          </button>
        )}
        {/* Main Content */}
        <main className="grid grid-rows-[56px_1fr_auto] h-full overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between px-4 sm:px-6 relative" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="flex items-center min-w-0">
              {/* Mobile Menu Button - only when sidebar closed */}
              {isSmallScreen && !sidebarOpen && (
                <button
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)] mr-3 flex-shrink-0"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path></svg>
                </button>
              )}
              
              {/* Meril Chat Branding - Only show when sidebar is closed with proper spacing */}
              {!sidebarOpen && (
                <div 
                  className={`cursor-pointer hover:scale-105 transition-all duration-200 min-w-0 ${
                    !isSmallScreen ? 'ml-16' : '' // Add left margin on desktop to avoid collision with sidebar toggle
                  }`} 
                  onClick={() => handleNewChat()} 
                  title="Start New Chat"
                >
                  <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-purple-600 via-violet-600 via-pink-600 to-blue-600 bg-clip-text text-transparent tracking-wider hidden sm:inline truncate">
                    Meril Chat
                  </span>
                  {/* Show abbreviated version on small screens */}
                  <span className="font-bold text-sm bg-gradient-to-r from-purple-600 via-violet-600 via-pink-600 to-blue-600 bg-clip-text text-transparent tracking-wide sm:hidden truncate">
                    Meril
                  </span>
                </div>
              )}
            </div>
            
            {/* Center - Could add breadcrumbs or status here */}
            <div className="flex items-center">
              {/* This space can be used for breadcrumbs, conversation title, etc. */}
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={() => navigate('/settings')}
                className="p-1.5 sm:p-2 rounded-lg transition-colors" 
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title="Settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-[18px] sm:h-[18px]">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <ThemeToggle />
            </div>
          </header>
          {/* Chat Area */}
          <section className="flex justify-center px-4 sm:px-6 pt-8 sm:pt-14 overflow-y-auto">
            <div className="relative w-full max-w-[1280px] rounded-[16px] sm:rounded-[22px]" style={{
              border: '1px solid var(--border-secondary)',
              backgroundColor: theme === 'dark' ? 'rgba(26, 21, 32, 0.4)' : 'rgba(248, 249, 250, 0.8)',
              boxShadow: 'var(--shadow-secondary)'
            }}>
              <div className="pointer-events-none absolute inset-0 rounded-[16px] sm:rounded-[22px] bg-[radial-gradient(1200px_400px_at_50%_-200px,rgba(255,255,255,0.05),rgba(0,0,0,0))]" />
              <div className="relative flex w-full flex-col gap-4 sm:gap-6 px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 sm:gap-6">
                    <h1 className="m-0 text-2xl sm:text-3xl lg:text-[44px] font-extrabold text-center leading-tight px-2">
                      How can I help you?
                    </h1>
                    <div className="flex flex-wrap justify-center gap-2">
{SUGGESTIONS.map((s) => (
                        <button
                          key={s.label}
                          className="inline-flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm transition-colors"
                          style={{
                            border: '1px solid var(--border-primary)',
                            backgroundColor: 'var(--bg-quaternary)',
                            color: 'var(--text-primary)'
                          }}
                          onClick={() => { if (!user && publicMode) { navigate('/login'); } else { useExample(s.label); } }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover-light)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-quaternary)';
                          }}
                        >
                          <span>{s.icon}</span>
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <ul className="mt-4 sm:mt-6 w-full max-w-[720px] list-none p-0" style={{ borderTop: '1px solid var(--border-tertiary)' }}>
                      {EXAMPLE_PROMPTS.map((prompt, idx) => (
                        <li
                          key={idx}
                          className="py-2.5 sm:py-3.5 cursor-pointer transition-colors text-sm sm:text-[15px] px-2 sm:px-0"
                          style={{
                            color: 'var(--text-quaternary)',
                            borderBottom: idx < EXAMPLE_PROMPTS.length - 1 ? '1px solid var(--border-tertiary)' : 'none'
                          }}
onClick={() => { if (!user && publicMode) { navigate('/login'); } else { useExample(prompt); } }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--text-quaternary)';
                          }}
                        >
                          {prompt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {items.map((it) => (
                        <div key={it.id} className={`group relative max-w-[85%] flex ${it.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="relative">
                        <div
                          className={`rounded-2xl px-4 py-3 text-[15px]`}
                          style={{
                            backgroundColor: it.role === 'user' 
                              ? theme === 'dark' ? 'var(--bg-quaternary)' : '#fee2e2'
                              : theme === 'dark' ? 'var(--bg-tertiary)' : '#dbeafe',
                            border: `1px solid ${it.role === 'user' 
                              ? theme === 'dark' ? 'var(--border-secondary)' : '#fecaca'
                              : theme === 'dark' ? 'var(--border-secondary)' : '#bfdbfe'}`,
                            color: 'var(--text-primary)'
                          }}
                        >
                          {editingActive && !justSent && editing && typeof it.apiId === 'number' && editing.id === it.apiId && it.role === 'user' ? (
                            <div>
                              <textarea
                                value={editing?.value ?? ''}
                                onChange={(e) => setEditing(prev => (prev ? { id: prev.id, value: e.target.value } : prev))}
                                onKeyDown={async (e) => {
                                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                    e.preventDefault();
                                    if (it.apiId) {
                                      await editAndContinue(it.apiId, editing?.value ?? it.content);
                                      setEditing(null);
                                      setEditingActive(false);
                                    }
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setEditing(null);
                                    setEditingActive(false);
                                  }
                                }}
                                rows={3}
                                className="w-full bg-transparent outline-none resize-vertical"
                                style={{ color: 'inherit' }}
                                placeholder="Edit message..."
                              />
                              <div className={`mt-2 flex gap-2 ${it.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <button
                                  className="px-2 py-1 rounded text-xs"
                                  style={{ border: '1px solid var(--border-secondary)', background: 'var(--bg-quaternary)', color: 'var(--text-primary)' }}
                                  onClick={async () => {
                                    if (it.apiId) {
                                      await editAndContinue(it.apiId, editing?.value ?? it.content);
                                      setEditing(null);
                                      setEditingActive(false);
                                    }
                                  }}
                                >
                                  Save (Ctrl/Cmd+Enter)
                                </button>
                                <button
                                  className="px-2 py-1 rounded text-xs"
                                  style={{ border: '1px solid var(--border-secondary)', background: 'var(--bg-quaternary)', color: 'var(--text-primary)' }}
                                  onClick={() => { setEditing(null); setEditingActive(false); }}
                                >
                                  Cancel (Esc)
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Markdown>{it.content}</Markdown>
                              
                              {/* Search Results Display */}
                              {it.isSearchResult && it.searchResults && (
                                <div className="mt-4 space-y-3">
                                  {it.searchResults.map((result, idx) => (
                                    <div 
                                      key={`${result.id}-${idx}`} 
                                      className="p-3 rounded-lg border cursor-pointer transition-colors"
                                      style={{
                                        backgroundColor: 'var(--bg-tertiary)',
                                        borderColor: 'var(--border-secondary)'
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                      }}
                                      onClick={() => {
                                        if (result.type === 'conversation' && result.conversation_id) {
                                          openConversation(result.conversation_id);
                                        } else if (result.type === 'message' && result.conversation_id) {
                                          openConversation(result.conversation_id);
                                        } else if (result.type === 'web' && result.url) {
                                          window.open(result.url, '_blank');
                                        }
                                      }}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                          {result.type === 'conversation' ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                          ) : result.type === 'message' ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 4z" />
                                            </svg>
                                          ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                              <circle cx="12" cy="12" r="10" />
                                              <line x1="2" y1="12" x2="22" y2="12" />
                                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                            </svg>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                              {result.title}
                                            </h4>
                                            <span className="px-2 py-0.5 rounded-full text-xs flex-shrink-0" style={{
                                              backgroundColor: result.type === 'web' ? 'rgba(59, 130, 246, 0.1)' : 
                                                             result.type === 'conversation' ? 'rgba(16, 185, 129, 0.1)' : 
                                                             'rgba(245, 158, 11, 0.1)',
                                              color: result.type === 'web' ? '#3b82f6' : 
                                                     result.type === 'conversation' ? '#10b981' : 
                                                     '#f59e0b'
                                            }}>
                                              {result.type}
                                            </span>
                                          </div>
                                          <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                                            {result.snippet}
                                          </p>
                                          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                            <span>
                                              {result.url ? (
                                                new URL(result.url).hostname
                                              ) : result.created_at ? (
                                                new Date(result.created_at).toLocaleDateString(undefined, {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric'
                                                })
                                              ) : ''}
                                            </span>
                                            <span>Click to open</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {it.webSearchUsed && (
                                <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                  </svg>
                                  <span>Enhanced with web search{it.searchQuery ? `: "${it.searchQuery}"` : ''}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {it.apiId && it.role === 'user' && !justSent && (
                          <button
                            type="button"
                            tabIndex={-1}
                            onMouseDown={(e) => e.preventDefault()}
                            className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                            style={{ color: 'var(--text-tertiary)' }}
                            title="Edit & Continue"
                            onClick={() => { setEditing({ id: it.apiId!, value: it.content }); setEditingActive(true); }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                          </button>
                        )}
                        {it.role === 'assistant' && !justSent && (
                          <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            {/* Copy Button */}
                            <button
                              type="button"
                              tabIndex={-1}
                              onMouseDown={(e) => e.preventDefault()}
                              className="p-1 rounded transition-colors"
                              style={{ 
                                color: copiedMessageId === it.id ? '#22c55e' : 'var(--text-tertiary)',
                                backgroundColor: copiedMessageId === it.id ? '#22c55e20' : 'transparent'
                              }}
                              title={copiedMessageId === it.id ? 'Copied!' : 'Copy message'}
                              onClick={() => handleCopyMessage(it.content, it.id)}
                              onMouseEnter={e => {
                                if (copiedMessageId !== it.id) {
                                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                  e.currentTarget.style.color = 'var(--text-primary)';
                                }
                              }}
                              onMouseLeave={e => {
                                if (copiedMessageId !== it.id) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = 'var(--text-tertiary)';
                                }
                              }}
                            >
                              {copiedMessageId === it.id ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 6L9 17l-5-5"/>
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                                </svg>
                              )}
                            </button>
                            {/* Regenerate Button */}
                            {it.apiId && (
                              <button
                                type="button"
                                tabIndex={-1}
                                onMouseDown={(e) => e.preventDefault()}
                                className="p-1 rounded transition-colors"
                                style={{ color: 'var(--text-tertiary)' }}
                                title="Regenerate"
                                onClick={() => regenerateMessage(it.apiId!)}
                                onMouseEnter={e => {
                                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                  e.currentTarget.style.color = 'var(--text-primary)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = 'var(--text-tertiary)';
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 12a9 9 0 1 1-3-6.7"/>
                                  <polyline points="21 3 21 9 15 9"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>
            </div>
          </section>
          {/* Footer / Input Area */}
          <footer className="px-4 sm:px-6 pb-4 sm:pb-7">
            <div className="mb-4 flex justify-center">
              {/* Terms banner commented out */}
            </div>
            <div className="mx-auto w-full max-w-[1280px]">
              <div className="relative flex flex-col rounded-xl sm:rounded-2xl p-2 sm:p-3" style={{
                border: `1px solid ${searchMode ? 'var(--accent-primary)' : 'var(--border-secondary)'}`,
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: searchMode ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'var(--shadow-tertiary)'
              }}>
                {/* Search Mode Indicator */}
                {searchMode && (
                  <div className="flex items-center gap-2 mb-2 px-2 py-1 rounded-md" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <span className="text-xs font-medium">Search Mode Active - Press Enter to search</span>
                    <button 
                      onClick={() => setSearchMode(false)}
                      className="ml-auto p-1 rounded hover:bg-[rgba(59, 130, 246, 0.2)] transition-colors"
                      title="Exit search mode"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
<form
                  onSubmit={(e) => { e.preventDefault(); (document.activeElement as HTMLElement | null)?.blur?.(); setEditing(null); setEditingActive(false); setJustSent(true); setTimeout(() => setJustSent(false), 600); if (!user && publicMode) { navigate('/login'); return; } handleSend(searchMode); }}
                  className="flex flex-col"
                >
                  <input
                    className="flex flex-1 bg-transparent px-2 sm:px-3 pt-2.5 pb-16 sm:pb-20 outline-none text-sm sm:text-[15px]"
                    style={{ color: 'var(--text-primary)', '--placeholder-color': 'var(--text-tertiary)' } as React.CSSProperties & { '--placeholder-color': string }}
                    placeholder={searchMode ? "Search conversations and web..." : "Type your message here..."}
value={message}
                    onChange={e => { if (!user && publicMode) { navigate('/login'); return; } if (editing) { setEditing(null); setEditingActive(false); } setMessage(e.target.value) }}
                    onKeyDown={(e) => {
                      if (!user && publicMode) { e.preventDefault(); navigate('/login'); return; }
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        setEditing(null);
                        setEditingActive(false);
                        setJustSent(true);
                        setTimeout(() => setJustSent(false), 600);
                        handleSend(searchMode);
                      }
                    }}
                  />
                  <div className='flex items-center justify-between flex-wrap gap-2'>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      {/* Model Selector Dropdown (paginated) */}
                      <ModelSelector
                        selectedModelId={selectedModel ?? undefined}
                        onModelChange={(id) => setSelectedModel(id)}
                      />
                      <button 
                        type="button" 
                        onClick={() => setSearchMode(!searchMode)}
                        className="flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors" 
                        style={{
                          border: `1px solid ${searchMode ? 'var(--accent-primary)' : 'var(--border-secondary)'}`,
                          backgroundColor: searchMode ? 'var(--accent-primary)' : 'var(--bg-quaternary)',
                          color: searchMode ? 'white' : 'var(--text-primary)'
                        }}
                        title={searchMode ? 'Search Mode Active - Click to disable' : 'Enable Search Mode'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                        <span className="hidden sm:inline">{searchMode ? 'Search On' : 'Search'}</span>
                      </button>
                      <button type="button" className="p-1.5 sm:p-2 rounded-lg transition-colors" style={{ '--hover-bg': 'var(--bg-hover-light)' } as React.CSSProperties & { '--hover-bg': string }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5">
                          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                      </button>
                      <button type="button"
                        className="p-1.5 sm:p-2 rounded-lg transition-colors"
                        style={{ '--hover-bg': 'var(--bg-hover-light)' } as React.CSSProperties & { '--hover-bg': string }}
                        onClick={() => navigate('/projectsPage')}
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="sm:w-5 sm:h-5">
                          <path d="M15.8198 7C16.6885 7.00025 17.3624 7.73158 17.3178 8.57617L17.2993 8.74707L16.1332 15.7471C16.0126 16.4699 15.3865 16.9996 14.6538 17H5.34711C4.6142 16.9998 3.98833 16.47 3.86762 15.7471L2.7016 8.74707C2.54922 7.83277 3.25418 7 4.18109 7H15.8198ZM4.18109 8C3.87216 8 3.63722 8.27731 3.68793 8.58203L4.85394 15.582C4.89413 15.8229 5.10291 15.9998 5.34711 16H14.6538C14.8978 15.9996 15.1068 15.8228 15.1469 15.582L16.3129 8.58203L16.3188 8.46973C16.3036 8.21259 16.0899 8.00023 15.8198 8H4.18109Z"></path>
                          <path className="group-hover:-translate-y-[1.4px] group-hover:translate-x-[0.5px] group-hover:rotate-3 transition group-active:translate-y-0" d="M16.0004 5.5C16.0004 5.224 15.7764 5.00024 15.5004 5H4.50043C4.22428 5 4.00043 5.22386 4.00043 5.5C4.00043 5.77614 4.22428 6 4.50043 6H15.5004C15.7764 5.99976 16.0004 5.776 16.0004 5.5Z"></path>
                          <path className="group-hover:-translate-y-[2.8px] group-hover:translate-x-px group-hover:rotate-6 transition group-active:translate-y-0" d="M14.5004 3.5C14.5004 3.224 14.2764 3.00024 14.0004 3H6.00043C5.72428 3 5.50043 3.22386 5.50043 3.5C5.50043 3.77614 5.72428 4 6.00043 4H14.0004C14.2764 3.99976 14.5004 3.776 14.5004 3.5Z"></path>
                        </svg>
                      </button>
                    </div>
                    <button type="submit"
                      className="grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-lg sm:rounded-xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                      disabled={!message.trim()}
                      onMouseEnter={e => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                        }
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-[18px] sm:h-[18px]">
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </footer>
        </main>
      </div>
      
      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        onSelectResult={handleGlobalSearchResult}
      />
      
      {/* Copy Success Toast */}
      {copiedMessageId && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg border transition-all duration-300 transform"
             style={{
               backgroundColor: 'var(--bg-secondary)',
               borderColor: '#22c55e',
               color: 'var(--text-primary)'
             }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span className="text-sm font-medium">Message copied to clipboard!</span>
        </div>
      )}
      
      {/* Success/Error Message Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg border transition-all duration-300 transform"
             style={{
               backgroundColor: 'var(--bg-secondary)',
               borderColor: successMessage.startsWith('Error:') ? '#ef4444' : '#22c55e',
               color: 'var(--text-primary)'
             }}>
          {successMessage.startsWith('Error:') ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          )}
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}
    </div>
  );
}
