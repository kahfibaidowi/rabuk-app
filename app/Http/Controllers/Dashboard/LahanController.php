<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class LahanController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('dashboard/lahan/index');
    }

    public function detail(Request $request, $id)
    {
        return Inertia::render('dashboard/lahan/detail', [
            'lahan_id'  =>$id
        ]);
    }

    public function cek_tanaman(Request $request, $id)
    {
        return Inertia::render('dashboard/lahan/cek_tanaman', [
            'lahan_id'  =>$id
        ]);
    }
}
