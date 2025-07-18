<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cookie;
use Inertia\Inertia;
use Inertia\Response;
use App\Repository\LahanRepo;

class DashboardController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $req=$request->all();
        
        return Inertia::render('dashboard/index', [
            'lahan'     =>LahanRepo::gets([])['data'],
            'lahan_id'  =>isset($req['lahan_id'])?trim($req['lahan_id']):""
        ]);
    }

    public function ai_recomendation(Request $request): Response
    {
        $req=$request->all();
        
        return Inertia::render('ai_recomendation/index', [
            'lahan'     =>LahanRepo::gets([])['data'],
            'lahan_id'  =>isset($req['lahan_id'])?trim($req['lahan_id']):""
        ]);
    }

    public function lahan(Request $request): Response
    {
        $req=$request->all();
        
        return Inertia::render('lahan/index', [
            'lahan_id'  =>isset($req['lahan_id'])?trim($req['lahan_id']):""
        ]);
    }

    public function add_lahan(Request $request): Response
    {
        $req=$request->all();
        
        return Inertia::render('lahan/add', [
            'lahan_id'  =>isset($req['lahan_id'])?trim($req['lahan_id']):""
        ]);
    }

    public function edit_lahan(Request $request): Response
    {
        $req=$request->all();
        
        return Inertia::render('lahan/edit', [
            'lahan'     =>LahanRepo::get($req['lahan_id']),
            'lahan_id'  =>isset($req['lahan_id'])?trim($req['lahan_id']):""
        ]);
    }

    public function cek_tanaman(Request $request): Response
    {
        $req=$request->all();

        return Inertia::render('lahan/cek_tanaman', [
            'lahan'     =>LahanRepo::gets([])['data'],
            'lahan_id'  =>isset($req['lahan_id'])?trim($req['lahan_id']):""
        ]);
    }
}
