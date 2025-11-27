<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('journals', 'start_date')) {
            Schema::table('journals', function (Blueprint $table) {
                $table->date('start_date')->nullable()->after('content');
            });
        }

        if (!Schema::hasColumn('journals', 'end_date')) {
            Schema::table('journals', function (Blueprint $table) {
                $table->date('end_date')->nullable()->after('start_date');
            });
        }

        if (Schema::hasColumn('journals', 'start_date') && Schema::hasColumn('journals', 'end_date')) {
            DB::table('journals')
                ->select('id', 'date', 'start_date', 'end_date')
                ->chunkById(200, function ($rows) {
                    foreach ($rows as $row) {
                        if (!$row->date || ($row->start_date && $row->end_date)) {
                            continue;
                        }

                        $parsedDate = null;

                        try {
                            $parsedDate = Carbon::parse($row->date)->toDateString();
                        } catch (\Throwable $exception) {
                            continue;
                        }

                        DB::table('journals')
                            ->where('id', $row->id)
                            ->update([
                                'start_date' => $row->start_date ?? $parsedDate,
                                'end_date' => $row->end_date ?? $parsedDate,
                            ]);
                    }
                });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('journals', 'end_date')) {
            Schema::table('journals', function (Blueprint $table) {
                $table->dropColumn('end_date');
            });
        }

        if (Schema::hasColumn('journals', 'start_date')) {
            Schema::table('journals', function (Blueprint $table) {
                $table->dropColumn('start_date');
            });
        }
    }
};
