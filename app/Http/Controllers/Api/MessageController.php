<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Conversation;
use App\Services\OpenRouterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    protected $openRouter;

    public function __construct(OpenRouterService $openRouter)
    {
        $this->openRouter = $openRouter;
    }

    /**
     * Display a listing of messages (typically not used - messages loaded via conversation).
     */
    public function index(Request $request)
    {
        // Optional: list messages for a specific conversation
        $validator = Validator::make($request->all(), [
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $messages = Message::whereHas('conversation', function($query) use ($user, $request) {
            $query->where('user_id', $user->id)
                  ->where('id', $request->conversation_id);
        })->orderBy('created_at')->get();

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    /**
     * Store a newly created message (not typically used directly).
     * Messages are usually created via chat endpoint.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'conversation_id' => 'required|exists:conversations,id',
            'role' => 'required|in:user,assistant,system',
            'content' => 'required|string|max:10000',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $conversation = Conversation::where('id', $request->conversation_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found'
            ], 404);
        }

        $message = Message::create([
            'conversation_id' => $request->conversation_id,
            'role' => $request->role,
            'content' => $request->content,
            'metadata' => $request->metadata ?? [],
        ]);

        return response()->json([
            'success' => true,
            'data' => $message
        ], 201);
    }

    /**
     * Display the specified message.
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        
        $message = Message::whereHas('conversation', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })->find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Message not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $message
        ]);
    }

    /**
     * Update the specified message (edit user message).
     */
    public function update(Request $request, string $id)
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

        $message->update([
            'content' => $request->content
        ]);

        return response()->json([
            'success' => true,
            'data' => $message
        ]);
    }

    /**
     * Remove the specified message.
     */
    public function destroy(Request $request, string $id)
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
     * Regenerate assistant response from a specific message.
     */
    public function regenerate(Request $request, string $id)
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
     * Edit a user message and regenerate all subsequent messages.
     */
    public function editAndContinue(Request $request, string $id)
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
}
