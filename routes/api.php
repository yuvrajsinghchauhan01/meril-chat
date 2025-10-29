<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ModelController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SearchController;


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


// All chat, conversation, message, and project routes are now protected by auth:sanctum middleware below

use App\Http\Controllers\Api\AuthApiController;

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
    
    // Chat routes (protected)
    Route::prefix('chat')->group(function () {
        Route::post('/', [ChatController::class, 'chat']);
        Route::post('/stream', [ChatController::class, 'stream']);
    });

    // Conversation routes (protected)
    Route::prefix('conversations')->group(function () {
        Route::get('/', [ChatController::class, 'conversations']);
        Route::get('/{id}', [ChatController::class, 'show']);
        Route::put('/{id}', [ChatController::class, 'update']);
        Route::delete('/{id}', [ChatController::class, 'destroy']);
    });

    // Message management routes (protected)
    Route::prefix('messages')->group(function () {
        Route::put('/{id}', [ChatController::class, 'editMessage']);
        Route::delete('/{id}', [ChatController::class, 'deleteMessage']);
        Route::post('/{id}/regenerate', [ChatController::class, 'regenerateMessage']);
        Route::post('/{id}/edit-and-continue', [ChatController::class, 'editAndContinue']);
    });

    // Project routes (protected)
    Route::prefix('projects')->group(function () {
        Route::get('/', [ProjectController::class, 'index']);
        Route::post('/', [ProjectController::class, 'store']);
        Route::get('/{id}', [ProjectController::class, 'show']);
        Route::put('/{id}', [ProjectController::class, 'update']);
        Route::delete('/{id}', [ProjectController::class, 'destroy']);
        
        // Project conversations
        Route::get('/{id}/conversations', [ProjectController::class, 'conversations']);
        Route::post('/{id}/conversations', [ProjectController::class, 'createConversation']);
        Route::post('/{id}/conversations/add', [ProjectController::class, 'addConversations']);
        Route::delete('/{projectId}/conversations/{conversationId}', [ProjectController::class, 'removeConversation']);
        
        // Archive toggle
        Route::post('/{id}/archive', [ProjectController::class, 'toggleArchive']);
    });
    
    // Search routes
    Route::prefix('search')->group(function () {
        Route::post('/', [SearchController::class, 'search']);
        Route::post('/web', [SearchController::class, 'webSearch']);
    });
});
