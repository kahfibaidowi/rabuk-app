<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use App\Repository\LahanDetailRepo;
use App\Models\LahanDetailModel;

class LahanDetailController extends Controller
{

    public function add(Request $request)
    {
        // $login_data=$request->user();
        $req=$request->all();

        // //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        $validation=Validator::make($req, [
            'lahan_id'      =>"required|exists:App\Models\LahanModel,id",
            'soil_n'        =>"required|numeric",
            'soil_p'        =>"required|numeric",
            'soil_k'        =>"required|numeric",
            'soil_ph'       =>"required|numeric",
            'cec'           =>"required|numeric",
            'soil_ec'       =>"required|numeric",
            'soil_s'        =>"required|numeric",
            'soil_tds'      =>"required|numeric",
            'soil_h'        =>"required|numeric",
            'soil_t'        =>"required|numeric",
            'usia_tanaman'  =>"required|integer",
            'curah_hujan'   =>"required|numeric"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            LahanDetailModel::create([
                'lahan_id'      =>$req['lahan_id'],
                'soil_n'        =>$req['soil_n'],
                'soil_p'        =>$req['soil_p'],
                'soil_k'        =>$req['soil_k'],
                'soil_ph'       =>$req['soil_ph'],
                'cec'           =>$req['cec'],
                'soil_ec'       =>$req['soil_ec'],
                'soil_s'        =>$req['soil_s'],
                'soil_tds'      =>$req['soil_tds'],
                'soil_h'        =>$req['soil_h'],
                'soil_t'        =>$req['soil_t'],
                'usia_tanaman'  =>$req['usia_tanaman'],
                'curah_hujan'   =>$req['curah_hujan']
            ]);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function update(Request $request, $id)
    {
        // $login_data=$request['__data_user'];
        $req=$request->all();

        // //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        $req['id']=$id;
        $validation=Validator::make($req, [
            'id' =>[
                "required",
                Rule::exists("App\Models\LahanDetailModel")
            ],
            'soil_n'        =>"required|numeric",
            'soil_p'        =>"required|numeric",
            'soil_k'        =>"required|numeric",
            'soil_ph'       =>"required|numeric",
            'cec'           =>"required|numeric",
            'soil_ec'       =>"required|numeric",
            'soil_s'        =>"required|numeric",
            'soil_tds'      =>"required|numeric",
            'soil_h'        =>"required|numeric",
            'soil_t'        =>"required|numeric",
            'usia_tanaman'  =>"required|integer",
            'curah_hujan'   =>"required|numeric"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            $data_update=[
                'soil_n'        =>$req['soil_n'],
                'soil_p'        =>$req['soil_p'],
                'soil_k'        =>$req['soil_k'],
                'soil_ph'       =>$req['soil_ph'],
                'cec'           =>$req['cec'],
                'soil_ec'       =>$req['soil_ec'],
                'soil_s'        =>$req['soil_s'],
                'soil_tds'      =>$req['soil_tds'],
                'soil_h'        =>$req['soil_h'],
                'soil_t'        =>$req['soil_t'],
                'usia_tanaman'  =>$req['usia_tanaman'],
                'curah_hujan'   =>$req['curah_hujan']
            ];

            LahanDetailModel::where("id", $req['id'])
                ->update($data_update);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function delete(Request $request, $id)
    {
        // $login_data=$request->user();
        $req=$request->all();

        // //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        $req['id']=$id;
        $validation=Validator::make($req, [
            'id'   =>[
                "required",
                Rule::exists("App\Models\LahanDetailModel")
            ],
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            LahanDetailModel::where("id", $req['id'])->delete();
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function get(Request $request, $id)
    {
        // $login_data=$request->user();
        $req=$request->all();

        // //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        $req['id']=$id;
        $validation=Validator::make($req, [
            'id'  =>[
                "required",
                Rule::exists("App\Models\LahanDetailModel")
            ]
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=LahanDetailRepo::get($req['id']);

        return response()->json([
            'data'      =>$data
        ]);
    }

    public function gets(Request $request)
    {
        // $login_data=$request->user();
        $req=$request->all();

        // //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        //Query parameters
        $validation=Validator::make($req, [
            'per_page'      =>"nullable|integer|min:1",
            'lahan_id'      =>"nullable",
            'date_start'    =>"nullable|date_format:Y-m-d",
            'date_end'      =>"nullable|date_format:Y-m-d"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=LahanDetailRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$data['current_page'],
            'last_page'     =>$data['last_page'],
            'total'         =>$data['total'],
            'data'          =>$data['data']
        ]);
    }

    public function get_last(Request $request)
    {
        // $login_data=$request->user();
        $req=$request->all();

        // //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        //Query parameters
        $validation=Validator::make($req, [
            'lahan_id'  =>"nullable",
            'status'    =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=LahanDetailRepo::get_last($req);

        return response()->json([
            'data'      =>$data
        ]);
    }
}
