<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show the login page.
     */
    public function login(Request $request): Response
    {
        return Inertia::render('login', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function login_user_pass(LoginRequest $request): RedirectResponse
    {
        $req=$request->all();

        //VALIDATION
        $validation=Validator::make($req, [
            'email'     =>"required",
            'password'  =>"required",
            'remember'  =>"required|boolean"
        ]);
        if($validation->fails()){
            return back()->withErrors([
                'type'      =>"validation_error",
                'message'   =>$validation->errors()->first()
            ]);
        }

        //AUTH
        $user=Auth::attempt(
            [
                'email'     =>$req['email'],
                'password'  =>$req['password'],
                'login_type'=>"user_pass"
            ], 
            $req['remember']
        );
        if(!$user){
            return back()
                ->withErrors([
                    'email' => 'The provided credentials do not match our records.',
                ])
                ->onlyInput('email');
        }


        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
