import { useEffect, useMemo, useRef, useState } from 'react'
import { ModelsAPI, type ApiModelItem } from '../api/client'

interface ModelSelectorProps {
  selectedModelId?: string | null
  onModelChange?: (modelId: string) => void
}

function providerIcon(provider?: string) {
  const p = (provider || '').toLowerCase()
  if (p.includes('google') || p.includes('gemini')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
      </svg>
    )
  }
  if (p.includes('openai') || p.includes('gpt')) {
    return (
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white">
          <circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
        </svg>
      </div>
    )
  }
  if (p.includes('anthropic') || p.includes('claude')) {
    return (
      <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
        <span className="text-xs font-bold text-white">AI</span>
      </div>
    )
  }
  // default gem icon
  return <span className="text-lg">💎</span>
}

// Model categorization based on capabilities and characteristics
function getModelCategory(model: ApiModelItem): string[] {
  const name = model.name.toLowerCase()
  const modelId = model.model_id.toLowerCase()
  const categories: string[] = []
  
  // Fast models (smaller, optimized for speed)
  if (name.includes('mini') || name.includes('fast') || name.includes('turbo') || 
      name.includes('flash') || modelId.includes('8b') || modelId.includes('7b') || 
      name.includes('3.5') || name.includes('haiku')) {
    categories.push('fast')
  }
  
  // Vision models (multimodal, can process images)
  if (name.includes('vision') || name.includes('gpt-4') || name.includes('claude-3') || 
      name.includes('gemini') || name.includes('multimodal') || name.includes('omni')) {
    categories.push('vision')
  }
  
  // Reasoning models (large, optimized for complex reasoning)
  if (name.includes('reasoning') || name.includes('o1') || name.includes('claude-3-opus') || 
      name.includes('70b') || name.includes('405b') || name.includes('pro') || 
      name.includes('ultra') || name.includes('large')) {
    categories.push('reasoning')
  }
  
  // Coding models (optimized for code generation)
  if (name.includes('code') || name.includes('codestral') || name.includes('deepseek') || 
      name.includes('phind') || modelId.includes('code')) {
    categories.push('coding')
  }
  
  // Free models (typically open source or free tier)
  if (name.includes('mini') || name.includes('free') || 
      model.provider?.toLowerCase().includes('meta') || 
      model.provider?.toLowerCase().includes('google') ||
      modelId.includes('llama') || modelId.includes('gemma') || 
      name.includes('mistral-7b') || name.includes('phi')) {
    categories.push('free')
  }
  
  // Premium models (high-end, typically paid)
  if (name.includes('gpt-4') || name.includes('claude-3-opus') || 
      name.includes('claude-3-sonnet') || name.includes('o1-preview') || 
      name.includes('gemini-1.5-pro')) {
    categories.push('premium')
  }
  
  return categories
}

// Filter models based on category
function filterModelsByCategory(models: ApiModelItem[], category: string): ApiModelItem[] {
  if (category === 'all') return models
  
  return models.filter(model => {
    const categories = getModelCategory(model)
    return categories.includes(category)
  })
}

export default function ModelSelector({ selectedModelId, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllView, setShowAllView] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [items, setItems] = useState<ApiModelItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 50, total: 0 })

  const dropdownRef = useRef<HTMLDivElement>(null)

  const perPage = 50

  const selected = useMemo(() => {
    return items.find(i => i.model_id === selectedModelId)
  }, [items, selectedModelId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch from backend when dropdown opens, page or search changes
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await ModelsAPI.listPaginated({ page, per_page: perPage, search: searchQuery || undefined })
        if (cancelled) return
        setItems(res.items)
        setPagination(res.pagination)
      } catch (e: any) {
        if (cancelled) return
        setError(e?.message || 'Failed to load models')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [isOpen, page, searchQuery])

  // Reset page when search or category changes
  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedCategory])

  const handleSelect = (id: string) => {
    onModelChange?.(id)
    setIsOpen(false)
  }

  // Apply category filtering to the fetched items
  const filteredItems = useMemo(() => {
    return filterModelsByCategory(items, selectedCategory)
  }, [items, selectedCategory])

  const getPageNumbers = () => {
    const totalPages = pagination.last_page || 1
    const currentPage = pagination.current_page || 1
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      pages.push(currentPage - 1)
      pages.push(currentPage)
      pages.push(currentPage + 1)
      pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer min-w-[160px] justify-between"
        style={{ border: '1px solid var(--border-secondary)', backgroundColor: 'var(--bg-quaternary)', color: 'var(--text-primary)' }}
        onClick={() => setIsOpen(o => !o)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {providerIcon(selected?.provider)}
          <span className="truncate text-xs sm:text-sm">{selected?.name ?? selectedModelId ?? 'Select model'}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute bottom-full left-0 mb-2 rounded-xl border shadow-lg z-40 overflow-hidden w-[90vw] max-w-[600px]`}
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.3)' }}
        >
          {/* Search */}
          <div className="p-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Models', icon: '🔍' },
                { key: 'fast', label: 'Fast', icon: '⚡' },
                { key: 'vision', label: 'Vision', icon: '👁️' },
                { key: 'reasoning', label: 'Reasoning', icon: '🧠' },
                { key: 'coding', label: 'Coding', icon: '💻' },
                { key: 'free', label: 'Free', icon: '🆓' },
                { key: 'premium', label: 'Premium', icon: '⭐' }
              ].map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className="px-2 py-1 rounded-full text-xs transition-colors flex items-center gap-1 border"
                  style={{
                    backgroundColor: selectedCategory === category.key ? 'var(--accent-primary)' : 'var(--bg-quaternary)',
                    color: selectedCategory === category.key ? 'white' : 'var(--text-primary)',
                    borderColor: selectedCategory === category.key ? 'var(--accent-primary)' : 'var(--border-secondary)'
                  }}
                >
                  <span>{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm opacity-70">Loading models...</div>
            ) : error ? (
              <div className="p-4 text-sm text-red-500">{error}</div>
            ) : filteredItems.length === 0 ? (
              <div className="p-4 text-sm opacity-70">{selectedCategory === 'all' ? 'No models found' : `No ${selectedCategory} models found`}</div>
            ) : !showAllView ? (
              <div>
                {filteredItems.map((model) => (
                  <button
                    key={model.model_id}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    onClick={() => handleSelect(model.model_id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {providerIcon(model.provider)}
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {model.name}
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs opacity-70">{model.provider}</span>
                          {getModelCategory(model).slice(0, 3).map((cat) => (
                            <span
                              key={cat}
                              className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: cat === 'fast' ? '#22c55e20' : 
                                                cat === 'vision' ? '#3b82f620' : 
                                                cat === 'reasoning' ? '#8b5cf620' : 
                                                cat === 'coding' ? '#f59e0b20' : 
                                                cat === 'free' ? '#10b98120' : 
                                                cat === 'premium' ? '#ef444420' : '#64748b20',
                                color: cat === 'fast' ? '#22c55e' : 
                                       cat === 'vision' ? '#3b82f6' : 
                                       cat === 'reasoning' ? '#8b5cf6' : 
                                       cat === 'coding' ? '#f59e0b' : 
                                       cat === 'free' ? '#10b981' : 
                                       cat === 'premium' ? '#ef4444' : '#64748b'
                              }}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {filteredItems.map(m => (
                    <button key={m.model_id} className="p-3 rounded-lg border transition-colors hover:bg-[var(--bg-hover)] cursor-pointer" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }} onClick={() => handleSelect(m.model_id)}>
                      <div className="flex flex-col items-center text-center">
                        <div className="w-8 h-8 mb-2 flex items-center justify-center relative">{providerIcon(m.provider)}</div>
                        <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{m.name}</div>
                        <div className="text-[10px] opacity-70">{m.provider || ''}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer with pagination and toggle */}
          <div className="p-3 border-t flex items-center justify-between gap-2 flex-wrap" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 text-sm rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: 'var(--text-primary)' }} onClick={() => setPage(1)} disabled={pagination.current_page <= 1}>First</button>
              <button className="px-2 py-1 text-sm rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: 'var(--text-primary)' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pagination.current_page <= 1}>«</button>
              {getPageNumbers().map((p, i) => (
                typeof p === 'number' ? (
                  <button key={i} className={`w-8 h-8 text-sm rounded-full transition-all ${pagination.current_page === p ? 'shadow-lg' : 'hover:bg-[var(--bg-hover)]'}`} style={{ backgroundColor: pagination.current_page === p ? '#3b82f6' : 'transparent', color: pagination.current_page === p ? 'white' : 'var(--text-primary)' }} onClick={() => setPage(p)}>{p}</button>
                ) : (
                  <span key={i} className="px-2 opacity-50" style={{ color: 'var(--text-primary)' }}>{p}</span>
                )
              ))}
              <button className="px-2 py-1 text-sm rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: 'var(--text-primary)' }} onClick={() => setPage(p => Math.min((pagination.last_page || p + 1), p + 1))} disabled={pagination.current_page >= pagination.last_page}>»</button>
              <button className="px-2 py-1 text-sm rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: 'var(--text-primary)' }} onClick={() => setPage(pagination.last_page)} disabled={pagination.current_page >= pagination.last_page}>Last</button>
            </div>
            <button className="px-3 py-1.5 text-sm rounded-lg hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-primary)' }} onClick={() => setShowAllView(v => !v)}>
              {showAllView ? 'List view' : 'Show all (grid)'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
