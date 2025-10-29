<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; // ✅ Correct import
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Project extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'color',
        'icon',
        'order',
        'is_archived',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'order' => 'integer',
    ];

    protected $appends = [
        'conversations_count'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('created_at', 'desc');
    }

    public function getConversationsCountAttribute()
    {
        return $this->conversations()->count();
    }
}