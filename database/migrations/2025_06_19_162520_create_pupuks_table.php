<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pupuks', function (Blueprint $table) {
            $table->id();
            $table->foreignId("lahan_id")->constrained()->onDelete("cascade");
            $table->unsignedInteger("usia_tanaman");
            $table->unsignedBigInteger("jumlah_tanaman");
            $table->double("dosis_urea")->nullable();
            $table->double("dosis_mkp")->nullable();
            $table->double("dosis_kcl")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pupuks');
    }
};
