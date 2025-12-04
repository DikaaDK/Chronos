<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Group;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('journals.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('users.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('groups.{groupId}', function ($user, $groupId) {
    return Group::where('id', $groupId)
        ->whereHas('users', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })->exists();
});
