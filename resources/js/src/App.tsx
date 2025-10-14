import './App.css'
import './index.css'
import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProjectsPage from './components/ProjectsPage'
import Home from './components/Home'
import NewProjectCreate from './components/NewProjectCreate'
import CreateProject from './components/CreateProject'
import Login from './components/Login'
import Register from './components/Register'
import Settings from './components/Settings'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'
import ProtectedRoute from './components/ProtectedRoute'
import { ChatAPI, ModelsAPI, ConversationsAPI, MessagesAPI, SearchAPI, type ApiModelItem, type ApiConversation, type ApiMessage } from './api/client'
import { analyzeSearchContext, generateWebSearchSystemPrompt, isDefinitionQuery } from './utils/smartSearch'
import { generateUUID } from './utils/uuid'

export type Suggestion = {
  icon: string
  label: string
}

export type ChatItem = {
  id: string
  apiId?: number
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: string
  webSearchUsed?: boolean
  searchQuery?: string
  isSearchResult?: boolean
  searchResults?: Array<{
    id: string
    type: 'conversation' | 'message' | 'web'
    title: string
    snippet: string
    url?: string
    created_at?: string
    conversation_id?: number
  }>
}

export const SUGGESTIONS: Suggestion[] = [
  { icon: '✨', label: 'Create' },
  { icon: '📋', label: 'Explore' },
  { icon: '💻', label: 'Code' },
  { icon: '🎓', label: 'Learn' },
]

export const EXAMPLE_PROMPTS = [
  'How does AI work?',
  'Are black holes real?',
  'How many Rs are in the word "strawberry"?',
  'What is the meaning of life?',
]

// Fallback models shown in dropdown when backend has no models yet
const FALLBACK_MODELS: ApiModelItem[] = [
  { model_id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { model_id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { model_id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct', provider: 'meta-llama' },
  { model_id: 'google/gemma-2-9b-it', name: 'Gemma 2 9B IT', provider: 'google' },
  { model_id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B Instruct', provider: 'mistral' },
]

function AppContent() {
  const { user } = useAuth();
  const [message, setMessage] = useState('')
  const [items, setItems] = useState<ChatItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [models, setModels] = useState<ApiModelItem[]>([])
  const [conversations, setConversations] = useState<ApiConversation[]>([])

  // Removed auto-scroll to keep main page from scrolling

  // Load first available model from backend; if none, try to sync then reload
  useEffect(() => {
    (async () => {
      try {
        let list = await ModelsAPI.list()
        if (!list || list.length === 0) {
          // Use static fallback list so user can select and chat without DB models
          list = FALLBACK_MODELS
        }
        setModels(list)
        if (list.length > 0) setSelectedModel(list[0].model_id)
      } catch {
        // If backend fails, still expose fallback models
        setModels(FALLBACK_MODELS)
        if (FALLBACK_MODELS.length > 0) setSelectedModel(FALLBACK_MODELS[0].model_id)
      }
    })()
  }, [])

  // Load conversations on mount and when conversation changes (only for authenticated users)
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }
    
    (async () => {
      try {
        const list = await ConversationsAPI.list()
        setConversations(list)
      } catch (e) {
        console.error('Failed to load conversations:', e)
        setConversations([])
      }
    })()
  }, [conversationId, user])

  const mapMessageToItem = (m: ApiMessage): ChatItem => ({
    id: `${m.id}`,
    apiId: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.created_at,
  })

  const openConversation = async (id: number) => {
    try {
      const conv = await ConversationsAPI.get(id)
      setConversationId(conv.id)
      const items = (conv.messages || []).map(mapMessageToItem)
      setItems(items)
    } catch (e) {
      console.error('Failed to open conversation', e)
    }
  }

  const refreshOpenConversation = async () => {
    if (!conversationId) return
    await openConversation(conversationId)
  }

  const deleteConversation = async (id: number) => {
    try {
      await ConversationsAPI.delete(id)
      setConversations(prev => prev.filter(c => c.id !== id))
      if (conversationId === id) {
        setConversationId(null)
        setItems([])
      }
    } catch (e) {
      console.error('Failed to delete conversation', e)
    }
  }

  const renameConversation = async (id: number, title: string) => {
    try {
      const updated = await ConversationsAPI.update(id, { title })
      setConversations(prev => prev.map(c => (c.id === id ? { ...c, title: updated.title } : c)))
    } catch (e) {
      console.error('Failed to rename conversation', e)
    }
  }

  const handleSend = async (searchMode: boolean = false) => {
    const text = message.trim()
    if (!text) return
    
    // If user is not authenticated and trying to chat (not search), show login message
    if (!user && !searchMode) {
      const userItem: ChatItem = { id: generateUUID(), role: 'user', content: text }
      const loginPromptItem: ChatItem = {
        id: generateUUID(),
        role: 'assistant',
        content: 'Please log in or register to start chatting with AI models. You can use the login button in the top right corner.',
      }
      setItems(prev => [...prev, userItem, loginPromptItem])
      setMessage('')
      return
    }
    
    const userItem: ChatItem = { id: generateUUID(), role: 'user', content: text }
    setItems(prev => [...prev, userItem])
    setMessage('')
    
    // If in search mode, perform search instead of AI chat
    if (searchMode) {
      try {
        // Show searching indicator
        const searchingItem: ChatItem = {
          id: generateUUID(),
          role: 'assistant',
          content: 'Searching...',
          isSearchResult: true
        }
        setItems(prev => [...prev, searchingItem])
        
        // Perform search
        const searchResponse = await SearchAPI.search({
          query: text,
          type: 'all',
          limit: 10
        })
        
        // Remove searching indicator and show results
        setItems(prev => prev.filter(item => item.id !== searchingItem.id))
        
        if (searchResponse.results.length > 0) {
          const searchResultItem: ChatItem = {
            id: generateUUID(),
            role: 'assistant',
            content: `Found ${searchResponse.results.length} results for "${text}"`,
            isSearchResult: true,
            searchResults: searchResponse.results.map(result => ({
              id: result.id,
              type: result.type,
              title: result.title,
              snippet: result.snippet,
              url: result.url,
              created_at: result.created_at,
              conversation_id: result.conversation_id
            }))
          }
          setItems(prev => [...prev, searchResultItem])
        } else {
          const noResultsItem: ChatItem = {
            id: generateUUID(),
            role: 'assistant',
            content: `No results found for "${text}". Try different keywords or check your spelling.`,
            isSearchResult: true
          }
          setItems(prev => [...prev, noResultsItem])
        }
        
      } catch (error) {
        console.error('Search failed:', error)
        const errorItem: ChatItem = {
          id: generateUUID(),
          role: 'assistant',
          content: 'Search failed. Please try again.',
          isSearchResult: true
        }
        setItems(prev => [...prev, errorItem])
      }
      return
    }

    ;(async () => {
      if (!selectedModel) {
        const assistantItem: ChatItem = {
          id: generateUUID(),
          role: 'assistant',
          content: `You asked: ${text}`,
        }
        setItems(prev => [...prev, assistantItem])
        return
      }

      try {
        const assistantId = generateUUID()
        let accumulated = ''
        setItems(prev => [...prev, { 
          id: assistantId, 
          role: 'assistant', 
          content: '', 
          webSearchUsed: enableWebSearch,
          searchQuery: enableWebSearch ? searchContext.searchQuery : undefined
        }])

        // Analyze if this message would benefit from web search
        const searchContext = analyzeSearchContext(text);
        const isDef = isDefinitionQuery(text);
        
        // Use web search for current events but not for definitions
        const enableWebSearch = searchContext.shouldUseWebSearch && !isDef;
        
        console.log('Smart search analysis:', {
          query: text,
          shouldUseWebSearch: searchContext.shouldUseWebSearch,
          isDefinition: isDef,
          enableWebSearch,
          reason: searchContext.reason,
          searchQuery: searchContext.searchQuery
        });
        
        const meta = await ChatAPI.sendStream(
          {
            model: selectedModel,
            message: text,
            conversation_id: conversationId ?? undefined,
            enable_web_search: enableWebSearch,
            search_query: enableWebSearch ? searchContext.searchQuery : undefined,
            system_prompt: enableWebSearch ? generateWebSearchSystemPrompt() : undefined,
          },
          (token) => {
            accumulated += token
            setItems(prev => prev.map(it => it.id === assistantId ? { ...it, content: accumulated } : it))
          },
          (info) => {
            if (info?.conversation_id && !conversationId) {
              setConversationId(info.conversation_id)
            }
          }
        )

        if (meta?.conversation_id && !conversationId) {
          setConversationId(meta.conversation_id)
        }
        // Refresh the conversation list in sidebar (best-effort)
        try { setConversations(await ConversationsAPI.list()) } catch {}
      } catch (e: any) {
        const assistantItem: ChatItem = {
          id: generateUUID(),
          role: 'assistant',
          content: `Error contacting server: ${e?.message ?? 'Unknown error'}`,
        }
        setItems(prev => [...prev, assistantItem])
      }
    })()
  }

  const useExample = (text: string) => setMessage(text)
  const handleNewChat = () => {
    setItems([])
    setMessage('')
    setConversationId(null)
  }

  // Message actions
  const editMessage = async (messageId: number, content: string) => {
    await MessagesAPI.edit(messageId, content)
    await refreshOpenConversation()
  }

  const deleteMessage = async (messageId: number) => {
    await MessagesAPI.delete(messageId)
    await refreshOpenConversation()
  }

  const regenerateMessage = async (messageId: number) => {
    await MessagesAPI.regenerate(messageId)
    await refreshOpenConversation()
  }

  const editAndContinue = async (messageId: number, content: string) => {
    await MessagesAPI.editAndContinue(messageId, content)
    await refreshOpenConversation()
  }

  const homeProps = {
    message, setMessage, items, setItems, sidebarOpen, setSidebarOpen,
    handleSend, handleNewChat, useExample,
    models, selectedModel, setSelectedModel,
    conversationId, conversations,
    openConversation, deleteConversation, renameConversation,
    editMessage, deleteMessage, regenerateMessage, editAndContinue
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Public landing page at root: shows main interface until user interacts */}
      <Route path="/" element={<Home {...homeProps} publicMode />} />
      {/* Auth-only routes */}
      <Route path="/projectsPage" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/NewProjectCreate" element={<ProtectedRoute><NewProjectCreate /></ProtectedRoute>} />
      <Route path="/CreateProject/:projectId?" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </AuthProvider>
  )
}

export default App
