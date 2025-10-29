<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\AiModel;
use App\Services\OpenRouterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;  // ← ADD THIS LINE
use Illuminate\Support\Str;
// // app/Http/Controllers/Api/ChatController.php
// namespace App\Http\Controllers\Api;

// use App\Http\Controllers\Controller;
// use App\Models\Conversation;
// use App\Models\Message;
// use App\Models\AiModel;
// use App\Services\OpenRouterService;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Validator;
// use Illuminate\Support\Str;

// class ChatController extends Controller
// {
//     protected $openRouter;

//     public function __construct(OpenRouterService $openRouter)
//     {
//         $this->openRouter = $openRouter;
//     }

//     /**
//      * POST /api/chat
//      * Send a message and get response (non-streaming)
//      */
//     public function chat(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'model' => 'required|string',
//             'message' => 'required|string|max:10000',
//             'conversation_id' => 'nullable|exists:conversations,id',
//             'temperature' => 'nullable|numeric|min:0|max:2',
//             'max_tokens' => 'nullable|integer|min:1|max:8000',
//             'system_prompt' => 'nullable|string|max:2000',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'success' => false,
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         // Verify model exists
//         $model = AiModel::where('model_id', $request->model)->first();
//         if (!$model) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Model not found'
//             ], 404);
//         }

//         // Get or create conversation
//         if ($request->conversation_id) {
//             $conversation = Conversation::find($request->conversation_id);
//             if (!$conversation) {
//                 return response()->json([
//                     'success' => false,
//                     'message' => 'Conversation not found'
//                 ], 404);
//             }
//         } else {
//             // Create new conversation
//             $conversation = Conversation::create([
//                 'user_id' => $request->user()->id ?? null,
//                 'title' => Str::limit($request->message, 50),
//                 'model_id' => $request->model,
//                 'settings' => [
//                     'temperature' => $request->temperature ?? 0.7,
//                     'max_tokens' => $request->max_tokens ?? 2000,
//                 ],
//             ]);
//         }

//         // Save user message
//         $userMessage = Message::create([
//             'conversation_id' => $conversation->id,
//             'role' => 'user',
//             'content' => $request->message,
//         ]);

//         // Build messages array for API
//         $messages = $this->buildMessagesArray($conversation, $request->system_prompt);

//         // Call OpenRouter API
//         $options = array_filter([
//             'temperature' => $request->temperature ?? $conversation->settings['temperature'] ?? 0.7,
//             'max_tokens' => $request->max_tokens ?? $conversation->settings['max_tokens'] ?? 2000,
//         ]);

//         $result = $this->openRouter->chat($request->model, $messages, $options);

//         if (!$result['success']) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Failed to get response from AI',
//                 'error' => $result['error'] ?? 'Unknown error'
//             ], 500);
//         }

//         // Save assistant message
//         $assistantMessage = Message::create([
//             'conversation_id' => $conversation->id,
//             'role' => 'assistant',
//             'content' => $result['message'],
//             'metadata' => [
//                 'model' => $result['model'],
//                 'usage' => $result['usage'],
//                 'finish_reason' => $result['finish_reason'],
//             ],
//         ]);

//         // Update conversation
//         $conversation->update([
//             'last_message_at' => now(),
//         ]);

//         return response()->json([
//             'success' => true,
//             'data' => [
//                 'conversation_id' => $conversation->id,
//                 'message' => [
//                     'id' => $assistantMessage->id,
//                     'content' => $assistantMessage->content,
//                     'role' => 'assistant',
//                     'created_at' => $assistantMessage->created_at,
//                 ],
//                 'usage' => $result['usage'],
//                 'model' => $result['model'],
//             ]
//         ]);
//     }

//     /**
//      * POST /api/chat/stream
//      * Send a message and get streaming response
//      */
//     public function stream(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'model' => 'required|string',
//             'message' => 'required|string|max:10000',
//             'conversation_id' => 'nullable|exists:conversations,id',
//             'temperature' => 'nullable|numeric|min:0|max:2',
//             'max_tokens' => 'nullable|integer|min:1|max:8000',
//             'system_prompt' => 'nullable|string|max:2000',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'success' => false,
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         // Verify model exists
//         $model = AiModel::where('model_id', $request->model)->first();
//         if (!$model) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Model not found'
//             ], 404);
//         }

//         // Get or create conversation
//         if ($request->conversation_id) {
//             $conversation = Conversation::find($request->conversation_id);
//         } else {
//             $conversation = Conversation::create([
//                 'user_id' => $request->user()->id ?? null,
//                 'title' => Str::limit($request->message, 50),
//                 'model_id' => $request->model,
//                 'settings' => [
//                     'temperature' => $request->temperature ?? 0.7,
//                     'max_tokens' => $request->max_tokens ?? 2000,
//                 ],
//             ]);
//         }

//         // Save user message
//         Message::create([
//             'conversation_id' => $conversation->id,
//             'role' => 'user',
//             'content' => $request->message,
//         ]);

//         // Build messages array
//         $messages = $this->buildMessagesArray($conversation, $request->system_prompt);

//         // Stream options
//         $options = array_filter([
//             'temperature' => $request->temperature ?? $conversation->settings['temperature'] ?? 0.7,
//             'max_tokens' => $request->max_tokens ?? $conversation->settings['max_tokens'] ?? 2000,
//         ]);

//         // Return streaming response
//         return $this->openRouter->streamChat($request->model, $messages, $options);
//     }

//     /**
//      * GET /api/conversations
//      * Get all conversations for current user
//      */
//     public function conversations(Request $request)
//     {
//         $query = Conversation::query();

//         if ($request->user()) {
//             $query->where('user_id', $request->user()->id);
//         }

//         $conversations = $query
//             ->with(['messages' => function($q) {
//                 $q->latest()->limit(1);
//             }])
//             ->active()
//             ->recent()
//             ->paginate(20);

//         return response()->json([
//             'success' => true,
//             'data' => $conversations->items(),
//             'pagination' => [
//                 'current_page' => $conversations->currentPage(),
//                 'total' => $conversations->total(),
//                 'last_page' => $conversations->lastPage(),
//             ]
//         ]);
//     }

//     /**
//      * GET /api/conversations/{id}
//      * Get a specific conversation with all messages
//      */
//     public function show($id)
//     {
//         $conversation = Conversation::with('messages')->find($id);

//         if (!$conversation) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Conversation not found'
//             ], 404);
//         }

//         return response()->json([
//             'success' => true,
//             'data' => $conversation
//         ]);
//     }

//     /**
//      * DELETE /api/conversations/{id}
//      * Delete a conversation
//      */
//     public function destroy($id)
//     {
//         $conversation = Conversation::find($id);

//         if (!$conversation) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Conversation not found'
//             ], 404);
//         }

//         $conversation->delete();

//         return response()->json([
//             'success' => true,
//             'message' => 'Conversation deleted successfully'
//         ]);
//     }

//     /**
//      * PUT /api/conversations/{id}
//      * Update conversation (title, settings, etc.)
//      */
//     public function update(Request $request, $id)
//     {
//         $conversation = Conversation::find($id);

//         if (!$conversation) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Conversation not found'
//             ], 404);
//         }

//         $validator = Validator::make($request->all(), [
//             'title' => 'nullable|string|max:255',
//             'model_id' => 'nullable|string',
//             'settings' => 'nullable|array',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'success' => false,
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         $conversation->update($request->only(['title', 'model_id', 'settings']));

//         return response()->json([
//             'success' => true,
//             'data' => $conversation
//         ]);
//     }

//     /**
//      * Helper: Build messages array for API
//      */
//     private function buildMessagesArray(Conversation $conversation, $systemPrompt = null)
//     {
//         $messages = [];

//         // Add system prompt if provided
//         if ($systemPrompt) {
//             $messages[] = [
//                 'role' => 'system',
//                 'content' => $systemPrompt
//             ];
//         }

//         // Add conversation history
//         foreach ($conversation->messages as $message) {
//             $messages[] = [
//                 'role' => $message->role,
//                 'content' => $message->content
//             ];
//         }

//         return $messages;
//     }
// }


// app/Http/Controllers/Api/ChatController.php
// namespace App\Http\Controllers\Api;

// use App\Http\Controllers\Controller;
// use App\Models\Conversation;
// use App\Models\Message;
// use App\Models\AiModel;
// use App\Services\OpenRouterService;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Validator;
// use Illuminate\Support\Str;

// class ChatController extends Controller
// {
//     protected $openRouter;

//     public function __construct(OpenRouterService $openRouter)
//     {
//         $this->openRouter = $openRouter;
//     }

//     /**
//      * POST /api/chat
//      * Send a message and get response (non-streaming)
//      */
//     public function chat(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'model' => 'required|string',
//             'message' => 'required|string|max:10000',
//             'conversation_id' => 'nullable|exists:conversations,id',
//             'temperature' => 'nullable|numeric|min:0|max:2',
//             'max_tokens' => 'nullable|integer|min:1|max:8000',
//             'system_prompt' => 'nullable|string|max:2000',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'success' => false,
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         // Verify model exists
//         $model = AiModel::where('model_id', $request->model)->first();
//         if (!$model) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Model not found'
//             ], 404);
//         }

//         // Get or create conversation
//         if ($request->conversation_id) {
//             $conversation = Conversation::find($request->conversation_id);
//             if (!$conversation) {
//                 return response()->json([
//                     'success' => false,
//                     'message' => 'Conversation not found'
//                 ], 404);
//             }
//         } else {
//             // Create new conversation
//             $conversation = Conversation::create([
//                 'user_id' => $request->user()->id ?? null,
//                 'title' => Str::limit($request->message, 50),
//                 'model_id' => $request->model,
//                 'settings' => [
//                     'temperature' => $request->temperature ?? 0.7,
//                     'max_tokens' => $request->max_tokens ?? 2000,
//                 ],
//             ]);
//         }

//         // Save user message
//         $userMessage = Message::create([
//             'conversation_id' => $conversation->id,
//             'role' => 'user',
//             'content' => $request->message,
//         ]);

//         // Build messages array for API
//         $messages = $this->buildMessagesArray($conversation, $request->system_prompt);

//         // Call OpenRouter API
//         $options = array_filter([
//             'temperature' => $request->temperature ?? $conversation->settings['temperature'] ?? 0.7,
//             'max_tokens' => $request->max_tokens ?? $conversation->settings['max_tokens'] ?? 2000,
//         ]);

//         $result = $this->openRouter->chat($request->model, $messages, $options);

//         if (!$result['success']) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Failed to get response from AI',
//                 'error' => $result['error'] ?? 'Unknown error'
//             ], 500);
//         }

//         // Save assistant message
//         $assistantMessage = Message::create([
//             'conversation_id' => $conversation->id,
//             'role' => 'assistant',
//             'content' => $result['message'],
//             'metadata' => [
//                 'model' => $result['model'],
//                 'usage' => $result['usage'],
//                 'finish_reason' => $result['finish_reason'],
//             ],
//         ]);

//         // Update conversation
//         $conversation->update([
//             'last_message_at' => now(),
//         ]);

//         return response()->json([
//             'success' => true,
//             'data' => [
//                 'conversation_id' => $conversation->id,
//                 'message' => [
//                     'id' => $assistantMessage->id,
//                     'content' => $assistantMessage->content,
//                     'role' => 'assistant',
//                     'created_at' => $assistantMessage->created_at,
//                 ],
//                 'usage' => $result['usage'],
//                 'model' => $result['model'],
//             ]
//         ]);
//     }

//     /**
//      * POST /api/chat/stream
//      * Send a message and get streaming response
//      */
//     public function stream(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'model' => 'required|string',
//             'message' => 'required|string|max:10000',
//             'conversation_id' => 'nullable|exists:conversations,id',
//             'temperature' => 'nullable|numeric|min:0|max:2',
//             'max_tokens' => 'nullable|integer|min:1|max:8000',
//             'system_prompt' => 'nullable|string|max:2000',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'success' => false,
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         // Verify model exists
//         $model = AiModel::where('model_id', $request->model)->first();
//         if (!$model) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Model not found'
//             ], 404);
//         }

//         // Get or create conversation
//         if ($request->conversation_id) {
//             $conversation = Conversation::find($request->conversation_id);
//         } else {
//             $conversation = Conversation::create([
//                 'user_id' => $request->user()->id ?? null,
//                 'title' => Str::limit($request->message, 50),
//                 'model_id' => $request->model,
//                 'settings' => [
//                     'temperature' => $request->temperature ?? 0.7,
//                     'max_tokens' => $request->max_tokens ?? 2000,
//                 ],
//             ]);
//         }

//         // Save user message
//         Message::create([
//             'conversation_id' => $conversation->id,
//             'role' => 'user',
//             'content' => $request->message,
//         ]);

//         // Build messages array
//         $messages = $this->buildMessagesArray($conversation, $request->system_prompt);

//         // Stream options
//         $options = array_filter([
//             'temperature' => $request->temperature ?? $conversation->settings['temperature'] ?? 0.7,
//             'max_tokens' => $request->max_tokens ?? $conversation->settings['max_tokens'] ?? 2000,
//         ]);

//         // Return streaming response
//         return $this->openRouter->streamChat($request->model, $messages, $options);
//     }

//     /**
//      * GET /api/conversations
//      * Get all conversations for current user
//      */
//     public function conversations(Request $request)
//     {
//         $query = Conversation::query();

//         if ($request->user()) {
//             $query->where('user_id', $request->user()->id);
//         }

//         $conversations = $query
//             ->with(['messages' => function($q) {
//                 $q->latest()->limit(1);
//             }])
//             ->active()
//             ->recent()
//             ->paginate(20);

//         return response()->json([
//             'success' => true,
//             'data' => $conversations->items(),
//             'pagination' => [
//                 'current_page' => $conversations->currentPage(),
//                 'total' => $conversations->total(),
//                 'last_page' => $conversations->lastPage(),
//             ]
//         ]);
//     }

//     /**
//      * GET /api/conversations/{id}
//      * Get a specific conversation with all messages
//      */
//     public function show($id)
//     {
//         $conversation = Conversation::with('messages')->find($id);

//         if (!$conversation) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Conversation not found'
//             ], 404);
//         }

//         return response()->json([
//             'success' => true,
//             'data' => $conversation
//         ]);
//     }

//     /**
//      * DELETE /api/conversations/{id}
//      * Delete a conversation
//      */
//     public function destroy($id)
//     {
//         $conversation = Conversation::find($id);

//         if (!$conversation) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Conversation not found'
//             ], 404);
//         }

//         $conversation->delete();

//         return response()->json([
//             'success' => true,
//             'message' => 'Conversation deleted successfully'
//         ]);
//     }

//     /**
//      * PUT /api/conversations/{id}
//      * Update conversation (title, settings, etc.)
//      */
//     public function update(Request $request, $id)
//     {
//         $conversation = Conversation::find($id);

//         if (!$conversation) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Conversation not found'
//             ], 404);
//         }

//         $validator = Validator::make($request->all(), [
//             'title' => 'nullable|string|max:255',
//             'model_id' => 'nullable|string',
//             'settings' => 'nullable|array',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'success' => false,
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         $conversation->update($request->only(['title', 'model_id', 'settings']));

//         return response()->json([
//             'success' => true,
//             'data' => $conversation
//         ]);
//     }

//     /**
//      * PUT /api/messages/{id}
//      * Edit a user message
//      */
//     public function editMessage(Request $request, $id)
//     {
//         $message = Message::find($id);

//         if (!$message) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Message not found'
//             ], 404);
//         }

//         // Only allow editing user messages
//         if ($message->role !== 'user') {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Only user messages can be edited'
//             ], 403);
//         }

//         $validator = Validator::make($request->all(), [
//             'content' => 'required|string|max:10000',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'success' => false,
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         // Update the message
//         $message->update([
//             'content' => $request->content
//         ]);

//         return response()->json([
//             'success' => true,
//             'data' => $message
//         ]);
//     }

//     /**
//      * DELETE /api/messages/{id}
//      * Delete a message
//      */
//     public function deleteMessage($id)
//     {
//         $message = Message::find($id);

//         if (!$message) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Message not found'
//             ], 404);
//         }

//         $conversationId = $message->conversation_id;
//         $message->delete();

//         // Update conversation's last_message_at
//         $conversation = Conversation::find($conversationId);
//         if ($conversation) {
//             $lastMessage = $conversation->messages()->latest()->first();
//             $conversation->update([
//                 'last_message_at' => $lastMessage ? $lastMessage->created_at : null
//             ]);
//         }

//         return response()->json([
//             'success' => true,
//             'message' => 'Message deleted successfully'
//         ]);
//     }

//     /**
//      * POST /api/messages/{id}/regenerate
//      * Regenerate assistant response from a specific message
//      */
//     public function regenerateMessage(Request $request, $id)
//     {
//         $message = Message::with('conversation')->find($id);

//         if (!$message) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Message not found'
//             ], 404);
//         }

//         // Can only regenerate assistant messages
//         if ($message->role !== 'assistant') {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Can only regenerate assistant messages'
//             ], 403);
//         }

//         $conversation = $message->conversation;

//         // Get all messages up to (but not including) this assistant message
//         $previousMessages = Message::where('conversation_id', $conversation->id)
//             ->where('id', '<', $message->id)
//             ->orderBy('created_at')
//             ->get();

//         // Build messages array
//         $messages = [];
        
//         // Add system prompt if in request
//         if ($request->system_prompt) {
//             $messages[] = [
//                 'role' => 'system',
//                 'content' => $request->system_prompt
//             ];
//         }

//         // Add previous messages
//         foreach ($previousMessages as $prevMsg) {
//             $messages[] = [
//                 'role' => $prevMsg->role,
//                 'content' => $prevMsg->content
//             ];
//         }

//         // Prepare options
//         $options = [
//             'temperature' => $request->temperature ?? $conversation->settings['temperature'] ?? 0.7,
//             'max_tokens' => $request->max_tokens ?? $conversation->settings['max_tokens'] ?? 2000,
//         ];

//         // Call OpenRouter API
//         $result = $this->openRouter->chat($conversation->model_id, $messages, $options);

//         if (!$result['success']) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Failed to regenerate response',
//                 'error' => $result['error'] ?? 'Unknown error'
//             ], 500);
//         }

//         // Delete all messages after and including this assistant message
//         Message::where('conversation_id', $conversation->id)
//             ->where('id', '>=', $message->id)
//             ->delete();

//         // Create new assistant message
//         $newMessage = Message::create([
//             'conversation_id' => $conversation->id,
//             'role' => 'assistant',
//             'content' => $result['message'],
//             'metadata' => [
//                 'model' => $result['model'],
//                 'usage' => $result['usage'],
//                 'finish_reason' => $result['finish_reason'],
//                 'regenerated' => true,
//             ],
//         ]);

//         // Update conversation
//         $conversation->update([
//             'last_message_at' => now(),
//         ]);

//         return response()->json([
//             'success' => true,
//             'data' => [
//                 'message' => $newMessage,
//                 'usage' => $result['usage'],
//                 'model' => $result['model'],
//             ]
//         ]);
//     }

//     /**
//      * POST /api/messages/{id}/edit-and-continue
//      * Edit a user message and regenerate all subsequent messages
//      */
//     public function editAndContinue(Request $request, $id)
//     {
//         $message = Message::with('conversation')->find($id);

//         if (!$message) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Message not found'
//             ], 404);
//         }

//         // Only allow editing user messages
//         if ($message->role !== 'user') {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Only user messages can be edited and continued'
//             ], 403);
//         }

//         $validator = Validator::make($request->all(), [
//             'content' => 'required|string|max:10000',
//             'temperature' => 'nullable|numeric|min:0|max:2',
//             'max_tokens' => 'nullable|integer|min:1|max:8000',
//         ]);

//         if ($validator->fails()) {
//             return response()->json([
//                 'success' => false,
//                 'errors' => $validator->errors()
//             ], 422);
//         }

//         $conversation = $message->conversation;

//         // Update the message
//         $message->update([
//             'content' => $request->content
//         ]);

//         // Delete all messages after this one
//         Message::where('conversation_id', $conversation->id)
//             ->where('id', '>', $message->id)
//             ->delete();

//         // Get all messages up to and including the edited message
//         $allMessages = Message::where('conversation_id', $conversation->id)
//             ->where('id', '<=', $message->id)
//             ->orderBy('created_at')
//             ->get();

//         // Build messages array
//         $messages = [];
        
//         if ($request->system_prompt) {
//             $messages[] = [
//                 'role' => 'system',
//                 'content' => $request->system_prompt
//             ];
//         }

//         foreach ($allMessages as $msg) {
//             $messages[] = [
//                 'role' => $msg->role,
//                 'content' => $msg->content
//             ];
//         }

//         // Prepare options
//         $options = [
//             'temperature' => $request->temperature ?? $conversation->settings['temperature'] ?? 0.7,
//             'max_tokens' => $request->max_tokens ?? $conversation->settings['max_tokens'] ?? 2000,
//         ];

//         // Call OpenRouter API
//         $result = $this->openRouter->chat($conversation->model_id, $messages, $options);

//         if (!$result['success']) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Failed to generate response',
//                 'error' => $result['error'] ?? 'Unknown error'
//             ], 500);
//         }

//         // Create new assistant message
//         $newMessage = Message::create([
//             'conversation_id' => $conversation->id,
//             'role' => 'assistant',
//             'content' => $result['message'],
//             'metadata' => [
//                 'model' => $result['model'],
//                 'usage' => $result['usage'],
//                 'finish_reason' => $result['finish_reason'],
//                 'edited_continuation' => true,
//             ],
//         ]);

//         // Update conversation
//         $conversation->update([
//             'last_message_at' => now(),
//         ]);

//         return response()->json([
//             'success' => true,
//             'data' => [
//                 'edited_message' => $message,
//                 'new_message' => $newMessage,
//                 'usage' => $result['usage'],
//                 'model' => $result['model'],
//             ]
//         ]);
//     }

//     /**
//      * Helper: Build messages array for API
//      */
//     private function buildMessagesArray(Conversation $conversation, $systemPrompt = null)
//     {
//         $messages = [];

//         // Add system prompt if provided
//         if ($systemPrompt) {
//             $messages[] = [
//                 'role' => 'system',
//                 'content' => $systemPrompt
//             ];
//         }

//         // Add conversation history
//         foreach ($conversation->messages as $message) {
//             $messages[] = [
//                 'role' => $message->role,
//                 'content' => $message->content
//             ];
//         }

//         return $messages;
//     }
// }



// app/Http/Controllers/Api/ChatController.php
// app/Http/Controllers/Api/ChatController.php


class ChatController extends Controller
{
    protected $openRouter;

    public function __construct(OpenRouterService $openRouter)
    {
        $this->openRouter = $openRouter;
    }

    /**
     * POST /api/chat
     * Send a message and get response (non-streaming)
     */
    public function chat(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'model' => 'required|string',
            'message' => 'required|string|max:10000',
            'conversation_id' => 'nullable|exists:conversations,id',
            'project_id' => 'nullable|exists:projects,id',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'max_tokens' => 'nullable|integer|min:1|max:8000',
            'system_prompt' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify model exists
        $model = AiModel::where('model_id', $request->model)->first();
        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Model not found'
            ], 404);
        }

        $user = $request->user();
        
        // Get or create conversation
        if ($request->conversation_id) {
            // Check user owns this conversation
            $conversation = Conversation::where('id', $request->conversation_id)
                ->where('user_id', $user->id)
                ->first();
            if (!$conversation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conversation not found'
                ], 404);
            }
        } else {
            // Create new conversation
            $conversation = Conversation::create([
                'user_id' => $user->id,
                'project_id' => $request->project_id, // NEW: Support project_id
                'title' => Str::limit($request->message, 50),
                'model_id' => $request->model,
                'settings' => [
                    'temperature' => $request->temperature ?? 0.7,
                    'max_tokens' => $request->max_tokens ?? 2000,
                ],
            ]);
        }

        // Save user message
        $userMessage = Message::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $request->message,
        ]);

        // Build messages array for API
        $messages = $this->buildMessagesArray($conversation, $request->system_prompt);

        // Call OpenRouter API
        $options = array_filter([
            'temperature' => $request->temperature ?? $conversation->settings['temperature'] ?? 0.7,
            'max_tokens' => $request->max_tokens ?? $conversation->settings['max_tokens'] ?? 2000,
        ]);

        $result = $this->openRouter->chat($request->model, $messages, $options);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get response from AI',
                'error' => $result['error'] ?? 'Unknown error'
            ], 500);
        }

        // Save assistant message
        $assistantMessage = Message::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $result['message'],
            'metadata' => [
                'model' => $result['model'],
                'usage' => $result['usage'],
                'finish_reason' => $result['finish_reason'],
            ],
        ]);

        // Update conversation
        $conversation->update([
            'last_message_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'conversation_id' => $conversation->id,
                'project_id' => $conversation->project_id, // NEW: Return project_id
                'message' => [
                    'id' => $assistantMessage->id,
                    'content' => $assistantMessage->content,
                    'role' => 'assistant',
                    'created_at' => $assistantMessage->created_at,
                ],
                'usage' => $result['usage'],
                'model' => $result['model'],
            ]
        ]);
    }

    /**
     * POST /api/chat/stream
     * Send a message and get streaming response
     */
    public function stream(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'model' => 'required|string',
            'message' => 'required|string|max:10000',
            'conversation_id' => 'nullable|exists:conversations,id',
            'project_id' => 'nullable|exists:projects,id',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'max_tokens' => 'nullable|integer|min:1|max:8000',
            'system_prompt' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify model exists
        $model = AiModel::where('model_id', $request->model)->first();
        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Model not found'
            ], 404);
        }

        try {
            $user = $request->user();
            
            // Get or create conversation
            if ($request->conversation_id) {
                // Check user owns this conversation
                $conversation = Conversation::where('id', $request->conversation_id)
                    ->where('user_id', $user->id)
                    ->first();
                if (!$conversation) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Conversation not found'
                    ], 404);
                }
            } else {
                $conversation = Conversation::create([
                    'user_id' => $user->id,
                    'project_id' => $request->project_id, // NEW: Support project_id
                    'title' => Str::limit($request->message, 50),
                    'model_id' => $request->model,
                    'settings' => [
                        'temperature' => $request->temperature ?? 0.7,
                        'max_tokens' => $request->max_tokens ?? 2000,
                    ],
                ]);
            }

            // Save user message
            Message::create([
                'conversation_id' => $conversation->id,
                'role' => 'user',
                'content' => $request->message,
            ]);

            // Build messages array
            $messages = $this->buildMessagesArray($conversation, $request->system_prompt);

            // Stream options
            $options = [
                'temperature' => $request->temperature ?? $conversation->settings['temperature'] ?? 0.7,
                'max_tokens' => $request->max_tokens ?? $conversation->settings['max_tokens'] ?? 2000,
            ];

            // Prepare payload
            $payload = [
                'model' => $request->model,
                'messages' => $messages,
                'stream' => true,
            ] + $options;

            $conversationId = $conversation->id;
            $apiKey = config('services.openrouter.api_key');
            $siteUrl = config('services.openrouter.site_url', config('app.url'));
            $siteName = config('services.openrouter.site_name', config('app.name'));
            $baseUrl = 'https://openrouter.ai/api/v1';

            // Return streaming response using Http client
            return response()->stream(function () use ($payload, $conversationId, $apiKey, $siteUrl, $siteName, $baseUrl, $request) {
                // Disable output buffering for true streaming
                if (ob_get_level()) ob_end_clean();
                
                $fullContent = '';
                
                try {
                    $response = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                        'HTTP-Referer' => $siteUrl,
                        'X-Title' => $siteName,
                        'Content-Type' => 'application/json',
                    ])->timeout(120)->withOptions([
                        'stream' => true,
                    ])->post($baseUrl . '/chat/completions', $payload);

                    // Process the stream
                    $body = $response->toPsrResponse()->getBody();
                    $buffer = '';
                    
                    while (!$body->eof()) {
                        $chunk = $body->read(256); // Smaller chunks for better streaming
                        
                        if ($chunk !== false && $chunk !== '') {
                            // Immediately output the chunk
                            echo $chunk;
                            flush();
                            
                            // Parse the SSE data to accumulate content
                            $buffer .= $chunk;
                            $lines = explode("\n", $buffer);
                            $buffer = array_pop($lines); // Keep incomplete line in buffer
                            
                            foreach ($lines as $line) {
                                if (str_starts_with($line, 'data: ')) {
                                    $jsonData = trim(substr($line, 6));
                                    if ($jsonData !== '[DONE]' && !empty($jsonData)) {
                                        try {
                                            $decoded = json_decode($jsonData, true);
                                            if (isset($decoded['choices'][0]['delta']['content'])) {
                                                $fullContent .= $decoded['choices'][0]['delta']['content'];
                                            }
                                        } catch (\Exception $e) {
                                            // Ignore JSON parse errors
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // After streaming is complete, save the assistant message
                    if (!empty($fullContent)) {
                        Message::create([
                            'conversation_id' => $conversationId,
                            'role' => 'assistant',
                            'content' => $fullContent,
                            'metadata' => [
                                'model' => $request->model,
                                'streamed' => true,
                            ],
                        ]);

                        // Update conversation
                        Conversation::find($conversationId)->update([
                            'last_message_at' => now(),
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::error('Stream processing error: ' . $e->getMessage());
                    echo "data: " . json_encode(['error' => $e->getMessage()]) . "\n\n";
                    flush();
                }
            }, 200, [
                'Content-Type' => 'text/event-stream',
                'Cache-Control' => 'no-cache',
                'X-Accel-Buffering' => 'no',
                'Connection' => 'keep-alive',
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Stream endpoint error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to process streaming request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/conversations
     * Get all conversations for current user
     */
    public function conversations(Request $request)
    {
        // This route is now protected by auth:sanctum middleware
        // So we always have an authenticated user
        $user = $request->user();
        
        $conversations = Conversation::query()
            ->where('user_id', $user->id)
            ->with(['messages' => function($q) {
                $q->latest()->limit(1);
            }])
            ->active()
            ->recent()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $conversations->items(),
            'pagination' => [
                'current_page' => $conversations->currentPage(),
                'total' => $conversations->total(),
                'last_page' => $conversations->lastPage(),
            ]
        ]);
    }

    /**
     * GET /api/conversations/{id}
     * Get a specific conversation with all messages
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        $conversation = Conversation::with('messages')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $conversation
        ]);
    }

    /**
     * DELETE /api/conversations/{id}
     * Delete a conversation
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        $conversation = Conversation::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found'
            ], 404);
        }

        $conversation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conversation deleted successfully'
        ]);
    }

    /**
     * PUT /api/conversations/{id}
     * Update conversation (title, settings, etc.)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        $conversation = Conversation::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'model_id' => 'nullable|string',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $conversation->update($request->only(['title', 'model_id', 'settings']));

        return response()->json([
            'success' => true,
            'data' => $conversation
        ]);
    }

    /**
     * PUT /api/messages/{id}
     * Edit a user message
     */
    public function editMessage(Request $request, $id)
    {
        $user = $request->user();
        
        $message = Message::with('conversation')
            ->whereHas('conversation', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Message not found'
            ], 404);
        }

        // Only allow editing user messages
        if ($message->role !== 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Only user messages can be edited'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:10000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Update the message
        $message->update([
            'content' => $request->content
        ]);

        return response()->json([
            'success' => true,
            'data' => $message
        ]);
    }

    /**
     * DELETE /api/messages/{id}
     * Delete a message
     */
    public function deleteMessage(Request $request, $id)
    {
        $user = $request->user();
        
        $message = Message::with('conversation')
            ->whereHas('conversation', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Message not found'
            ], 404);
        }

        $conversationId = $message->conversation_id;
        $message->delete();

        // Update conversation's last_message_at
        $conversation = Conversation::find($conversationId);
        if ($conversation) {
            $lastMessage = $conversation->messages()->latest()->first();
            $conversation->update([
                'last_message_at' => $lastMessage ? $lastMessage->created_at : null
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully'
        ]);
    }

    /**
     * POST /api/messages/{id}/regenerate
     * Regenerate assistant response from a specific message
     */
    public function regenerateMessage(Request $request, $id)
    {
        $message = Message::with('conversation')->find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Message not found'
            ], 404);
        }

        // Can only regenerate assistant messages
        if ($message->role !== 'assistant') {
            return response()->json([
                'success' => false,
                'message' => 'Can only regenerate assistant messages'
            ], 403);
        }

        $conversation = $message->conversation;

        // Get all messages up to (but not including) this assistant message
        $previousMessages = Message::where('conversation_id', $conversation->id)
            ->where('id', '<', $message->id)
            ->orderBy('created_at')
            ->get();

        // Build messages array
        $messages = [];
        
        // Add system prompt if in request
        if ($request->system_prompt) {
            $messages[] = [
                'role' => 'system',
                'content' => $request->system_prompt
            ];
        }

        // Add previous messages
        foreach ($previousMessages as $prevMsg) {
            $messages[] = [
                'role' => $prevMsg->role,
                'content' => $prevMsg->content
            ];
        }

        // Prepare options
        $options = [
            'temperature' => $request->temperature ?? $conversation->settings['temperature'] ?? 0.7,
            'max_tokens' => $request->max_tokens ?? $conversation->settings['max_tokens'] ?? 2000,
        ];

        // Call OpenRouter API
        $result = $this->openRouter->chat($conversation->model_id, $messages, $options);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to regenerate response',
                'error' => $result['error'] ?? 'Unknown error'
            ], 500);
        }

        // Delete all messages after and including this assistant message
        Message::where('conversation_id', $conversation->id)
            ->where('id', '>=', $message->id)
            ->delete();

        // Create new assistant message
        $newMessage = Message::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $result['message'],
            'metadata' => [
                'model' => $result['model'],
                'usage' => $result['usage'],
                'finish_reason' => $result['finish_reason'],
                'regenerated' => true,
            ],
        ]);

        // Update conversation
        $conversation->update([
            'last_message_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'message' => $newMessage,
                'usage' => $result['usage'],
                'model' => $result['model'],
            ]
        ]);
    }

    /**
     * POST /api/messages/{id}/edit-and-continue
     * Edit a user message and regenerate all subsequent messages
     */
    public function editAndContinue(Request $request, $id)
    {
        $message = Message::with('conversation')->find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Message not found'
            ], 404);
        }

        // Only allow editing user messages
        if ($message->role !== 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Only user messages can be edited and continued'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:10000',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'max_tokens' => 'nullable|integer|min:1|max:8000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $conversation = $message->conversation;

        // Update the message
        $message->update([
            'content' => $request->content
        ]);

        // Delete all messages after this one
        Message::where('conversation_id', $conversation->id)
            ->where('id', '>', $message->id)
            ->delete();

        // Get all messages up to and including the edited message
        $allMessages = Message::where('conversation_id', $conversation->id)
            ->where('id', '<=', $message->id)
            ->orderBy('created_at')
            ->get();

        // Build messages array
        $messages = [];
        
        if ($request->system_prompt) {
            $messages[] = [
                'role' => 'system',
                'content' => $request->system_prompt
            ];
        }

        foreach ($allMessages as $msg) {
            $messages[] = [
                'role' => $msg->role,
                'content' => $msg->content
            ];
        }

        // Prepare options
        $options = [
            'temperature' => $request->temperature ?? $conversation->settings['temperature'] ?? 0.7,
            'max_tokens' => $request->max_tokens ?? $conversation->settings['max_tokens'] ?? 2000,
        ];

        // Call OpenRouter API
        $result = $this->openRouter->chat($conversation->model_id, $messages, $options);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate response',
                'error' => $result['error'] ?? 'Unknown error'
            ], 500);
        }

        // Create new assistant message
        $newMessage = Message::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $result['message'],
            'metadata' => [
                'model' => $result['model'],
                'usage' => $result['usage'],
                'finish_reason' => $result['finish_reason'],
                'edited_continuation' => true,
            ],
        ]);

        // Update conversation
        $conversation->update([
            'last_message_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'edited_message' => $message,
                'new_message' => $newMessage,
                'usage' => $result['usage'],
                'model' => $result['model'],
            ]
        ]);
    }

    /**
     * Helper: Build messages array for API
     */
    private function buildMessagesArray(Conversation $conversation, $systemPrompt = null)
    {
        $messages = [];

        // Add system prompt if provided
        if ($systemPrompt) {
            $messages[] = [
                'role' => 'system',
                'content' => $systemPrompt
            ];
        }

        // Add conversation history
        foreach ($conversation->messages as $message) {
            $messages[] = [
                'role' => $message->role,
                'content' => $message->content
            ];
        }

        return $messages;
    }
}