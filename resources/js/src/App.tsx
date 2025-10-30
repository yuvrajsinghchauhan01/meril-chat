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

export const CATEGORY_PROMPTS: Record<string, string[]> = {
  Create: [
    'Write a short story about a robot discovering emotions',
    'Help me outline a sci-fi novel set in a post-apocalyptic world',
    'Create a character profile for a complex villain with sympathetic motives',
    'Give me 5 creative writing prompts for flash fiction',
  ],
  Explore: [
    'Good books for fans of Rick Rubin',
    'Countries ranked by number of corgis',
    'Most successful companies in the world',
    'How much does Claude cost?',
  ],
  Code: [
    'Write code to invert a binary search tree in Python',
    'What\'s the difference between Promise.all and Promise.allSettled?',
    'Explain React\'s useEffect cleanup function',
    'Best practices for error handling in async/await',
  ],
  Learn: [
    'Beginner\'s guide to TypeScript',
    'Explain the CAP theorem in distributed systems',
    'Why is AI so expensive?',
    'Are black holes real?',
  ],
}

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
  const [isStreaming, setIsStreaming] = useState(false)

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
    if (!text || isStreaming) return

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
    setIsStreaming(true)

    // If in search mode, fetch top results and feed them into the model
    if (searchMode) {
      try {
        const searchingId = generateUUID()
        setItems(prev => [...prev, { id: searchingId, role: 'assistant', content: 'Searching top results...' }])

        // Get top results across sources
        const searchResponse = await SearchAPI.search({
          query: text,
          type: 'all',
          limit: 6,
        })

        // Remove temporary searching message
        setItems(prev => prev.filter(it => it.id !== searchingId))

        // Prefer web results from Tavily; fall back to any results
        const allResults = searchResponse.results || []
        const webOnly = allResults.filter(r => r.type === 'web')
        const top = (webOnly.length > 0 ? webOnly : allResults).slice(0, 3)
        if (top.length === 0) {
          // Proceed with normal chat without web context
          // Recurse into normal path by simulating not in search mode
          // Note: avoid infinite loop by directly executing the normal send flow below
        } else {
          if (!selectedModel) {
            const assistantItem: ChatItem = {
              id: generateUUID(),
              role: 'assistant',
              content: `I found a few sources but no model is selected to compose an answer.`,
            }
            setItems(prev => [...prev, assistantItem])
            return
          }

          // Build a concise context block from the top results
          const sourcesBlock = top
            .map((r, i) => {
              const main = r.content && r.content.length > (r.snippet?.length || 0) ? r.content : r.snippet
              return `Source ${i + 1}: ${r.title}\n${main}${r.url ? `\nURL: ${r.url}` : ''}`
            })
            .join('\n\n')

          const systemWithContext = generateWebSearchSystemPrompt(
            `Use the following verified web results to answer the user's question accurately.\n\n${sourcesBlock}\n\nGuidelines:\n- Do not list links.\n- Synthesize a single, helpful answer using the context.\n- If you cite, refer to (Source 1/2/3).\n- If evidence is weak or conflicting, say so.`
          )

          const assistantId = generateUUID()
          let accumulated = ''
          setItems(prev => [...prev, { id: assistantId, role: 'assistant', content: '', webSearchUsed: true, searchQuery: text }])

          try {
            const meta = await ChatAPI.sendStream(
              {
                model: selectedModel,
                message: text,
                conversation_id: conversationId ?? undefined,
                system_prompt: systemWithContext,
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
            try { setConversations(await ConversationsAPI.list()) } catch { }
          } catch (e: any) {
            setItems(prev => prev.map(it => it.id === assistantId ? { ...it, content: `Error contacting server: ${e?.message ?? 'Unknown error'}` } : it))
          } finally {
            setIsStreaming(false)
          }
          return
        }
      } catch (error) {
        console.error('Search failed:', error)
        const errorItem: ChatItem = { id: generateUUID(), role: 'assistant', content: 'Search failed. Please try again.' }
        setItems(prev => [...prev, errorItem])
        return
      }
      // fall-through to normal chat if no results
    }

    ; (async () => {
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
        try { setConversations(await ConversationsAPI.list()) } catch { }
      } catch (e: any) {
        const assistantItem: ChatItem = {
          id: generateUUID(),
          role: 'assistant',
          content: `Error contacting server: ${e?.message ?? 'Unknown error'}`,
        }
        setItems(prev => [...prev, assistantItem])
      } finally {
        setIsStreaming(false)
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
    editMessage, deleteMessage, regenerateMessage, editAndContinue,
    isStreaming
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
