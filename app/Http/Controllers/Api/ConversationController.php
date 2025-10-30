<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConversationController extends Controller
{
    /**
     * Display a listing of conversations for the authenticated user.
     */
    public function index(Request $request)
    {
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
     * Store a newly created conversation (not typically used directly).
     * Conversations are usually created via chat endpoint.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'model_id' => 'required|string',
            'project_id' => 'nullable|exists:projects,id',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $conversation = Conversation::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'model_id' => $request->model_id,
            'project_id' => $request->project_id,
            'settings' => $request->settings ?? [],
        ]);

        return response()->json([
            'success' => true,
            'data' => $conversation
        ], 201);
    }

    /**
     * Display the specified conversation with all messages.
     */
    public function show(Request $request, string $id)
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
     * Update the specified conversation (title, settings, etc.).
     */
    public function update(Request $request, string $id)
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
            'project_id' => 'nullable|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $conversation->update($request->only(['title', 'model_id', 'settings', 'project_id']));

        return response()->json([
            'success' => true,
            'data' => $conversation
        ]);
    }

    /**
     * Remove the specified conversation.
     */
    public function destroy(Request $request, string $id)
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
}
