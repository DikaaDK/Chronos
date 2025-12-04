<?php

namespace App\Http\Controllers\Api;

use App\Events\GroupScheduleUpdated;
use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\GroupTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Throwable;

class GroupTaskController extends Controller
{
    public function index(Request $request, Group $group)
    {
        $this->ensureMember($request->user()->id, $group);

        $tasks = GroupTask::where('group_id', $group->id)
            ->orderBy('task_date')
            ->get();

        return response()->json($tasks);
    }

    public function upsert(Request $request, Group $group)
    {
        $this->ensureMember($request->user()->id, $group);

        $validated = $request->validate([
            'task_date' => ['required', 'date'],
            'user_id' => ['required', 'integer', Rule::exists('group_user', 'user_id')->where('group_id', $group->id)],
            'task' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['pending', 'progress', 'done'])],
        ]);

        if ((int) $validated['user_id'] !== $request->user()->id) {
            abort(403, 'Anda hanya bisa memperbarui jurnal milik sendiri.');
        }

        $taskValue = trim((string) ($validated['task'] ?? ''));
        $statusValue = $validated['status'] ?? null;

        $entry = GroupTask::where('group_id', $group->id)
            ->where('user_id', $validated['user_id'])
            ->where('task_date', $validated['task_date'])
            ->first();

        if ($taskValue === '' && $statusValue === null) {
            if ($entry) {
                $entry->delete();

                $this->broadcastGroupScheduleUpdate(
                    $group->id,
                    'deleted',
                    [
                        'group_id' => $group->id,
                        'user_id' => $validated['user_id'],
                        'task_date' => $validated['task_date'],
                    ]
                );
            }

            return response()->json(['status' => 'cleared']);
        }

        $payload = [
            'task' => $taskValue,
            'status' => $statusValue,
            'updated_by_user_id' => $request->user()->id,
        ];

        $entry = GroupTask::updateOrCreate([
            'group_id' => $group->id,
            'user_id' => $validated['user_id'],
            'task_date' => $validated['task_date'],
        ], $payload);

        $freshEntry = $entry->fresh();

        $this->broadcastGroupScheduleUpdate(
            $group->id,
            'upserted',
            $freshEntry?->toArray()
        );

        return response()->json($freshEntry);
    }

    protected function ensureMember(int $userId, Group $group): void
    {
        $isMember = $group->users()->where('users.id', $userId)->exists();

        abort_if(! $isMember, 403, 'Anda tidak tergabung di group ini.');
    }

    protected function broadcastGroupScheduleUpdate(int $groupId, string $action, ?array $entry): void
    {
        rescue(
            fn () => GroupScheduleUpdated::dispatch($groupId, $action, $entry),
            function (Throwable $exception) use ($groupId, $action) {
                Log::warning('Failed to broadcast group schedule update', [
                    'group_id' => $groupId,
                    'action' => $action,
                    'error' => $exception->getMessage(),
                ]);
            },
            false
        );
    }
}
