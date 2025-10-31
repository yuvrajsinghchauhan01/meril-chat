<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SearchController extends Controller
{
    /**
     * Search conversations and messages
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:1|max:500',
            'type' => 'nullable|in:conversations,messages,web,all',
            'limit' => 'nullable|integer|min:1|max:50'
        ]);

        $query = $request->input('query');
        $type = $request->input('type', 'all');
        $limit = $request->input('limit', 20);
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required',
                'error' => 'User must be logged in to search'
            ], 401);
        }

        $startTime = microtime(true);
        $results = [];

        try {
            Log::info('Starting search', ['query' => $query, 'type' => $type, 'user_id' => $userId]);
            
            // Search conversations
            if ($type === 'conversations' || $type === 'all') {
                $conversationResults = $this->searchConversations($query, $userId, $limit);
                $results = array_merge($results, $conversationResults);
            }

            // Search messages
            if ($type === 'messages' || $type === 'all') {
                $messageResults = $this->searchMessages($query, $userId, $limit);
                $results = array_merge($results, $messageResults);
            }
            
            // Search web (for current affairs and real-time info)
            if ($type === 'web' || $type === 'all') {
                $webResults = $this->performWebSearch($query);
                $results = array_merge($results, $webResults);
            }

            // Sort by relevance (you can implement more sophisticated scoring)
            usort($results, function($a, $b) {
                return ($b['relevance_score'] ?? 0) <=> ($a['relevance_score'] ?? 0);
            });

            // Limit results
            $results = array_slice($results, 0, $limit);

            $searchTime = round((microtime(true) - $startTime) * 1000, 2);

            return response()->json([
                'success' => true,
                'data' => [
                    'results' => $results,
                    'total' => count($results),
                    'query' => $query,
                    'search_time_ms' => $searchTime
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Search failed', [
                'error' => $e->getMessage(),
                'query' => $query,
                'user_id' => $userId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Search failed. Please try again.',
                'error' => app()->environment('local') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Web search using external API
     */
    public function webSearch(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:1|max:500'
        ]);

        $query = $request->input('query');
        $startTime = microtime(true);

        try {
            // For now, we'll create mock web search results
            // You can integrate with Tavily, SerpAPI, or other search APIs here
            $webResults = $this->performWebSearch($query);

            $searchTime = round((microtime(true) - $startTime) * 1000, 2);

            return response()->json([
                'success' => true,
                'data' => [
                    'results' => $webResults,
                    'total' => count($webResults),
                    'query' => $query,
                    'search_time_ms' => $searchTime
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Web search failed', [
                'error' => $e->getMessage(),
                'query' => $query
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Web search failed. Please try again.',
                'error' => app()->environment('local') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Search conversations by title and messages content
     */
    private function searchConversations(string $query, int $userId, int $limit): array
    {
        // Search conversations by title (case-insensitive)
        $conversations = DB::table('conversations')
            ->where('user_id', $userId)
            ->whereRaw('LOWER(title) LIKE LOWER(?)', ["%{$query}%"])
            ->select('id', 'title', 'created_at', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->limit($limit)
            ->get();

        $results = [];
        foreach ($conversations as $conv) {
            // Get a preview snippet from the conversation's messages
            $snippet = $this->getConversationSnippet($conv->id, $query);
            
            $results[] = [
                'id' => 'conv_' . $conv->id,
                'type' => 'conversation',
                'title' => $conv->title ?: "Chat #{$conv->id}",
                'content' => $snippet,
                'snippet' => $snippet,
                'conversation_id' => $conv->id,
                'created_at' => $conv->created_at,
                'relevance_score' => $this->calculateRelevanceScore($query, $conv->title, $snippet)
            ];
        }

        return $results;
    }

    /**
     * Search messages content
     */
    private function searchMessages(string $query, int $userId, int $limit): array
    {
        $messages = DB::table('messages')
            ->join('conversations', 'messages.conversation_id', '=', 'conversations.id')
            ->where('conversations.user_id', $userId)
            ->where('messages.role', '!=', 'system')
            ->whereRaw('LOWER(messages.content) LIKE LOWER(?)', ["%{$query}%"])
            ->select(
                'messages.id',
                'messages.content',
                'messages.role',
                'messages.created_at',
                'conversations.id as conversation_id',
                'conversations.title as conversation_title'
            )
            ->orderBy('messages.created_at', 'desc')
            ->limit($limit)
            ->get();

        $results = [];
        foreach ($messages as $msg) {
            $snippet = $this->createSnippet($msg->content, $query);
            
            $results[] = [
                'id' => 'msg_' . $msg->id,
                'type' => 'message',
                'title' => ($msg->conversation_title ?: "Chat #{$msg->conversation_id}") . " - {$msg->role} message",
                'content' => $msg->content,
                'snippet' => $snippet,
                'conversation_id' => $msg->conversation_id,
                'created_at' => $msg->created_at,
                'relevance_score' => $this->calculateRelevanceScore($query, $msg->content, $snippet)
            ];
        }

        return $results;
    }

    /**
     * Get a snippet from conversation messages
     */
    private function getConversationSnippet(int $conversationId, string $query): string
    {
        $message = DB::table('messages')
            ->where('conversation_id', $conversationId)
            ->where('content', 'LIKE', "%{$query}%")
            ->orderBy('created_at', 'desc')
            ->first();

        if ($message) {
            return $this->createSnippet($message->content, $query);
        }

        // If no matching message, get the most recent message
        $recentMessage = DB::table('messages')
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'desc')
            ->first();

        return $recentMessage ? substr($recentMessage->content, 0, 150) . '...' : 'No messages found';
    }

    /**
     * Create a snippet highlighting the search term
     */
    private function createSnippet(string $content, string $query, int $maxLength = 200): string
    {
        $pos = stripos($content, $query);
        
        if ($pos !== false) {
            $start = max(0, $pos - 50);
            $snippet = substr($content, $start, $maxLength);
            
            // Add ellipsis if needed
            if ($start > 0) $snippet = '...' . $snippet;
            if (strlen($content) > $start + $maxLength) $snippet .= '...';
            
            return $snippet;
        }
        
        return substr($content, 0, $maxLength) . (strlen($content) > $maxLength ? '...' : '');
    }

    /**
     * Calculate relevance score (simple implementation)
     */
    private function calculateRelevanceScore(string $query, string $title, string $content): float
    {
        $score = 0;
        $queryLower = strtolower($query);
        $titleLower = strtolower($title);
        $contentLower = strtolower($content);

        // Title match gets higher score
        if (strpos($titleLower, $queryLower) !== false) {
            $score += 0.8;
        }

        // Content match
        if (strpos($contentLower, $queryLower) !== false) {
            $score += 0.5;
        }

        // Word count matches
        $queryWords = explode(' ', $queryLower);
        foreach ($queryWords as $word) {
            if (strlen($word) > 2) {
                if (strpos($titleLower, $word) !== false) $score += 0.3;
                if (strpos($contentLower, $word) !== false) $score += 0.1;
            }
        }

        return min($score, 1.0); // Cap at 1.0
    }

    /**
     * Perform web search using Tavily API or fallback to mock results
     */
    private function performWebSearch(string $query): array
    {
        // Try Tavily API first if API key is available
        if (config('services.tavily.api_key')) {
            try {
                $response = Http::timeout(10)->withHeaders([
                    'Content-Type' => 'application/json',
                ])->post('https://api.tavily.com/search', [
                    'api_key' => config('services.tavily.api_key'),
                    'query' => $query,
                    'search_depth' => 'basic',
                    'include_answer' => false,
                    'include_images' => false,
                    'include_image_descriptions' => false,
                    'max_results' => 8
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $results = [];
                    
                    foreach ($data['results'] ?? [] as $result) {
                        $results[] = [
                            'id' => 'web_' . uniqid(),
                            'type' => 'web',
                            'title' => $result['title'] ?? 'Web Result',
                            'content' => $result['content'] ?? '',
                            'snippet' => $this->createSnippet($result['content'] ?? '', $query, 180),
                            'url' => $result['url'] ?? '',
                            'created_at' => now()->toISOString(),
                            'relevance_score' => $result['score'] ?? 0.5
                        ];
                    }
                    
                    Log::info('Tavily search successful', ['query' => $query, 'results_count' => count($results)]);
                    return $results;
                }
            } catch (\Exception $e) {
                Log::error('Tavily API error', ['error' => $e->getMessage(), 'query' => $query]);
            }
        }

        // Fallback to DuckDuckGo Instant Answer API or mock results
        return $this->fallbackWebSearch($query);
    }

    /**
     * Fallback web search using DuckDuckGo or mock results
     */
    private function fallbackWebSearch(string $query): array
    {
        try {
            // Try DuckDuckGo Instant Answer API (free, no API key required)
            $response = Http::timeout(5)->get('https://api.duckduckgo.com/', [
                'q' => $query,
                'format' => 'json',
                'no_html' => '1',
                'skip_disambig' => '1'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $results = [];

                // Add instant answer if available
                if (!empty($data['Abstract'])) {
                    $results[] = [
                        'id' => 'web_ddg_abstract_' . uniqid(),
                        'type' => 'web',
                        'title' => $data['Heading'] ?: "About {$query}",
                        'content' => $data['Abstract'],
                        'snippet' => $this->createSnippet($data['Abstract'], $query, 180),
                        'url' => $data['AbstractURL'] ?: "https://duckduckgo.com/?q=" . urlencode($query),
                        'created_at' => now()->toISOString(),
                        'relevance_score' => 0.9
                    ];
                }

                // Add related topics
                foreach ($data['RelatedTopics'] ?? [] as $topic) {
                    if (is_array($topic) && isset($topic['Text']) && count($results) < 5) {
                        $results[] = [
                            'id' => 'web_ddg_topic_' . uniqid(),
                            'type' => 'web',
                            'title' => $this->extractTitleFromDDGTopic($topic['Text']),
                            'content' => $topic['Text'],
                            'snippet' => $this->createSnippet($topic['Text'], $query, 180),
                            'url' => $topic['FirstURL'] ?? "https://duckduckgo.com/?q=" . urlencode($query),
                            'created_at' => now()->toISOString(),
                            'relevance_score' => 0.7
                        ];
                    }
                }

                if (count($results) > 0) {
                    Log::info('DuckDuckGo search successful', ['query' => $query, 'results_count' => count($results)]);
                    return $results;
                }
            }
        } catch (\Exception $e) {
            Log::warning('DuckDuckGo API error', ['error' => $e->getMessage()]);
        }

        // Final fallback to mock results
        return $this->getMockWebResults($query);
    }

    /**
     * Extract title from DuckDuckGo topic text
     */
    private function extractTitleFromDDGTopic(string $text): string
    {
        $parts = explode(' - ', $text, 2);
        return trim($parts[0]);
    }

    /**
     * Generate mock web search results as final fallback with smart suggestions
     */
    private function getMockWebResults(string $query): array
    {
        Log::info('Using mock web search results', ['query' => $query]);
        
        $results = [];
        $queryLower = strtolower($query);
        
        // Smart suggestions based on query type
        if (strpos($queryLower, 'cricket') !== false || strpos($queryLower, 'match') !== false || strpos($queryLower, 'sport') !== false || strpos($queryLower, 'football') !== false) {
            $results[] = [
                'id' => 'web_mock_sports_' . uniqid(),
                'type' => 'web',
                'title' => "Live Sports Matches & Updates",
                'content' => "Get real-time sports match schedules, live scores, and updates. Check current matches, upcoming fixtures, and live commentary for football, cricket, and more.",
                'snippet' => "Find live sports matches, scores, and schedules. For real-time updates, click to visit sports websites directly.",
                'url' => "https://www.espn.com/soccer/",
                'created_at' => now()->toISOString(),
                'relevance_score' => 0.9
            ];
            
            $results[] = [
                'id' => 'web_mock_sports2_' . uniqid(),
                'type' => 'web',
                'title' => "BBC Sport - Live Scores & News",
                'content' => "Live sports scores, match schedules, news, and updates from around the world including football, cricket, and other sports.",
                'snippet' => "Check BBC Sport for live scores, match schedules, and breaking sports news.",
                'url' => "https://www.bbc.com/sport",
                'created_at' => now()->toISOString(),
                'relevance_score' => 0.85
            ];
        }
        elseif (strpos($queryLower, 'weather') !== false) {
            $results[] = [
                'id' => 'web_mock_weather_' . uniqid(),
                'type' => 'web',
                'title' => "Current Weather Conditions & Forecast",
                'content' => "Get real-time weather information, current conditions, and detailed forecasts for your location.",
                'snippet' => "Check current weather conditions and forecasts. Click to visit weather websites for live data.",
                'url' => "https://www.weather.com",
                'created_at' => now()->toISOString(),
                'relevance_score' => 0.9
            ];
        }
        elseif (strpos($queryLower, 'news') !== false || strpos($queryLower, 'current') !== false || strpos($queryLower, 'today') !== false) {
            $results[] = [
                'id' => 'web_mock_news_' . uniqid(),
                'type' => 'web',
                'title' => "Latest News & Current Affairs",
                'content' => "Stay updated with the latest breaking news, current affairs, and trending stories from around the world.",
                'snippet' => "Get the latest news and current affairs. Click to search Google News for real-time updates.",
                'url' => "https://www.google.com/search?q=" . urlencode($query) . "&tbm=nws",
                'created_at' => now()->toISOString(),
                'relevance_score' => 0.9
            ];
        }
        
        // Always add Google search option
        $results[] = [
            'id' => 'web_mock_google_' . uniqid(),
            'type' => 'web',
            'title' => "Search Google for: {$query}",
            'content' => "Get the most current and comprehensive results by searching Google directly. This will show real-time information, news, and updates.",
            'snippet' => "Click to search Google for real-time results about {$query}. This opens in a new tab with live search results.",
            'url' => "https://www.google.com/search?q=" . urlencode($query),
            'created_at' => now()->toISOString(),
            'relevance_score' => 0.8
        ];
        
        return array_slice($results, 0, 3); // Limit to 3 results
    }
}
