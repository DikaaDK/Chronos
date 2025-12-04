<?php

use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('prevents editing journals belonging to other members', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $group = Group::create([
        'name' => 'Kronos Squad',
        'description' => null,
        'invite_code' => Str::upper(Str::random(8)),
        'owner_id' => $owner->id,
    ]);

    $group->users()->attach($owner->id, ['role' => 'owner']);
    $group->users()->attach($member->id, ['role' => 'member']);

    Sanctum::actingAs($owner);

    $payload = [
        'task_date' => now()->toDateString(),
        'user_id' => $member->id,
        'task' => 'Override task',
        'status' => 'done',
    ];

    $response = $this->putJson("/api/groups/{$group->id}/tasks", $payload);

    $response->assertForbidden()
        ->assertJson([
            'message' => 'Anda hanya bisa memperbarui jurnal milik sendiri.',
        ]);

    $this->assertDatabaseMissing('group_tasks', [
        'group_id' => $group->id,
        'user_id' => $member->id,
        'task_date' => $payload['task_date'],
    ]);
});

it('allows members to update their own journals', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $group = Group::create([
        'name' => 'Chronos Study Club',
        'description' => null,
        'invite_code' => Str::upper(Str::random(8)),
        'owner_id' => $owner->id,
    ]);

    $group->users()->attach($owner->id, ['role' => 'owner']);
    $group->users()->attach($member->id, ['role' => 'member']);

    Sanctum::actingAs($member);

    $payload = [
        'task_date' => now()->toDateString(),
        'user_id' => $member->id,
        'task' => 'Latihan soal matematika',
        'status' => 'progress',
    ];

    $response = $this->putJson("/api/groups/{$group->id}/tasks", $payload);

    $response->assertOk()
        ->assertJsonFragment([
            'group_id' => $group->id,
            'user_id' => $member->id,
            'task' => $payload['task'],
            'status' => $payload['status'],
        ]);

    $this->assertDatabaseHas('group_tasks', [
        'group_id' => $group->id,
        'user_id' => $member->id,
        'task_date' => $payload['task_date'],
        'task' => $payload['task'],
        'status' => $payload['status'],
        'updated_by_user_id' => $member->id,
    ]);
});
