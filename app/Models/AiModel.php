<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AiModel extends Model
{
    protected $table = 'models';

    protected $fillable = [
        'model_id',
        'name',
        'description',
        'pricing',
        'context_length',
        'architecture',
        'top_provider',
        'per_request_limits',
        'category',
        'provider',
        'is_active',
        'metadata',
        'last_synced_at',
    ];

    protected $casts = [
        'pricing' => 'array',
        'architecture' => 'array',
        'per_request_limits' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
        'last_synced_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByProvider($query, $provider)
    {
        return $query->where('provider', $provider);
    }
}
