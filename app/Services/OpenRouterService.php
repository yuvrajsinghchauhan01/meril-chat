<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterService

{
    protected $apiKey;
    protected $baseUrl = 'https://openrouter.ai/api/v1';
    protected $siteUrl;
    protected $siteName;

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.api_key');
        $this->siteUrl = config('services.openrouter.site_url', config('app.url'));
        $this->siteName = config('services.openrouter.site_name', config('app.name'));
    }

    

    /**
     * Send a chat completion request
     */
    public function chat(string $model, array $messages, array $options = [])
    {
        try {
            $payload = array_merge([
                'model' => $model,
                'messages' => $messages,
            ], $options);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'HTTP-Referer' => $this->siteUrl,
                'X-Title' => $this->siteName,
                'Content-Type' => 'application/json',
            ])->timeout(120)->post($this->baseUrl . '/chat/completions', $payload);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'message' => $data['choices'][0]['message']['content'] ?? '',
                    'model' => $data['model'] ?? $model,
                    'usage' => $data['usage'] ?? null,
                    'id' => $data['id'] ?? null,
                    'finish_reason' => $data['choices'][0]['finish_reason'] ?? null,
                ];
            }

            $errorData = $response->json();
            return [
                'success' => false,
                'error' => $errorData['error']['message'] ?? 'Unknown error',
                'code' => $errorData['error']['code'] ?? null,
                'status' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('OpenRouter Chat Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Stream chat completion with Server-Sent Events
     */
    public function streamChat(string $model, array $messages, array $options = [])
    {
        $payload = array_merge([
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
        ], $options);

        return response()->stream(function () use ($payload) {
            $ch = curl_init($this->baseUrl . '/chat/completions');
            
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $this->apiKey,
                    'HTTP-Referer: ' . $this->siteUrl,
                    'X-Title: ' . $this->siteName,
                    'Content-Type: application/json',
                    'Accept: text/event-stream',
                ],
                CURLOPT_RETURNTRANSFER => false,
                CURLOPT_WRITEFUNCTION => function ($curl, $data) {
                    echo $data;
                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                    return strlen($data);
                },
            ]);

            curl_exec($ch);
            curl_close($ch);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }






    /**
     * Get all available models from OpenRouter
     */
    public function getModels()
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'HTTP-Referer' => $this->siteUrl,
                'X-Title' => $this->siteName,
            ])->retry(2, 200)->timeout(10)->get($this->baseUrl . '/models');

            if ($response->successful()) {
                return $response->json('data', []);
            }

            Log::error('OpenRouter API Error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('OpenRouter Exception: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Send a chat completion request (non-streaming)
     */
    public function chatCompletion(string $model, array $messages, array $options = [])
    {
        try {
            $payload = array_merge([
                'model' => $model,
                'messages' => $messages,
            ], $options);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'HTTP-Referer' => $this->siteUrl,
                'X-Title' => $this->siteName,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->baseUrl . '/chat/completions', $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'error' => $response->json('error.message', 'Unknown error'),
                'status' => $response->status(),
                'body' => $response->json(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Test a model with a simple prompt
     */
    public function testModel(string $modelId, string $prompt = "Hello! Please respond with 'OK' if you're working correctly.")
    {
        $result = $this->chatCompletion($modelId, [
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ], [
            'max_tokens' => 100,
        ]);

        if ($result['success']) {
            $data = $result['data'];
            return [
                'success' => true,
                'response' => $data['choices'][0]['message']['content'] ?? '',
                'usage' => $data['usage'] ?? null,
                'model' => $data['model'] ?? $modelId,
                'id' => $data['id'] ?? null,
            ];
        }

        return $result;
    }

    /**
     * Get pricing information for a specific model
     */
    public function getModelPricing(string $modelId)
    {
        $models = $this->getModels();
        
        foreach ($models as $model) {
            if ($model['id'] === $modelId) {
                return [
                    'model_id' => $model['id'],
                    'name' => $model['name'] ?? $model['id'],
                    'pricing' => $model['pricing'] ?? null,
                    'context_length' => $model['context_length'] ?? null,
                    'top_provider' => $model['top_provider'] ?? null,
                ];
            }
        }

        return null;
    }

    /**
     * Stream chat completion (for SSE)
     */
    public function streamChatCompletion(string $model, array $messages, array $options = [])
    {
        $payload = array_merge([
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
        ], $options);

        $ch = curl_init($this->baseUrl . '/chat/completions');
        
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'HTTP-Referer: ' . $this->siteUrl,
                'X-Title: ' . $this->siteName,
                'Content-Type: application/json',
            ],
            CURLOPT_WRITEFUNCTION => function($curl, $data) {
                echo $data;
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
                return strlen($data);
            },
        ]);

        return $ch;
    }
}