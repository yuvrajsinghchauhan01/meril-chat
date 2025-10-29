<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiModel;
use App\Services\OpenRouterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class ModelController extends Controller
{
    protected $openRouter;

    public function __construct(OpenRouterService $openRouter)
    {
        $this->openRouter = $openRouter;
    }

    /**
     * GET /api/models
     * Get all available AI models
     */
    public function index(Request $request)
    {
        // Sync models if needed (cached for 1 hour)
        $this->syncModelsIfNeeded();

        $query = AiModel::active();

        // Filter by category
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // Filter by provider
        if ($request->has('provider')) {
            $query->byProvider($request->provider);
        }

        // Search by name or model_id
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('model_id', 'like', '%' . $search . '%');
            });
        }

        // Filter by features
        if ($request->has('supports_vision')) {
            $query->whereJsonContains('architecture->modality', 'image+text');
        }

        if ($request->has('supports_function_calling')) {
            $query->whereJsonContains('architecture->tokenizer', 'function_calling');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        // Special sort for pricing
        if ($sortBy === 'price') {
            $query->orderByRaw('CAST(JSON_EXTRACT(pricing, "$.prompt") AS DECIMAL(10,8)) ' . $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = min($request->get('per_page', 50), 100);
        $models = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $models->items(),
            'pagination' => [
                'current_page' => $models->currentPage(),
                'per_page' => $models->perPage(),
                'total' => $models->total(),
                'last_page' => $models->lastPage(),
                'from' => $models->firstItem(),
                'to' => $models->lastItem(),
            ]
        ]);
    }

    /**
     * GET /api/models/categories
     * Get all model categories with counts
     */
    public function categories()
    {
        $categories = Cache::remember('model_categories', 3600, function () {
            $categoryData = AiModel::active()
                ->selectRaw('category, COUNT(*) as count')
                ->whereNotNull('category')
                ->groupBy('category')
                ->get();

            $providers = AiModel::active()
                ->selectRaw('provider, COUNT(*) as count')
                ->whereNotNull('provider')
                ->groupBy('provider')
                ->get();

            return [
                'categories' => $categoryData->map(function ($item) {
                    return [
                        'name' => $item->category,
                        'count' => $item->count,
                        'slug' => strtolower(str_replace(' ', '-', $item->category)),
                    ];
                }),
                'providers' => $providers->map(function ($item) {
                    return [
                        'name' => $item->provider,
                        'count' => $item->count,
                        'slug' => $item->provider,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * POST /api/models/test
     * Test a model with a sample prompt
     */
    public function test(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'model_id' => 'required|string',
            'prompt' => 'nullable|string|max:1000',
            'max_tokens' => 'nullable|integer|min:1|max:4000',
            'temperature' => 'nullable|numeric|min:0|max:2',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $modelId = $request->model_id;
        $prompt = $request->prompt ?? "Hello! Please respond with 'OK' if you're working correctly.";

        // Check if model exists in database
        $model = AiModel::where('model_id', $modelId)->first();
        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Model not found in database. Try syncing models first.'
            ], 404);
        }

        // Test the model
        $result = $this->openRouter->testModel($modelId, $prompt);

        // Add model info to response
        if ($result['success']) {
            $result['model_info'] = [
                'name' => $model->name,
                'provider' => $model->provider,
                'context_length' => $model->context_length,
            ];
        }

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * GET /api/models/{id}/pricing
     * Get pricing information for a specific model
     */
    public function pricing($id)
    {
        // Try to find by ID first
        $model = AiModel::find($id);

        // If not found by ID, try by model_id
        if (!$model) {
            $model = AiModel::where('model_id', $id)->first();
        }

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Model not found'
            ], 404);
        }

        $pricing = $model->pricing ?? [];
        $promptPrice = floatval($pricing['prompt'] ?? 0);
        $completionPrice = floatval($pricing['completion'] ?? 0);
        $imagePrice = isset($pricing['image']) ? floatval($pricing['image']) : null;
        $requestPrice = isset($pricing['request']) ? floatval($pricing['request']) : null;

        // Calculate example costs (prices are per token)
        $examples = [
            [
                'description' => '1K input tokens',
                'tokens' => 1000,
                'type' => 'prompt',
                'cost' => $promptPrice * 1000,
                'cost_formatted' => '$' . number_format($promptPrice * 1000, 6)
            ],
            [
                'description' => '1K output tokens',
                'tokens' => 1000,
                'type' => 'completion',
                'cost' => $completionPrice * 1000,
                'cost_formatted' => '$' . number_format($completionPrice * 1000, 6)
            ],
            [
                'description' => 'Typical chat (500 in + 500 out)',
                'tokens' => 1000,
                'type' => 'mixed',
                'cost' => ($promptPrice * 500) + ($completionPrice * 500),
                'cost_formatted' => '$' . number_format(($promptPrice * 500) + ($completionPrice * 500), 6)
            ],
            [
                'description' => 'Large request (5K in + 2K out)',
                'tokens' => 7000,
                'type' => 'mixed',
                'cost' => ($promptPrice * 5000) + ($completionPrice * 2000),
                'cost_formatted' => '$' . number_format(($promptPrice * 5000) + ($completionPrice * 2000), 4)
            ],
        ];

        // Add image pricing example if available
        if ($imagePrice !== null) {
            $examples[] = [
                'description' => 'Image processing',
                'tokens' => null,
                'type' => 'image',
                'cost' => $imagePrice,
                'cost_formatted' => '$' . number_format($imagePrice, 6)
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'model_id' => $model->model_id,
                'model_name' => $model->name,
                'provider' => $model->provider,
                'pricing' => [
                    'prompt' => $promptPrice,
                    'completion' => $completionPrice,
                    'image' => $imagePrice,
                    'request' => $requestPrice,
                    'unit' => 'per token',
                ],
                'context_length' => $model->context_length,
                'top_provider' => $model->top_provider,
                'examples' => $examples,
            ]
        ]);
    }

    /**
     * Force sync models from OpenRouter
     * POST /api/models/sync (optional endpoint)
     */
    public function sync()
    {
        try {
            $count = $this->syncModels();
            Cache::put('models_last_sync', now(), 3600);

            return response()->json([
                'success' => true,
                'message' => "Successfully synced {$count} models",
                'synced_at' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync models',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync models from OpenRouter API to local database
     */
    protected function syncModelsIfNeeded()
    {
        $lastSync = Cache::get('models_last_sync');
        
        // Sync every hour or if never synced
        if (!$lastSync || now()->diffInMinutes($lastSync) > 60) {
            $this->syncModels();
            Cache::put('models_last_sync', now(), 3600);
        }
    }

    /**
     * Perform the actual sync
     */
    protected function syncModels()
    {
        $openRouterModels = $this->openRouter->getModels();
        $count = 0;

        foreach ($openRouterModels as $modelData) {
            AiModel::updateOrCreate(
                ['model_id' => $modelData['id']],
                [
                    'name' => $modelData['name'] ?? $modelData['id'],
                    'description' => $modelData['description'] ?? null,
                    'pricing' => $modelData['pricing'] ?? null,
                    'context_length' => $modelData['context_length'] ?? null,
                    'architecture' => $modelData['architecture'] ?? null,
                    'top_provider' => $modelData['top_provider']['name'] ?? null,
                    'per_request_limits' => $modelData['per_request_limits'] ?? null,
                    'category' => $this->categorizeModel($modelData),
                    'provider' => $this->extractProvider($modelData['id']),
                    'metadata' => $modelData,
                    'last_synced_at' => now(),
                ]
            );
            $count++;
        }

        return $count;
    }

    private function categorizeModel($modelData)
    {
        $name = strtolower($modelData['name'] ?? '');
        $id = strtolower($modelData['id'] ?? '');
        
        // Check architecture modality
        $modality = $modelData['architecture']['modality'] ?? '';
        if (str_contains($modality, 'image')) {
            return 'vision';
        }
        
        // Check name patterns
        if (str_contains($name, 'vision') || str_contains($id, 'vision')) {
            return 'vision';
        } elseif (str_contains($name, 'code') || str_contains($id, 'code')) {
            return 'code';
        } elseif (str_contains($name, 'chat') || str_contains($name, 'instruct')) {
            return 'chat';
        } elseif (str_contains($name, 'embed')) {
            return 'embedding';
        }
        
        return 'general';
    }

    private function extractProvider($modelId)
    {
        $parts = explode('/', $modelId);
        return $parts[0] ?? 'unknown';
    }
}