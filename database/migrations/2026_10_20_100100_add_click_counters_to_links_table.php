<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('links', function (Blueprint $table) {
            $table->unsignedInteger('clicks')->default(0)->after('destination');
            $table->timestamp('last_clicked_at')->nullable()->after('clicks');
        });
    }

    public function down(): void
    {
        Schema::table('links', function (Blueprint $table) {
            $table->dropColumn(['clicks', 'last_clicked_at']);
        });
    }
};
