<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ModelController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\AuthApiController;


// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Model routes
Route::prefix('models')->group(function () {
    Route::get('/', [ModelController::class, 'index']);
    Route::get('/categories', [ModelController::class, 'categories']);
    Route::post('/test', [ModelController::class, 'test']);
    Route::post('/sync', [ModelController::class, 'sync']);
    Route::get('/{id}/pricing', [ModelController::class, 'pricing']);
});

// // Chat routes (new)
// Route::prefix('chat')->group(function () {
//     Route::post('/', [ChatController::class, 'chat']);
//     Route::post('/stream', [ChatController::class, 'stream']);
// });

// // Conversation routes (new)
// Route::prefix('conversations')->group(function () {
//     Route::get('/', [ChatController::class, 'conversations']);
//     Route::get('/{id}', [ChatController::class, 'show']);
//     Route::put('/{id}', [ChatController::class, 'update']);
//     Route::delete('/{id}', [ChatController::class, 'destroy']);
// });


// Note: Fortify handles /api/login and /api/register automatically

// Temporary test route for search functionality (REMOVE IN PRODUCTION)
Route::post('/test-search', function(Request $request) {
    $controller = new \App\Http\Controllers\Api\SearchController();
    // Temporarily bypass auth by setting a fake user
    $request->merge(['query' => $request->input('query', 'test')]);
    return $controller->search($request);
});


// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthApiController::class, 'logout']);
    Route::get('/user', [AuthApiController::class, 'user']);
    Route::post('/refresh', [AuthApiController::class, 'refresh']);
    // Note: Fortify handles password updates via /api/user/password
    
    // Chat routes (protected) - non-RESTful endpoints for AI chat
    Route::prefix('chat')->group(function () {
        Route::post('/', [ChatController::class, 'chat']);
        Route::post('/stream', [ChatController::class, 'stream']);
    });

    // Conversations (RESTful API resource)
    Route::apiResource('conversations', ConversationController::class);

    // Messages (RESTful API resource)
    Route::apiResource('messages', MessageController::class);
    // Custom message actions
    Route::post('messages/{message}/regenerate', [MessageController::class, 'regenerate']);
    Route::post('messages/{message}/edit-and-continue', [MessageController::class, 'editAndContinue']);

    // Projects (RESTful API resource)
    Route::apiResource('projects', ProjectController::class);
    // Custom project actions
    Route::get('projects/{project}/conversations', [ProjectController::class, 'conversations']);
    Route::post('projects/{project}/conversations', [ProjectController::class, 'createConversation']);
    Route::post('projects/{project}/conversations/add', [ProjectController::class, 'addConversations']);
    Route::delete('projects/{project}/conversations/{conversation}', [ProjectController::class, 'removeConversation']);
    Route::post('projects/{project}/archive', [ProjectController::class, 'toggleArchive']);
    
    // Search routes
    Route::prefix('search')->group(function () {
        Route::post('/', [SearchController::class, 'search']);
        Route::post('/web', [SearchController::class, 'webSearch']);
    });
});
