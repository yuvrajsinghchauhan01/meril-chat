import React, { useState, useEffect, useRef } from 'react';
import { ChatAPI, type ApiMessage, type ApiConversation, type ApiModelItem } from '../api/client';

type ProjectChatItem = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
  isEditing?: boolean;
  isLoading?: boolean;
};

interface ProjectChatProps {
  projectId: number;
  onClose: () => void;
  models: ApiModelItem[];
}

export default function ProjectChat({ projectId, onClose, models }: ProjectChatProps) {
  const [message, setMessage] = useState('');
  const [items, setItems] = useState<ProjectChatItem[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(models[0]?.model_id || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items]);

  // Load conversation history when project changes
  useEffect(() => {
    const loadConversation = async () => {
      // In a real app, you would fetch the conversation history for this project
      setItems([]);
      setConversationId(null);
    };
    loadConversation();
  }, [projectId]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !selectedModel) return;

    const userMessage: ProjectChatItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    // Add user message to chat
    const newItems = [...items, userMessage, {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '...',
      isLoading: true,
    }];
    
    setItems(newItems);
    setMessage('');

    try {
      setIsLoading(true);
      let assistantId = `assistant-${Date.now()}`;
      let accumulated = '';

      // Start with an empty assistant message and update incrementally
      setItems(prev => [
        ...prev.filter(item => !item.isLoading),
        { id: assistantId, role: 'assistant', content: '' },
      ]);

      const meta = await ChatAPI.sendStream(
        {
          model: selectedModel,
          message: userMessage.content,
          project_id: projectId,
          conversation_id: conversationId || undefined,
        },
        (token) => {
          accumulated += token;
          setItems(prev => prev.map(it => it.id === assistantId ? { ...it, content: accumulated } : it));
        },
        (info) => {
          if (info?.conversation_id && !conversationId) {
            setConversationId(info.conversation_id);
          }
        }
      );

      if (meta?.conversation_id && !conversationId) {
        setConversationId(meta.conversation_id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove loading message on error
      setItems(prev => prev.filter(item => !item.isLoading));
      // Show error message
      setItems(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, there was an error processing your message. Please try again.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col" style={{ height: '600px' }}>
      <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">Project Chat</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Start a conversation about your project</p>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  item.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {item.isLoading ? (
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{item.content}</div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSend} className="space-y-2">
          <div className="flex space-x-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
              disabled={isLoading}
            >
              {models.map((model) => (
                <option key={model.model_id} value={model.model_id}>
                  {model.name || model.model_id}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-700 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
