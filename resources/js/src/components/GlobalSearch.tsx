import React, { useState, useEffect, useRef } from 'react';
import { SearchAPI, type SearchResult, type SearchResponse } from '../api/client';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'conversations' | 'web'>('all');
  const [searchTime, setSearchTime] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let response: SearchResponse;
      
      if (searchType === 'web') {
        response = await SearchAPI.webSearch(searchQuery.trim());
      } else {
        response = await SearchAPI.search({
          query: searchQuery.trim(),
          type: searchType === 'all' ? undefined : searchType,
          limit: 20
        });
      }
      
      setResults(response.results);
      setSearchTime(response.search_time_ms);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, searchType]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'message':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 4z" />
          </svg>
        );
      case 'web':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div 
        className="w-full max-w-2xl mx-4 rounded-lg shadow-xl border"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-primary)',
          maxHeight: '70vh'
        }}
      >
        {/* Search Header */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                style={{ color: 'var(--text-tertiary)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={searchInputRef}
                className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none text-base"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Search conversations, messages, or the web..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--accent-primary)] border-t-transparent"></div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search Type Filters */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', icon: '🔍' },
              { key: 'conversations', label: 'Conversations', icon: '💬' },
              { key: 'web', label: 'Web', icon: '🌐' }
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setSearchType(type.key as any)}
                className="px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: searchType === type.key ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: searchType === type.key ? 'white' : 'var(--text-primary)',
                  border: `1px solid ${searchType === type.key ? 'var(--accent-primary)' : 'var(--border-secondary)'}`
                }}
              >
                <span>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
          
          {/* Search Stats */}
          {results.length > 0 && (
            <div className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Found {results.length} results in {searchTime}ms
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && query.trim() && !loading && (
            <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
              <svg className="mx-auto mb-4 w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords or search the web for current information.</p>
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}-${index}`}
              className="p-4 border-b cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border-secondary)' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => {
                onSelectResult(result);
                onClose();
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {getResultIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {result.title}
                    </h3>
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
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {new URL(result.url).hostname}
                        </a>
                      ) : result.created_at ? (
                        formatDate(result.created_at)
                      ) : ''}
                    </span>
                    {result.relevance_score && (
                      <span>
                        {Math.round(result.relevance_score * 100)}% relevant
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {query.trim() && (
          <div className="p-4 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Quick Actions:
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleSearch(`latest news about ${query}`)}
                className="px-3 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-secondary)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }}
              >
                📰 Latest news
              </button>
              <button
                onClick={() => handleSearch(`what is ${query} definition explanation`)}
                className="px-3 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-secondary)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }}
              >
                📚 Learn about
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;