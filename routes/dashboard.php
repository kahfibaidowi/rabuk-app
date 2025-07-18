<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\ModbusSensorController;
use App\Http\Controllers\Dashboard\LahanController;


Route::get('/', [DashboardController::class, 'index'])->name("dashboard");

Route::get('/modbus_sensor', [ModbusSensorController::class, 'index']);
Route::get('/lahan', [LahanController::class, 'index']);
Route::get('/lahan/detail/{id}', [LahanController::class, 'detail']);
Route::get('/lahan/cek_tanaman/{id}', [LahanController::class, 'cek_tanaman']);