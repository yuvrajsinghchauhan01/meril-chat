import React, { useEffect, useState, useRef } from 'react';
import { ChatAPI, ConversationsAPI, ModelsAPI, type ApiModelItem, type ApiMessage } from '../api/client';
import Markdown from './Markdown';
import ModelSelector from './ModelSelector';
import { useTheme } from '../contexts/ThemeContext';
import { generateUUID } from '../utils/uuid';

export type ProjectChatItem = {
  id: string;
  apiId?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
  isEditing?: boolean;
  isLoading?: boolean;
};

const FALLBACK_MODELS: ApiModelItem[] = [
  { model_id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { model_id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { model_id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct', provider: 'meta-llama' },
  { model_id: 'google/gemma-2-9b-it', name: 'Gemma 2 9B IT', provider: 'google' },
  { model_id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B Instruct', provider: 'mistral' },
];

interface ProjectChatPanelProps {
  conversationId?: number | null;
  projectId?: string | number;
}

export default function ProjectChatPanel({ conversationId: initialConversationId, projectId }: ProjectChatPanelProps) {
  const [message, setMessage] = useState('');
  const [items, setItems] = useState<ProjectChatItem[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(initialConversationId || null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [models, setModels] = useState<ApiModelItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [justSent, setJustSent] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        let list = await ModelsAPI.list();
        if (!list || list.length === 0) list = FALLBACK_MODELS;
        setModels(list);
        if (list.length > 0) setSelectedModel(list[0].model_id);
      } catch {
        setModels(FALLBACK_MODELS);
        if (FALLBACK_MODELS.length > 0) setSelectedModel(FALLBACK_MODELS[0].model_id);
      }
    })();
  }, []);

  // Load conversation if ID is provided
  useEffect(() => {
    if (initialConversationId) {
      openConversation(initialConversationId);
    }
  }, [initialConversationId]);

  const mapMessageToItem = (m: ApiMessage): ProjectChatItem => ({
    id: `${m.id}`,
    apiId: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.created_at,
    isEditing: false,
    isLoading: false
  });

  const handleEditMessage = (id: string, content: string) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isEditing: true } 
        : item
    ));
    setEditingId(id);
    setEditingContent(content);
  };

  const saveEdit = async (id: string) => {
    if (!editingContent.trim()) return;
    
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, content: editingContent, isEditing: false } 
        : item
    ));
    
    // Here you would typically call an API to update the message
    // await updateMessage(conversationId, id, editingContent);
    
    setEditingId(null);
  };

  const cancelEdit = (id: string, originalContent: string) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isEditing: false } 
        : item
    ));
    setEditingContent(originalContent);
    setEditingId(null);
  };

  const regenerateResponse = async (messageId: string) => {
    // Find the message to regenerate
    const messageIndex = items.findIndex(item => item.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;
    
    // Get the previous user message
    const prevMessage = items[messageIndex - 1];
    if (prevMessage.role !== 'user') return;
    
    // Mark the message as loading
    setItems(prev => prev.map((item, idx) => 
      idx === messageIndex ? { ...item, isLoading: true } : item
    ));
    
    try {
      // Stream regeneration into the same assistant message slot
      let accumulated = '';
      await ChatAPI.sendStream(
        {
          model: selectedModel || '',
          message: prevMessage.content,
          conversation_id: conversationId ?? undefined,
          project_id: projectId ? Number(projectId) : undefined,
        },
        (token) => {
          accumulated += token;
          setItems(prev => prev.map((item, idx) => idx === messageIndex ? { ...item, content: accumulated } : item));
        },
        (info) => {
          if (info?.conversation_id && !conversationId) setConversationId(info.conversation_id);
        }
      );
      setItems(prev => prev.map((item, idx) => idx === messageIndex ? { ...item, isLoading: false } : item));
    } catch (error) {
      console.error('Failed to regenerate response:', error);
      setItems(prev => prev.map((item, idx) => 
        idx === messageIndex 
          ? { 
              ...item, 
              isLoading: false,
              content: 'Failed to regenerate response. Please try again.'
            } 
          : item
      ));
    }
  };
  
  const continueGeneration = async (messageId: string) => {
    // Find the last message
    const lastMessage = items[items.length - 1];
    if (lastMessage.id !== messageId || lastMessage.role !== 'assistant') return;
    
    // Mark as loading
    setItems(prev => prev.map(item => 
      item.id === messageId 
        ? { ...item, isLoading: true } 
        : item
    ));
    
    try {
      // Call continue API (adjust based on your API)
      const res = await ChatAPI.continueGeneration({
        conversation_id: conversationId!,
        message_id: parseInt(messageId),
        model: selectedModel || ''
      });
      
      // Update the conversation
      await openConversation(res.conversation_id);
      setConversationId(res.conversation_id);
    } catch (error) {
      console.error('Failed to continue generation:', error);
      setItems(prev => prev.map(item => 
        item.id === messageId 
          ? { 
              ...item, 
              isLoading: false,
              content: item.content + '\n[Failed to continue generation]'
            } 
          : item
      ));
    }
  };

  const openConversation = async (id: number) => {
    try {
      const conv = await ConversationsAPI.get(id);
      setConversationId(conv.id);
      const msgs = (conv.messages || []).map(mapMessageToItem);
      setItems(msgs);
    } catch {
      // ignore
    }
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    const userItem: ProjectChatItem = { id: generateUUID(), role: 'user', content: text };
    setItems(prev => [...prev, userItem]);
    setMessage('');
    setJustSent(true);
    setTimeout(() => setJustSent(false), 600);

    (async () => {
      if (!selectedModel) {
        const assistantItem: ProjectChatItem = { id: generateUUID(), role: 'assistant', content: `You asked: ${text}` };
        setItems(prev => [...prev, assistantItem]);
        return;
      }
      try {
        const assistantId = generateUUID();
        let accumulated = '';
        setItems(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

        const meta = await ChatAPI.sendStream(
          {
            model: selectedModel,
            message: text,
            conversation_id: conversationId ?? undefined,
            project_id: projectId ? Number(projectId) : undefined,
          },
          (token) => {
            accumulated += token;
            setItems(prev => prev.map(it => it.id === assistantId ? { ...it, content: accumulated } : it));
          },
          (info) => {
            if (info?.conversation_id && !conversationId) setConversationId(info.conversation_id as number);
          }
        );

        if (meta?.conversation_id && !conversationId) setConversationId(meta.conversation_id as number);
      } catch (e: any) {
        const assistantItem: ProjectChatItem = { id: generateUUID(), role: 'assistant', content: `Error contacting server: ${e?.message ?? 'Unknown error'}` };
        setItems(prev => [...prev, assistantItem]);
      }
    })();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Area with same design as main conversation */}
      <section className="flex justify-center px-4 sm:px-6 pt-8 sm:pt-14 pb-4 flex-1 overflow-y-auto">
        <div className="relative w-full max-w-[1280px] rounded-[16px] sm:rounded-[22px]" style={{
          border: '1px solid var(--border-secondary)',
          backgroundColor: theme === 'dark' ? 'rgba(26, 21, 32, 0.4)' : 'rgba(248, 249, 250, 0.8)',
          boxShadow: 'var(--shadow-secondary)'
        }}>
          <div className="pointer-events-none absolute inset-0 rounded-[16px] sm:rounded-[22px] bg-[radial-gradient(1200px_400px_at_50%_-200px,rgba(255,255,255,0.05),rgba(0,0,0,0))]" />
          <div className="relative flex w-full flex-col gap-4 sm:gap-6 px-4 sm:px-6 lg:px-10 py-6 sm:py-10 min-h-[400px]">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 sm:gap-6 justify-center flex-1">
                <h2 className="m-0 text-xl sm:text-2xl lg:text-3xl font-bold text-center leading-tight px-2">
                  How can I help you with this project?
                </h2>
                <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
                  Start a conversation below. All messages will be saved to this project.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((it, index) => (
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
                      {it.isEditing ? (
                        <div>
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            onKeyDown={async (e) => {
                              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                e.preventDefault();
                                await saveEdit(it.id);
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                cancelEdit(it.id, it.content);
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
                              onClick={() => saveEdit(it.id)}
                            >
                              Save (Ctrl/Cmd+Enter)
                            </button>
                            <button
                              className="px-2 py-1 rounded text-xs"
                              style={{ border: '1px solid var(--border-secondary)', background: 'var(--bg-quaternary)', color: 'var(--text-primary)' }}
                              onClick={() => cancelEdit(it.id, it.content)}
                            >
                              Cancel (Esc)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <Markdown>{it.content}</Markdown>
                      )}
                    </div>
                    
                    {!it.isEditing && it.role === 'user' && !justSent && (
                      <button
                        type="button"
                        className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Edit Message"
                        onClick={() => handleEditMessage(it.id, it.content)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9"/>
                          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                        </svg>
                      </button>
                    )}
                    
                    {!it.isEditing && it.role === 'assistant' && !justSent && (
                      <button
                        type="button"
                        className="absolute top-1 left-1 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Regenerate"
                        onClick={() => regenerateResponse(it.id)}
                        disabled={it.isLoading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-3-6.7"/>
                          <polyline points="21 3 21 9 15 9"/>
                        </svg>
                      </button>
                    )}
                    
                    {it.isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 rounded-2xl">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[var(--accent-primary)]"></div>
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
      
      {/* Footer / Input Area with same design */}
      <footer className="px-4 sm:px-6 pb-4 sm:pb-7">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="relative flex flex-col rounded-xl sm:rounded-2xl p-2 sm:p-3" style={{
            border: '1px solid var(--border-secondary)',
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: 'var(--shadow-tertiary)'
          }}>
            <form
              onSubmit={(e) => { e.preventDefault(); (document.activeElement as HTMLElement | null)?.blur?.(); handleSend(); }}
              className="flex flex-col"
            >
              <input
                className="flex flex-1 bg-transparent px-2 sm:px-3 pt-2.5 pb-16 sm:pb-20 outline-none text-sm sm:text-[15px]"
                style={{ color: 'var(--text-primary)', '--placeholder-color': 'var(--text-tertiary)' } as React.CSSProperties & { '--placeholder-color': string }}
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
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
    </div>
  );
}
