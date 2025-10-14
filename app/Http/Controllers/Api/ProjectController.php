<?php
// app/Http/Controllers/Api/ProjectController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    /**
     * GET /api/projects
     * Get all projects for current user
     */
    public function index(Request $request)
    {
        $query = Project::query();

        if ($request->user()) {
            $query->where('user_id', $request->user()->id);
        }

        // Filter archived
        if ($request->has('archived')) {
            $query->where('is_archived', $request->boolean('archived'));
        } else {
            $query->active();
        }

        // Load conversations count
        $query->withCount('conversations');

        // Order
        $projects = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $projects
        ]);
    }

    /**
     * POST /api/projects
     * Create a new project
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'icon' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $project = Project::create([
            'user_id' => $request->user()->id ?? null,
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color ?? '#3B82F6',
            'icon' => $request->icon,
            'order' => Project::max('order') + 1,
        ]);

        return response()->json([
            'success' => true,
            'data' => $project,
            'message' => 'Project created successfully'
        ], 201);
    }

    /**
     * GET /api/projects/{id}
     * Get a specific project with its conversations
     */
    public function show(Request $request, $id)
    {
        $project = Project::with(['conversations' => function($query) {
            $query->with(['messages' => function($q) {
                $q->latest()->limit(1);
            }])->recent();
        }])->find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        // Check ownership
        if ($request->user() && $project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $project
        ]);
    }

    /**
     * PUT /api/projects/{id}
     * Update a project
     */
    public function update(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        // Check ownership
        if ($request->user() && $project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'icon' => 'nullable|string|max:50',
            'order' => 'nullable|integer|min:0',
            'is_archived' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $project->update($request->only([
            'name', 
            'description', 
            'color', 
            'icon', 
            'order', 
            'is_archived'
        ]));

        return response()->json([
            'success' => true,
            'data' => $project,
            'message' => 'Project updated successfully'
        ]);
    }

    /**
     * DELETE /api/projects/{id}
     * Delete a project
     */
    public function destroy(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        // Check ownership
        if ($request->user() && $project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Option: Move conversations to null (unassigned) or delete them
        // Here we're setting to null (conversations remain but unassigned)
        Conversation::where('project_id', $project->id)
            ->update(['project_id' => null]);

        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully'
        ]);
    }

    /**
     * POST /api/projects/{id}/conversations
     * Create a new conversation in a project
     */
    public function createConversation(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        // Check ownership
        if ($request->user() && $project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'model_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $conversation = Conversation::create([
            'user_id' => $request->user()->id ?? null,
            'project_id' => $project->id,
            'title' => $request->title ?? 'New Conversation',
            'model_id' => $request->model_id,
            'settings' => [
                'temperature' => $request->temperature ?? 0.7,
                'max_tokens' => $request->max_tokens ?? 2000,
            ],
        ]);

        return response()->json([
            'success' => true,
            'data' => $conversation,
            'message' => 'Conversation created in project'
        ], 201);
    }

    /**
     * POST /api/projects/{id}/conversations/add
     * Add existing conversation(s) to a project
     */
    public function addConversations(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        // Check ownership
        if ($request->user() && $project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'conversation_ids' => 'required|array|min:1',
            'conversation_ids.*' => 'required|integer|exists:conversations,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Update conversations to belong to this project
        $updated = Conversation::whereIn('id', $request->conversation_ids)
            ->where('user_id', $request->user()->id ?? null)
            ->update(['project_id' => $project->id]);

        return response()->json([
            'success' => true,
            'message' => "{$updated} conversation(s) added to project",
            'count' => $updated
        ]);
    }

    /**
     * DELETE /api/projects/{projectId}/conversations/{conversationId}
     * Remove a conversation from a project (sets project_id to null)
     */
    public function removeConversation(Request $request, $projectId, $conversationId)
    {
        $project = Project::find($projectId);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation not found'
            ], 404);
        }

        // Check ownership
        if ($request->user() && $project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($conversation->project_id !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Conversation is not in this project'
            ], 400);
        }

        $conversation->update(['project_id' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Conversation removed from project'
        ]);
    }

    /**
     * GET /api/projects/{id}/conversations
     * Get all conversations in a project
     */
    public function conversations(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        // Check ownership
        if ($request->user() && $project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $conversations = $project->conversations()
            ->with(['messages' => function($q) {
                $q->latest()->limit(1);
            }])
            ->recent()
            ->paginate($request->get('per_page', 20));

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
     * POST /api/projects/{id}/archive
     * Archive/Unarchive a project
     */
    public function toggleArchive(Request $request, $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found'
            ], 404);
        }

        // Check ownership
        if ($request->user() && $project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $project->update([
            'is_archived' => !$project->is_archived
        ]);

        return response()->json([
            'success' => true,
            'data' => $project,
            'message' => $project->is_archived ? 'Project archived' : 'Project unarchived'
        ]);
    }
}