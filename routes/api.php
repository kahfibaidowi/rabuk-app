<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ModbusSensorController;
use App\Http\Controllers\Api\LahanController;
use App\Http\Controllers\Api\LahanDetailController;
use App\Http\Controllers\Api\PupukController;
use App\Http\Controllers\Api\PengaturanController;


//PENGATURAN
Route::controller(PengaturanController::class)->prefix("/pengaturan")->group(function(){
    Route::put("/", "update");
    Route::get("/", "get");
});

//LAHAN
Route::controller(LahanController::class)->prefix("/lahan")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::put("/actions/update_status/{id}", "update_status");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
});

//LAHAN DETAIL
Route::controller(LahanDetailController::class)->prefix("/lahan_detail")->group(function(){
    Route::post("/", "add");
    Route::put("/{id}", "update");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
    Route::get("/type/last", "get_last");
});

//PUPUK
Route::controller(PupukController::class)->prefix("/pupuk")->group(function(){
    Route::post("/", "add");
    Route::delete("/{id}", "delete");
    Route::get("/", "gets");
    Route::get("/{id}", "get");
    Route::post("/simulate_rabuk", "simulate_rabuk");
    Route::post("/simulate_time", "simulate_time");
    Route::post("/simulate_weight", "simulate_weight");
    Route::post("/simulate_step", "simulate_step");
    Route::post("/simulate_irigasi", "simulate_irigasi");
});