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
        Schema::create('lahans', function (Blueprint $table) {
            $table->id();
            $table->string("nama_lahan");
            $table->unsignedBigInteger("ews_district_id");
            $table->string("lokasi");
            $table->string("pemilik");
            $table->unsignedInteger("luas_area")->comment("m2");
            $table->string("jarak_tanam");
            $table->unsignedInteger("jumlah_tanaman");
            $table->string("jenis_tanaman");
            $table->date("tgl_tanam");
            $table->text("icon");
            $table->string("modbus_url");
            $table->string("modbus_port");
            $table->string("modbus_status")->default("disconnected");
            $table->unsignedInteger("urea_per_liter");
            $table->unsignedInteger("mkp_per_liter");
            $table->timestamps();
        });

        Schema::create('lahan_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("lahan_id")->index();
            $table->double("soil_n")->nullable();
            $table->double("soil_p")->nullable();
            $table->double("soil_k")->nullable();
            $table->double("soil_ph")->nullable();
            $table->double("cec")->nullable();
            $table->double("soil_ec")->nullable();
            $table->double("soil_s")->nullable();
            $table->double("soil_tds")->nullable();
            $table->double("soil_h")->nullable();
            $table->double("soil_t")->nullable();
            $table->unsignedInteger("usia_tanaman")->nullable();
            $table->double("curah_hujan")->nullable();
            $table->string("modbus_status");
            $table->timestamps();

            $table->foreign('lahan_id')->references('id')->on('lahans')->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lahan_details');
        Schema::dropIfExists('lahans');
    }
};
