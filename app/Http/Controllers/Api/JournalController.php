<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use Illuminate\Http\Request;

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
        return response()->json($journal);
    }
    public function destroy(Request $request, $id)
    {
        $journal = Journal::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $journal->delete();
        return response()->json(['message' => 'Jurnal berhasil dihapus']);
    }
}
