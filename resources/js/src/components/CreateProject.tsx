import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import ProjectChatPanel from './ProjectChatPanel'


interface UploadedFile {
    id: number;
    name: string;
    type: string;
    size: string;
    source: string;
}

const CreateProject = () => {
    const [menus, setMenus] = useState({ main: false, file: false, modal: false });
    const [instructions, setInstructions] = useState('Break down large tasks and ask clarifying questions when needed.');
    const [savedInstructions, setSavedInstructions] = useState('Break down large tasks and ask clarifying questions when needed.');
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [conversations, setConversations] = useState<Array<{
        id: number;
        title?: string | null;
        project_id?: number;
        updated_at: string;
    }>>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [chatKey, setChatKey] = useState(0); // for resetting chat panel
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { projects, currentProject, setCurrentProject } = useProjects();
    const { user, logout } = useAuth();

    // Load project when the page loads
    useEffect(() => {
        if (!projectId) {
            navigate('/projectsPage');
            return;
        }

        // If projects are already loaded
        if (projects.length > 0) {
            const project = projects.find(p => String(p.id) === projectId);
            if (project) {
                setCurrentProject(project);
            } else {
                // If project not found in loaded projects
                navigate('/projectsPage');
            }
        } else {
            // If projects aren't loaded yet, fetch them from API
            const fetchProjects = async () => {
                try {
                    const projectsAPI = await import('../api/client').then(m => m.ProjectsAPI);
                    const fetchedProjects = await projectsAPI.list();
                    const project = fetchedProjects.find(p => String(p.id) === projectId);
                    if (project) {
                        setCurrentProject({
                            id: String(project.id),
                            name: project.name,
                            description: project.description || '',
                            createdAt: new Date(project.created_at),
                            updatedAt: new Date(project.updated_at)
                        });
                    } else {
                        navigate('/projectsPage');
                    }
                } catch (error) {
                    console.error('Failed to load project:', error);
                    navigate('/projectsPage');
                }
            };
            fetchProjects();
        }
    }, [projectId, projects, setCurrentProject, navigate]);

    // Function to fetch conversations
    const fetchConversations = useCallback(async () => {
        if (!currentProject?.id) return;

        try {
            const all = await import('../api/client').then(m => m.ConversationsAPI.list());
            // Filter by project and ensure project_id is converted to string for comparison
            const filtered = all.filter((c: any) => String(c.project_id) === String(currentProject.id));
            setConversations(filtered);
        } catch (error) {
            console.error('Failed to load conversations:', error);
            setConversations([]);
        }
    }, [currentProject?.id]);

    // Load conversations when project changes
    useEffect(() => {
        fetchConversations();
    }, [currentProject?.id, fetchConversations]);

    // Listen for conversations being added to this project
    useEffect(() => {
        const handleConversationAdded = (event: CustomEvent) => {
            const { projectId } = event.detail;
            // If a conversation was added to the current project, refresh the list
            if (String(projectId) === String(currentProject?.id)) {
                fetchConversations();
            }
        };

        window.addEventListener('conversationAddedToProject', handleConversationAdded as EventListener);
        return () => {
            window.removeEventListener('conversationAddedToProject', handleConversationAdded as EventListener);
        };
    }, [currentProject?.id, fetchConversations]);

    const handleNewChat = () => {
        setSelectedConversationId(null);
        setChatKey(k => k + 1);
    };

    const handleSelectConversation = (id: number) => {
        setSelectedConversationId(id);
        setChatKey(k => k + 1);
    };

    const handleEditConversation = async (id: number) => {
        const newTitle = prompt('Enter new title for this conversation:');
        if (newTitle === null) return; // User cancelled

        try {
            const ConversationsAPI = (await import('../api/client')).ConversationsAPI;
            await ConversationsAPI.update(id, { title: newTitle });

            // Update local state
            setConversations(prevConvs =>
                prevConvs.map(conv =>
                    conv.id === id
                        ? { ...conv, title: newTitle }
                        : conv
                )
            );
        } catch (error) {
            console.error('Failed to update conversation:', error);
            alert('Failed to update conversation title');
        }
    };

    const handleDeleteConversation = async (id: number) => {
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        try {
            const ConversationsAPI = (await import('../api/client')).ConversationsAPI;
            await ConversationsAPI.delete(id);

            // Update local state
            setConversations(prevConvs => prevConvs.filter(conv => conv.id !== id));
            if (selectedConversationId === id) {
                setSelectedConversationId(null);
                setChatKey(k => k + 1);
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            alert('Failed to delete conversation');
        }
    };

    // Function to handle sharing a chat from main chatbot
    const handleShareChat = () => {
        alert('Share chat functionality needs backend implementation');
    };

    const toggleMenu = (menu: keyof typeof menus) => {
        setMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const saveInstructions = () => {
        setSavedInstructions(instructions);
        toggleMenu('modal');
    };

    const cancelInstructions = () => {
        setInstructions(savedInstructions);
        toggleMenu('modal');
    };

    const addFile = (type: string) => {
        const fileData = {
            device: { name: 'document.pdf', type: 'PDF', size: '2.4 MB' },
            text: { name: 'Text Content', type: 'TXT', size: '1.2 KB' },
            github: { name: 'README.md', type: 'MD', size: '3.1 KB' }
        }[type];

        if (fileData) {
            setFiles(prev => [...prev, { id: Date.now(), ...fileData, source: type }]);
            toggleMenu('file');
        }
    };

    const removeFile = (id: number) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const Icon = ({ d, size = 16, fill = "none" }: { d: string, size?: number, fill?: string }) => (
        <svg width={size} height={size} fill={fill} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d={d} />
        </svg>
    );

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center h-14 sm:h-16 px-4 sm:px-8 border-b flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/projectsPage')}
                        className="flex items-center gap-2 text-sm sm:text-base transition-colors px-3 py-1.5 rounded-md"
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
                        <Icon d="M15 18l-6-6 6-6" size={16} />
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
                        <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={16} />
                        <span className="hidden lg:inline">Home</span>
                    </button>
                </div>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    {user && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)] px-2 py-1 text-sm">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
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
                    <div className="relative">
                        <button
                            onClick={() => toggleMenu('main')}
                            // className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg transition-colors"
                            style={{
                                backgroundColor: 'var(--bg-quaternary)',
                                border: '1px solid var(--border-secondary)',
                                color: 'var(--text-secondary)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-quaternary)';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                        >
                            {/* <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-6.364 0L3.636 17.364m12.728 0l-4.243-4.243m-6.364 0L3.636 6.636" />
                            </svg> */}
                        </button>

                        {menus.main && (
                            <div className="absolute right-0 mt-2 w-40 sm:w-48 rounded-lg border shadow-xl z-10" style={{
                                backgroundColor: 'var(--bg-primary)',
                                borderColor: 'var(--border-primary)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                            }}>
                                {[
                                    { icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z", text: "Edit details" },
                                    { icon: "M21 8v13H3V8M1 3h22v5H1z", text: "Archive" },
                                    { icon: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", text: "Delete", isDestructive: true }
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left transition-colors flex items-center gap-2 sm:gap-3 text-sm ${i === 0 ? 'rounded-t-lg' :
                                            i === 2 ? 'rounded-b-lg border-t' : ''
                                            }`}
                                        style={{
                                            color: item.isDestructive ? '#ef4444' : 'var(--text-primary)',
                                            borderColor: i === 2 ? 'var(--border-primary)' : undefined
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <Icon d={item.icon} size={14} />
                                        {item.text}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg transition-colors"
                        style={{
                            backgroundColor: 'var(--bg-quaternary)',
                            border: '1px solid var(--border-secondary)',
                            color: 'var(--text-secondary)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-quaternary)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" size={18} />
                    </button>
                </div>
            </div>

            {/* Project Name */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
                <h1 className="text-xl sm:text-2xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{currentProject?.name || 'Project'}</h1>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Conversations */}
                <div className="w-48 sm:w-56 lg:w-80 border-r p-2 sm:p-3 lg:p-4 flex flex-col overflow-hidden" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs sm:text-sm lg:text-base" style={{ color: 'var(--text-primary)' }}>Chats</span>
                            <button
                                onClick={handleNewChat}
                                className="px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg text-white text-xs lg:text-sm flex items-center gap-1 lg:gap-2 transition-colors"
                                style={{ backgroundColor: 'var(--accent-primary)' }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                                }}
                                title="New Chat"
                            >
                                <Icon d="M12 4v16m8-8H4" size={14} />
                                <span className="hidden lg:inline">New</span>
                            </button>
                        </div>
                        <button
                            onClick={handleShareChat}
                            className="w-full px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg border text-xs lg:text-sm flex items-center justify-center gap-1 lg:gap-2 transition-colors"
                            style={{
                                borderColor: 'var(--border-secondary)',
                                backgroundColor: 'var(--bg-quaternary)',
                                color: 'var(--text-primary)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover-light)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-quaternary)';
                            }}
                        >
                            <Icon d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" size={14} />
                            <span className="hidden lg:inline">Share Chat from Main</span>
                            <span className="lg:hidden">Share</span>
                        </button>
                    </div>

                    {conversations.length === 0 ? (
                        <div className="text-xs lg:text-sm text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
                            No chats yet
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto">
                            <div className="space-y-2">
                                {conversations.map((conv: any) => (
                                    <div key={conv.id} className="group relative">
                                        <button
                                            className="w-full text-left p-2 lg:p-3 rounded-lg transition-colors"
                                            style={{
                                                backgroundColor: selectedConversationId === conv.id
                                                    ? 'var(--bg-hover-light)'
                                                    : 'transparent',
                                                fontWeight: selectedConversationId === conv.id ? '500' : 'normal'
                                            }}
                                            onMouseEnter={e => {
                                                if (selectedConversationId !== conv.id) {
                                                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = selectedConversationId === conv.id
                                                    ? 'var(--bg-hover-light)'
                                                    : 'transparent';
                                            }}
                                            onClick={() => handleSelectConversation(conv.id)}
                                        >
                                            <div className="flex items-start">
                                                <Icon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" size={16} />
                                                <div className="ml-2 lg:ml-3 flex-1 max-w-24">
                                                    <div className="font-medium truncate text-xs lg:text-sm" style={{ color: 'var(--text-primary)' }}>
                                                        {conv.title || `Chat ${conv.id}`}
                                                    </div>
                                                    <div className="text-[10px] lg:text-xs hidden sm:block" style={{ color: 'var(--text-tertiary)' }}>
                                                        {new Date(conv.updated_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditConversation(conv.id);
                                                }}
                                                className="p-1 rounded-lg transition-colors"
                                                style={{ color: 'var(--text-secondary)' }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                                    e.currentTarget.style.color = 'var(--text-primary)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                                }}
                                                title="Edit conversation"
                                            >
                                                <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteConversation(conv.id);
                                                }}
                                                className="p-1 rounded-lg transition-colors"
                                                style={{ color: '#ef4444' }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                                title="Delete conversation"
                                            >
                                                <Icon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-hidden">
                        <ProjectChatPanel
                            key={chatKey}
                            conversationId={selectedConversationId}
                            projectId={currentProject?.id}
                        />
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-48 sm:w-56 lg:w-[380px] flex flex-col gap-3 lg:gap-6 p-2 sm:p-3 lg:p-8 border-l overflow-y-auto" style={{ borderColor: 'var(--border-primary)' }}>
                    {/* Instructions */}
                    <div className="rounded-lg lg:rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-secondary)] p-2 sm:p-3 lg:p-6">
                        <div className="flex items-center justify-between mb-2 lg:mb-3">
                            <span className="font-semibold text-xs lg:text-base" style={{ color: 'var(--text-primary)' }}>Info</span>
                            <button
                                onClick={() => toggleMenu('modal')}
                                className="p-1 lg:p-1.5 rounded-md transition-colors"
                                style={{ '--hover-bg': 'var(--bg-hover)' } as React.CSSProperties & { '--hover-bg': string }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                title="Edit instructions"
                            >
                                <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={14} />
                            </button>
                        </div>
                        <p className="text-[10px] lg:text-sm line-clamp-2 lg:line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{savedInstructions}</p>
                    </div>

                    {/* Files */}
                    <div className="rounded-lg lg:rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-secondary)] p-2 sm:p-3 lg:p-6">
                        <div className="flex items-center justify-between mb-3 lg:mb-4">
                            <span className="font-semibold text-xs lg:text-base" style={{ color: 'var(--text-primary)' }}>Files</span>
                            <div className="relative">
                                <button
                                    onClick={() => toggleMenu('file')}
                                    className="p-1 lg:p-1.5 rounded-md transition-colors flex items-center justify-center"
                                    style={{
                                        '--hover-bg': 'var(--bg-hover)',
                                        backgroundColor: 'var(--bg-quaternary)',
                                        border: '1px solid var(--border-secondary)',
                                        width: '24px',
                                        height: '24px'
                                    } as React.CSSProperties & { '--hover-bg': string }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-quaternary)';
                                    }}
                                    title="Add file"
                                >
                                    <Icon d="M12 4v16m8-8H4" size={14} />
                                </button>

                                {menus.file && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-lg border shadow-xl z-10" style={{
                                        backgroundColor: 'var(--bg-primary)',
                                        borderColor: 'var(--border-primary)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                    }}>
                                        <button
                                            onClick={() => addFile('device')}
                                            className="w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 text-sm rounded-t-lg"
                                            style={{ color: 'var(--text-primary)' }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" size={16} />
                                            Upload file
                                        </button>
                                        <button
                                            onClick={() => addFile('text')}
                                            className="w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 text-sm"
                                            style={{ color: 'var(--text-primary)' }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={16} />
                                            Add text
                                        </button>
                                        <button
                                            onClick={() => addFile('github')}
                                            className="w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 text-sm rounded-b-lg"
                                            style={{ color: 'var(--text-primary)' }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <Icon d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.386-1.332-1.755-1.332-1.755-1.089-.745.083-.73.083-.73 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" size={16} />
                                            Add from GitHub
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {files.length > 0 ? (
                            <div className="space-y-1 lg:space-y-2">
                                {files.map(file => (
                                    <div key={file.id} className="flex items-center justify-between p-2 lg:p-3 rounded-lg border transition-colors" style={{
                                        backgroundColor: 'var(--bg-tertiary)',
                                        borderColor: 'var(--border-secondary)'
                                    }}>
                                        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                                            <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg flex-shrink-0" style={{
                                                backgroundColor: 'var(--bg-quaternary)',
                                                border: '1px solid var(--border-secondary)',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" size={14} />
                                            </div>
                                            <div className="min-w-0 hidden lg:block">
                                                <p className="text-xs lg:text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                                                <p className="text-[10px] lg:text-xs" style={{ color: 'var(--text-secondary)' }}>{file.type} • {file.size}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(file.id)}
                                            className="p-1 lg:p-1.5 rounded-md transition-colors flex-shrink-0"
                                            style={{ color: 'var(--text-tertiary)' }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.color = 'var(--text-primary)';
                                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.color = 'var(--text-tertiary)';
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                            title="Remove file"
                                        >
                                            <Icon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 lg:py-8 px-2 lg:px-4 text-center">
                                <div className="mb-2 lg:mb-4 hidden lg:block" style={{ color: 'var(--text-tertiary)', opacity: 0.6 }}>
                                    <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" size={48} />
                                </div>
                                <span className="text-[10px] lg:text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    <span className="hidden lg:inline">Add PDFs, documents, or other text to reference in this project.</span>
                                    <span className="lg:hidden">No files</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Instructions Modal */}
            {menus.modal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--bg-primary)] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-primary)]">
                            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Project Instructions</h2>
                            <button
                                onClick={cancelInstructions}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <Icon d="M18 6L6 18M6 6l12 12" size={20} />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-4 sm:mb-6">Provide Claude with relevant instructions and information for chats within this project.</p>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                className="w-full h-[300px] sm:h-[400px] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm sm:text-base border-2 border-[var(--border-primary)] rounded-lg p-3 sm:p-4 focus:outline-none focus:border-[#4a90e2] resize-none font-normal placeholder:text-[var(--text-secondary)]"
                                placeholder="Break down large tasks and ask clarifying questions when needed."
                            />
                        </div>

                        <div className="flex justify-end gap-3 sm:gap-4 p-4 sm:p-6 border-t border-[var(--border-primary)]">
                            <button
                                onClick={cancelInstructions}
                                className="px-4 sm:px-6 py-2 bg-transparent text-[var(--text-primary)] text-sm sm:text-base border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveInstructions}
                                className="px-4 sm:px-6 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm sm:text-base rounded-lg hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] transition-colors duration-200"
                            >
                                Save instructions
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateProject;