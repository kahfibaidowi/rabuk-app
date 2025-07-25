<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use App\Repository\LahanRepo;
use App\Models\LahanModel;

class LahanController extends Controller
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
            'nama_lahan'    =>"required",
            'ews_district_id'   =>"required",
            'lokasi'        =>"required",
            'pemilik'       =>"required",
            'luas_area'     =>"required|integer",
            'jarak_tanam'   =>"required",
            'jumlah_tanaman'=>"required|integer|min:0",
            'jenis_tanaman' =>"required",
            'tgl_tanam'     =>"required|date_format:Y-m-d",
            'icon'          =>"required",
            'modbus_url'    =>"required",
            'modbus_port'   =>"required",
            'urea_gram'     =>"required|integer|min:0",
            'urea_v_liter'  =>"required|integer|min:0",
            'sp36_gram'     =>"required|integer|min:0",
            'sp36_v_liter'  =>"required|integer|min:0",
            'kcl_gram'      =>"required|integer|min:0",
            'kcl_v_liter'   =>"required|integer|min:0",
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            LahanModel::create([
                'nama_lahan'    =>$req['nama_lahan'],
                'ews_district_id'   =>$req['ews_district_id'],
                'lokasi'        =>$req['lokasi'],
                'pemilik'       =>$req['pemilik'],
                'luas_area'     =>$req['luas_area'],
                'jarak_tanam'   =>$req['jarak_tanam'],
                'jumlah_tanaman'=>$req['jumlah_tanaman'],
                'jenis_tanaman' =>$req['jenis_tanaman'],
                'tgl_tanam'     =>$req['tgl_tanam'],
                'icon'          =>$req['icon'],
                'modbus_url'    =>$req['modbus_url'],
                'modbus_port'   =>$req['modbus_port'],
                'urea_gram'     =>$req['urea_gram'],
                'urea_v_liter'  =>$req['urea_v_liter'],
                'sp36_gram'     =>$req['sp36_gram'],
                'sp36_v_liter'  =>$req['sp36_v_liter'],
                'kcl_gram'      =>$req['kcl_gram'],
                'kcl_v_liter'   =>$req['kcl_v_liter']
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
                Rule::exists("App\Models\LahanModel")
            ],
            'nama_lahan'    =>"required",
            'pemilik'       =>"required",
            'jumlah_tanaman'=>"required|integer|min:0",
            'icon'          =>"required",
            'modbus_url'    =>"required",
            'modbus_port'   =>"required",
            'urea_gram'     =>"required|integer|min:0",
            'urea_v_liter'  =>"required|integer|min:0",
            'sp36_gram'     =>"required|integer|min:0",
            'sp36_v_liter'  =>"required|integer|min:0",
            'kcl_gram'      =>"required|integer|min:0",
            'kcl_v_liter'   =>"required|integer|min:0",
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
                'nama_lahan'    =>$req['nama_lahan'],
                'pemilik'       =>$req['pemilik'],
                'jumlah_tanaman'=>$req['jumlah_tanaman'],
                'icon'          =>$req['icon'],
                'modbus_url'    =>$req['modbus_url'],
                'modbus_port'   =>$req['modbus_port'],
                'urea_gram'     =>$req['urea_gram'],
                'urea_v_liter'  =>$req['urea_v_liter'],
                'sp36_gram'     =>$req['sp36_gram'],
                'sp36_v_liter'  =>$req['sp36_v_liter'],
                'kcl_gram'      =>$req['kcl_gram'],
                'kcl_v_liter'   =>$req['kcl_v_liter']
            ];

            LahanModel::where("id", $req['id'])
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
                Rule::exists("App\Models\LahanModel")
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
            LahanModel::where("id", $req['id'])->delete();
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
                Rule::exists("App\Models\LahanModel")
            ]
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=LahanRepo::get($req['id']);

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
            'jenis_tanaman' =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=LahanRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$data['current_page'],
            'last_page'     =>$data['last_page'],
            'total'         =>$data['total'],
            'data'          =>$data['data']
        ]);
    }
}
