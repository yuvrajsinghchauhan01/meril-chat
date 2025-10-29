// Smart search utilities to detect when web search should be used

export interface SearchContext {
  shouldUseWebSearch: boolean;
  searchQuery?: string;
  reason?: string;
}

// Keywords that suggest current events or real-time information
const CURRENT_EVENTS_KEYWORDS = [
  'news', 'latest', 'recent', 'today', 'yesterday', 'this week', 'this month', 'current',
  'breaking', 'update', 'new', 'happening', 'now', 'currently', 'ongoing',
  'stock price', 'weather', 'score', 'results', 'election', 'poll',
  'covid', 'pandemic', 'virus', 'outbreak', 'death toll', 'cases',
  'war', 'conflict', 'attack', 'bombing', 'shooting', 'incident',
  'economy', 'inflation', 'recession', 'gdp', 'unemployment',
  'technology', 'ai', 'artificial intelligence', 'release', 'launch',
  'celebrity', 'died', 'death', 'born', 'married', 'divorced',
  'sports', 'game', 'match', 'championship', 'tournament', 'olympics',
  'movie', 'film', 'tv show', 'series', 'premiere', 'trailer',
  'politics', 'politician', 'government', 'president', 'minister',
  'trend', 'trending', 'viral', 'popular', 'top'
];

// Time-related phrases that suggest recency
const TIME_INDICATORS = [
  '2024', '2025', 'this year', 'last year', 'recent', 'recently',
  'today', 'yesterday', 'this morning', 'tonight', 'this evening',
  'this week', 'last week', 'this month', 'last month',
  'what happened', 'what is happening', 'what\'s new', 'what\'s going on'
];

// Question patterns that benefit from web search
const WEB_SEARCH_PATTERNS = [
  /what.*(happened|happening|going on|new|latest)/i,
  /when (did|will|does|is).*(happen|start|end|begin)/i,
  /who (is|was|became|won|died|got)/i,
  /where (is|was|did|will).*(happen|occur)/i,
  /how (much|many|long).*(cost|take|worth)/i,
  /is .* (still|currently|now|today)/i,
  /current (price|status|situation|condition)/i,
  /(latest|recent|new) (news|information|updates?|developments?)/i,
  /(stock|share) price/i,
  /(weather|temperature|forecast)/i,
  /(election|voting|poll) results?/i
];

export function analyzeSearchContext(message: string): SearchContext {
  const lowerMessage = message.toLowerCase().trim();
  
  // Check for explicit web search indicators
  if (lowerMessage.includes('search the web') || 
      lowerMessage.includes('look up') ||
      lowerMessage.includes('find online') ||
      lowerMessage.includes('check online')) {
    return {
      shouldUseWebSearch: true,
      searchQuery: extractSearchQuery(message),
      reason: 'Explicit web search request'
    };
  }
  
  // Check for current events keywords
  const hasCurrentEventsKeywords = CURRENT_EVENTS_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Check for time indicators
  const hasTimeIndicators = TIME_INDICATORS.some(indicator => 
    lowerMessage.includes(indicator)
  );
  
  // Check for web search patterns
  const matchesWebPattern = WEB_SEARCH_PATTERNS.some(pattern => 
    pattern.test(message)
  );
  
  // Score based on indicators
  let score = 0;
  let reasons: string[] = [];
  
  if (hasCurrentEventsKeywords) {
    score += 2;
    reasons.push('Contains current events keywords');
  }
  
  if (hasTimeIndicators) {
    score += 2;
    reasons.push('Contains time-sensitive indicators');
  }
  
  if (matchesWebPattern) {
    score += 3;
    reasons.push('Matches web search patterns');
  }
  
  // Check for specific high-value patterns
  if (lowerMessage.includes('what') && (lowerMessage.includes('latest') || lowerMessage.includes('recent'))) {
    score += 2;
    reasons.push('Asking about latest information');
  }
  
  if (lowerMessage.includes('current') && (lowerMessage.includes('price') || lowerMessage.includes('status'))) {
    score += 2;
    reasons.push('Asking for current data');
  }
  
  // Determine if web search should be used (threshold of 3)
  const shouldUseWebSearch = score >= 3;
  
  return {
    shouldUseWebSearch,
    searchQuery: shouldUseWebSearch ? extractSearchQuery(message) : undefined,
    reason: shouldUseWebSearch ? reasons.join(', ') : 'No clear indicators for web search'
  };
}

function extractSearchQuery(message: string): string {
  // Remove common question words and extract the core search terms
  let query = message
    .replace(/^(what|who|when|where|why|how|can you|could you|please|tell me|explain)/gi, '')
    .replace(/\?+$/g, '')
    .trim();
  
  // Remove filler words
  query = query
    .replace(/\b(is|are|was|were|the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return query || message;
}

// Check if a message is asking about definitions or explanations (less likely to need web search)
export function isDefinitionQuery(message: string): boolean {
  const definitionPatterns = [
    /what is (a |an |the )?([^?]+)\??$/i,
    /define ([^?]+)\??$/i,
    /explain ([^?]+)\??$/i,
    /what does ([^?]+) mean\??$/i,
    /meaning of ([^?]+)\??$/i
  ];
  
  return definitionPatterns.some(pattern => pattern.test(message.trim()));
}

// Generate enhanced system prompt when web search is enabled
export function generateWebSearchSystemPrompt(originalPrompt?: string): string {
  const webSearchPrompt = `You have access to current web search results to provide up-to-date information. When answering questions about recent events, current affairs, real-time data, or time-sensitive information, incorporate the web search results to give accurate and current responses. Always cite sources when using web information.`;
  
  if (originalPrompt) {
    return `${originalPrompt}\n\n${webSearchPrompt}`;
  }
  
  return webSearchPrompt;
}