<?php

namespace App\Http\Controllers\Api;

use App\Events\JournalUpdated;
use App\Http\Controllers\Controller;
use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        $journals = Journal::where('user_id', $request->user()->id)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($journals);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'date' => 'nullable|string',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $startDate = $validated['start_date'];
        $endDate = $validated['end_date'] ?? $startDate;

        $journal = Journal::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'start_date' => $startDate,
            'end_date' => $endDate,
            'date' => $startDate,
            'progress' => $validated['progress'] ?? 0,
        ]);

        $this->broadcastJournalUpdate(
            $request->user()->id,
            'created',
            $journal->fresh()->toArray()
        );

        return response()->json($journal, 201);
    }
    public function show(Request $request, $id)
    {
        $journal = Journal::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json($journal);
    }
    public function update(Request $request, $id)
    {
        $journal = Journal::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'date' => 'nullable|string',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $startDate = $validated['start_date'];
        $endDate = $validated['end_date'] ?? $startDate;

        $journal->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'start_date' => $startDate,
            'end_date' => $endDate,
            'date' => $startDate,
            'progress' => $validated['progress'] ?? $journal->progress,
        ]);

        $this->broadcastJournalUpdate(
            $request->user()->id,
            'updated',
            $journal->fresh()->toArray()
        );
        return response()->json($journal);
    }
    public function destroy(Request $request, $id)
    {
        $journal = Journal::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $deletedId = $journal->id;
        $journal->delete();

        $this->broadcastJournalUpdate(
            $request->user()->id,
            'deleted',
            ['id' => $deletedId]
        );

        return response()->json(['message' => 'Jurnal berhasil dihapus']);
    }

    protected function broadcastJournalUpdate(int $userId, string $action, ?array $payload): void
    {
        rescue(
            fn () => JournalUpdated::dispatch($userId, $action, $payload),
            function (Throwable $exception) use ($userId, $action) {
                Log::warning('Failed to broadcast journal update', [
                    'user_id' => $userId,
                    'action' => $action,
                    'error' => $exception->getMessage(),
                ]);
            },
            false
        );
    }
}
