<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\PengaturanModel;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        PengaturanModel::create([
            'label' =>"modbus_url",
            'value' =>"127.0.0.1"
        ]);
        PengaturanModel::create([
            'label' =>"modbus_port",
            'value' =>"502"
        ]);
        PengaturanModel::create([
            'label' =>"urea_per_liter",
            'value' =>"10"
        ]);
        PengaturanModel::create([
            'label' =>"mkp_per_liter",
            'value' =>"10"
        ]);
    }
}
