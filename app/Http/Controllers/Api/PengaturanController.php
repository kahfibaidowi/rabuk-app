<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use App\Repository\PengaturanRepo;
use App\Models\PengaturanModel;

class PengaturanController extends Controller
{
    public function update(Request $request)
    {
        // $login_data=$request['__data_user'];
        $req=$request->all();

        // //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION
        $validation=Validator::make($req, [
            'modbus_url'    =>"required",
            'modbus_port'   =>"required",
            'urea_per_liter'=>"required|integer|min:0",
            'mkp_per_liter' =>"required|integer|min:0"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req){
            PengaturanModel::where(["label"=>"modbus_url"])->update(["value"=>$req['modbus_url']]);
            PengaturanModel::where(["label"=>"modbus_port"])->update(["value"=>$req['modbus_port']]);
            PengaturanModel::where(["label"=>"urea_per_liter"])->update(["value"=>$req['urea_per_liter']]);
            PengaturanModel::where(["label"=>"mkp_per_liter"])->update(["value"=>$req['mkp_per_liter']]);
        });

        return response()->json([
            'status'=>"ok"
        ]);
    }

    public function get(Request $request)
    {
        // $login_data=$request->user();
        $req=$request->all();

        // //ROLE AUTHENTICATION
        // if(!in_array($login_data['role'], ['admin'])){
        //     return response('Not Allowed.', 403);
        // }

        //VALIDATION

        //SUCCESS
        $data=PengaturanRepo::get();

        return response()->json([
            'data'      =>$data
        ]);
    }
}
