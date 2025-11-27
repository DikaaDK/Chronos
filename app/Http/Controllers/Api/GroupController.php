<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Group;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class GroupController extends Controller
{
    public function index()
    {
        $groups = Auth::user()->groups;
        return response()->json($groups);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $group = Group::create([
            'name' => $request->name,
            'description' => $request->description,
            'invite_code' => Str::random(8),
            'owner_id' => Auth::id(),
        ]);

        $group->users()->attach(Auth::id(), ['role' => 'owner']);

        return response()->json($group, 201);
    }

    public function join(Request $request)
    {
        $request->validate([
            'invite_code' => 'required|string',
        ]);

        $group = Group::where('invite_code', $request->invite_code)->firstOrFail();

        if ($group->users()->where('users.id', Auth::id())->exists()) {
            return response()->json(['message' => 'You already joined this group'], 400);
        }

        $group->users()->attach(Auth::id(), ['role' => 'member']);

        return response()->json(['message' => 'Joined successfully', 'group' => $group]);
    }

    public function show($id)
    {
        $group = Group::with('users')->findOrFail($id);
        return response()->json($group);
    }
}
