<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'user_id',
        'task_date',
        'task',
        'status',
        'updated_by_user_id',
    ];

    protected $casts = [
        'task_date' => 'date:Y-m-d',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }
}
