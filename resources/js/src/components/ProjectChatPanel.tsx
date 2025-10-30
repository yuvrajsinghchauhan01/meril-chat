import React, { useEffect, useState, useRef } from 'react';
import { ChatAPI, ConversationsAPI, ModelsAPI, type ApiModelItem, type ApiMessage } from '../api/client';
import Markdown from './Markdown';
import ModelSelector from './ModelSelector';
import { useTheme } from '../contexts/ThemeContext';
import { generateUUID } from '../utils/uuid';

// Suggestion pills for quick actions
const SUGGESTIONS = [
  { label: 'Explain code', icon: '💡' },
  { label: 'Fix bugs', icon: '🐛' },
  { label: 'Optimize', icon: '⚡' },
  { label: 'Add tests', icon: '✅' },
];

// Example prompts
const EXAMPLE_PROMPTS = [
  'Help me refactor this component',
  'Explain the architecture of this project',
  'Find potential security issues',
  'Suggest performance improvements',
  'Write documentation for this code',
];

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
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        let list = await ModelsAPI.list();
        if (!list || list.length === 0) list = FALLBACK_MODELS;
        if (list.length > 0) setSelectedModel(list[0].model_id);
      } catch {
        if (FALLBACK_MODELS.length > 0) setSelectedModel(FALLBACK_MODELS[0].model_id);
      }
    })();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (items.length > 0 && chatEndRef.current) {
      const timeoutId = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [items]);

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

  // File handling
  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${['Bytes', 'KB', 'MB', 'GB'][i]}`;
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
    if (!text || isStreaming) return;

    const userItem: ProjectChatItem = { id: generateUUID(), role: 'user', content: text };
    setItems(prev => [...prev, userItem]);
    setMessage('');
    setAttachedFiles([]); // Clear attached files after sending

    (async () => {
      if (!selectedModel) {
        const assistantItem: ProjectChatItem = { id: generateUUID(), role: 'assistant', content: `You asked: ${text}` };
        setItems(prev => [...prev, assistantItem]);
        return;
      }

      setIsStreaming(true);
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
      } finally {
        setIsStreaming(false);
      }
    })();
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Chat Area */}
      <section className="flex justify-center px-2 xs:px-4 sm:px-6 pt-3 xs:pt-4 sm:pt-5 flex-1 overflow-hidden">
        {/* Centered rounded panel */}
        <div className="relative w-full max-w-[980px] rounded-xl xs:rounded-[16px] sm:rounded-[22px] flex flex-col h-full overflow-hidden" style={{
          backgroundColor: theme === 'dark' ? 'rgba(26, 21, 32, 0.4)' : 'rgba(248, 249, 250, 0.8)',
          boxShadow: 'var(--shadow-secondary)'
        }}>
          <div className="relative flex w-full flex-col gap-3 xs:gap-4 sm:gap-6 px-3 xs:px-4 sm:px-6 lg:px-10 py-4 xs:py-6 sm:pt-10 flex-1 overflow-y-auto" style={{ overflowX: 'hidden' }}>
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 xs:gap-4 sm:gap-6">
                {/* Main Heading */}
                <h1 className="m-0 text-xl xs:text-2xl sm:text-3xl lg:text-[44px] font-extrabold text-center leading-tight px-2">
                  How can I help you?
                </h1>

                {/* Suggestion Pills */}
                <div className="flex flex-wrap justify-center gap-1.5 xs:gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      className="inline-flex items-center gap-1.5 xs:gap-2 rounded-full px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap"
                      style={{
                        border: '1px solid var(--border-primary)',
                        backgroundColor: 'var(--bg-quaternary)',
                        color: 'var(--text-primary)'
                      }}
                      onClick={() => setMessage(s.label)}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover-light)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-quaternary)';
                      }}
                    >
                      <span className="text-sm xs:text-base">{s.icon}</span>
                      <span className="hidden xs:inline">{s.label}</span>
                    </button>
                  ))}
                </div>

                {/* Example Prompts List */}
                <ul className="mt-3 xs:mt-4 sm:mt-6 w-full max-w-[720px] list-none p-0" style={{ borderTop: '1px solid var(--border-tertiary)' }}>
                  {EXAMPLE_PROMPTS.map((prompt, idx) => (
                    <li
                      key={idx}
                      className="py-2 xs:py-2.5 sm:py-3.5 cursor-pointer transition-colors text-xs xs:text-sm sm:text-[15px] px-2 sm:px-0"
                      style={{
                        color: 'var(--text-quaternary)',
                        borderBottom: idx < EXAMPLE_PROMPTS.length - 1 ? '1px solid var(--border-tertiary)' : 'none'
                      }}
                      onClick={() => setMessage(prompt)}
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
              <div className="flex flex-col gap-3 xs:gap-4">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className={`flex ${it.role === 'user' ? 'justify-end' : 'justify-start'} mb-2 xs:mb-4`}
                  >
                    <div
                      className={`max-w-[85%] xs:max-w-[80%] sm:max-w-[75%] rounded-xl xs:rounded-2xl text-xs xs:text-sm sm:text-[15px] ${it.content ? 'px-3 xs:px-4 py-2 xs:py-3' : ''}`}
                      style={{
                        backgroundColor: it.role === 'user'
                          ? 'var(--accent-primary)'
                          : theme === 'dark' ? '#374151' : '#f3f4f6',
                        color: it.role === 'user'
                          ? 'white'
                          : 'var(--text-primary)',
                        border: it.role === 'assistant' ? '1px solid var(--border-primary)' : 'none'
                      }}
                    >
                      <Markdown>{it.content || ''}</Markdown>
                    </div>
                  </div>
                ))}

                {/* Streaming Indicator - Shows when AI is generating response */}
                {isStreaming && (
                  <div className="flex justify-start mb-2 xs:mb-4">
                    <div
                      className="rounded-xl xs:rounded-2xl px-3 xs:px-4 py-2 xs:py-3"
                      style={{
                        backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                        border: '1px solid var(--border-primary)'
                      }}
                    >
                      <div className="flex gap-1.5 items-center">
                        <span className="w-1.5 xs:w-2 h-1.5 xs:h-2 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 xs:w-2 h-1.5 xs:h-2 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 xs:w-2 h-1.5 xs:h-2 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer / Input Area */}
      <footer className="px-2 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-7">
        {/* Input Container constrained to panel width */}
        <div className="mx-auto w-full max-w-[980px]">
          <div className="relative flex flex-col rounded-lg xs:rounded-xl sm:rounded-2xl p-2.5 xs:p-3 sm:p-4" style={{
            border: '1px solid var(--border-secondary)',
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: 'var(--shadow-tertiary)'
          }}>
            {/* Attached Files Display */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 xs:gap-2 mb-2 xs:mb-3">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 xs:gap-2 rounded-md xs:rounded-lg px-2 xs:px-3 py-1.5 xs:py-2 text-[10px] xs:text-xs"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-secondary)'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="xs:w-[14px] xs:h-[14px] flex-shrink-0">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="truncate max-w-[80px] xs:max-w-[120px]" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[var(--text-tertiary)] hidden xs:inline">
                      ({formatFileSize(file.size)})
                    </span>
                    <button
                      onClick={() => removeAttachedFile(index)}
                      className="ml-0.5 xs:ml-1 p-0.5 rounded hover:bg-[var(--bg-hover)] transition-colors cursor-pointer flex-shrink-0"
                      aria-label="Remove file"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="xs:w-[12px] xs:h-[12px]">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Streaming Status Indicator */}
            {isStreaming && (
              <div className="flex items-center gap-1.5 xs:gap-2 mb-2 text-[10px] xs:text-xs text-[var(--text-secondary)]">
                <div className="flex gap-1">
                  <span className="w-1 xs:w-1.5 h-1 xs:h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 xs:w-1.5 h-1 xs:h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 xs:w-1.5 h-1 xs:h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="hidden xs:inline">AI is responding...</span>
              </div>
            )}

            {/* Text Input */}
            <textarea
              className="flex-1 bg-transparent px-0 py-1.5 xs:py-2 outline-none text-xs xs:text-sm sm:text-[15px] resize-none min-h-[36px] xs:min-h-[40px] max-h-[100px] xs:max-h-[120px]"
              style={{ color: 'var(--text-primary)', '--placeholder-color': 'var(--text-tertiary)' } as React.CSSProperties & { '--placeholder-color': string }}
              placeholder={isStreaming ? "AI is responding..." : "Type your message here..."}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              disabled={isStreaming}
            />

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Bottom Controls */}
            <div className="flex items-center justify-between mt-2 xs:mt-3 pt-2 xs:pt-3" style={{ borderTop: '1px solid var(--border-tertiary)' }}>
              <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 flex-wrap">
                {/* Model Selector - Mobile optimized */}
                <div className="flex-shrink-0">
                  <ModelSelector
                    selectedModelId={selectedModel ?? undefined}
                    onModelChange={setSelectedModel}
                  />
                </div>

                {/* Search Button - Hidden on very small screens */}
                <button className="hidden sm:flex items-center gap-2 rounded-lg px-2.5 xs:px-3 py-1.5 xs:py-2 text-xs transition-colors cursor-pointer" style={{
                  border: '1px solid var(--border-secondary)',
                  backgroundColor: 'var(--bg-quaternary)',
                  color: 'var(--text-primary)'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="xs:w-[14px] xs:h-[14px]">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <span className="hidden md:inline">Search</span>
                </button>

                {/* Attachment Button */}
                <button
                  className="relative p-1.5 xs:p-2 rounded-md xs:rounded-lg transition-colors hover:bg-[var(--bg-hover-light)] cursor-pointer flex-shrink-0"
                  onClick={handleFileAttachment}
                  title="Attach files"
                  style={{
                    '--hover-bg': 'var(--bg-hover-light)',
                    color: attachedFiles.length > 0 ? 'var(--accent-primary)' : 'var(--text-primary)'
                  } as React.CSSProperties & { '--hover-bg': string }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="xs:w-[16px] xs:h-[16px]">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  {attachedFiles.length > 0 && (
                    <span className="absolute -top-0.5 xs:-top-1 -right-0.5 xs:-right-1 bg-[var(--accent-primary)] text-white text-[10px] xs:text-xs rounded-full w-4 h-4 xs:w-5 xs:h-5 flex items-center justify-center">
                      {attachedFiles.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!message.trim() || isStreaming}
                className="grid h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10 place-items-center rounded-md xs:rounded-lg sm:rounded-xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                style={{ backgroundColor: 'var(--accent-primary)' }}
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="xs:w-[14px] xs:h-[14px] sm:w-[18px] sm:h-[18px]">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
