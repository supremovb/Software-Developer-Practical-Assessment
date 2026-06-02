<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Issue extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'priority',
        'category',
        'status',
        'summary',
        'suggested_next_action',
        'summary_status',
        'needs_attention',
    ];

    protected $casts = [
        'needs_attention' => 'boolean',
    ];

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->orderBy('created_at', 'asc');
    }

    public function recomputeNeedsAttention(): void
    {
        $this->needs_attention = $this->priority === 'high';
        $this->saveQuietly();
    }
}
