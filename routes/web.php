<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;


//AUTH ROUTE
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthController::class, 'login'])->name('login');
    Route::post('login_user_pass', [AuthController::class, 'login_user_pass'])->name("login_user_pass");
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
});


//DASHBOARD ROUTE
Route::get('/', [DashboardController::class, 'dashboard']);
Route::get('/ai_recomendation', [DashboardController::class, 'ai_recomendation']);
Route::get('/lahan', [DashboardController::class, 'lahan']);
Route::get('/lahan/add', [DashboardController::class, 'add_lahan']);
Route::get('/lahan/edit', [DashboardController::class, 'edit_lahan']);
Route::get('/lahan/cek_tanaman', [DashboardController::class, 'cek_tanaman']);

//API ROUTE
Route::middleware(["api"])->prefix("/api")->group(base_path('routes/api.php'));

Route::get('/testing', function () {
    $modbus_url="http://localhost:8080";

    $list=[
        'modbus_url'    =>"192.168.0.1",
        'modbus_port'   =>"502",
        'id'            =>1
    ];
    $connect_modbus=Http::retry(3, 100)
        ->accept('application/json')
        ->post($modbus_url."/connect", [
            "url"       =>$list['modbus_url'],
            "port"      =>$list['modbus_port'],
            "lahan_id"  =>$list['id']
        ]);
    
    $sensor_status="";
    $sensor_data=['sd'];
    $retry=0;
    while($sensor_status==""){
        $modbus_data=Http::retry(3, 100)
            ->accept('application/json')
            ->get($modbus_url."/data_sensor", [
                "process_id"=>$connect_modbus['process_id'],
                "lahan_id"  =>$list['id']
            ]);

        $sensor_status=$modbus_data['status'];
        $sensor_data=$modbus_data['data'];
        $retry++;
    }

    return response()->json([
        'data'  =>$sensor_data,
        'status'=>$sensor_status,
        'retry' =>$retry
    ]);
});

