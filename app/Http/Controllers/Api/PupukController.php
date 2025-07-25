<?php

namespace App\Http\Controllers\Api;

use App\Helpers\GeneralHelper;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use ModbusTcpClient\Network\BinaryStreamConnection;
use ModbusTcpClient\Packet\ModbusFunction\WriteMultipleRegistersRequest;
use ModbusTcpClient\Packet\ModbusFunction\WriteMultipleRegistersResponse;
use ModbusTcpClient\Packet\ResponseFactory;
use ModbusTcpClient\Utils\Endian;
use ModbusTcpClient\Utils\Types;
use App\Repository\PupukRepo;
use App\Repository\LahanRepo;
use App\Models\PupukModel;

class PupukController extends Controller
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
            'usia_tanaman'  =>"required|integer",
            'jumlah_tanaman'=>"required|integer",
            "dosis_urea"    =>"present",
            "dosis_sp36"    =>"present",
            "dosis_kcl"     =>"present"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data_urea=null;
        DB::transaction(function()use($req, &$data_urea){
            $lahan=LahanRepo::get($req['lahan_id']);

            if($req['dosis_urea']!=""){
                $process_rabuk=GeneralHelper::process_mv("urea", $req['dosis_urea'], $lahan);
                $data_urea=$process_rabuk;
            }

            PupukModel::create([
                'lahan_id'      =>$req['lahan_id'],
                'usia_tanaman'  =>$req['usia_tanaman'],
                'jumlah_tanaman'=>$req['jumlah_tanaman'],
                'dosis_urea'    =>$req['dosis_urea']!=""?$req['dosis_urea']:null,
                'dosis_sp36'    =>$req['dosis_sp36']!=""?$req['dosis_sp36']:null,
                'dosis_kcl'     =>$req['dosis_kcl']!=""?$req['dosis_kcl']:null
            ]);
        });

        return response()->json([
            'status'=>"ok",
            'simulated'=>$data_urea
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
                Rule::exists("App\Models\PupukModel")
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
            PupukModel::where("id", $req['id'])->delete();
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
                Rule::exists("App\Models\PupukModel")
            ]
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=PupukRepo::get($req['id']);

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
            'lahan_id'      =>"nullable"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        $data=PupukRepo::gets($req);

        return response()->json([
            'first_page'    =>1,
            'current_page'  =>$data['current_page'],
            'last_page'     =>$data['last_page'],
            'total'         =>$data['total'],
            'data'          =>$data['data']
        ]);
    }

    public function simulate_rabuk(Request $request)
    {
        // $login_data=$request->user();
        $req=$request->all();

        //variable
        $berat_pupuk=$req['berat_rabuk']; #gram pupuk yang akan dikonversi ke cair
        $pupuk=$req['rabuk'];
        $modbus_url=$req['modbus_url'];
        $modbus_port=$req['modbus_port'];

        $options=[
            'modbus_url'    =>$req['modbus_url'],
            'modbus_port'   =>$req['modbus_port'],
            'urea_gram'     =>$req['urea_gram'],
            'urea_v_liter'  =>$req['urea_v_liter'],
            'sp36_gram'     =>$req['sp36_gram'],
            'sp36_v_liter'  =>$req['sp36_v_liter'],
            'kcl_gram'      =>$req['kcl_gram'],
            'kcl_v_liter'   =>$req['kcl_v_liter'],
        ];
        $process_rabuk=GeneralHelper::process_mv($pupuk, $berat_pupuk, $options);

        return response()->json([
            'waktu_tunggu'  =>$process_rabuk['waktu_tunggu'],
            'waktu_tunggu_plus_tutup'   =>$process_rabuk['waktu_tunggu_plus_tutup'],
            'waktu_tunggu_simulasi' =>$process_rabuk['waktu_tunggu_simulasi']
        ]);
    }

    public function simulate_time(Request $request)
    {
        // $login_data=$request->user();
        $req=$request->all();

        //variable

        $options=[
            'modbus_url'    =>$req['modbus_url'],
            'modbus_port'   =>$req['modbus_port'],
            'time'          =>$req['time']
        ];
        $process_rabuk=GeneralHelper::process_mv_time("urea", 10, $options);

        return response()->json([
            'waktu_tunggu'  =>$process_rabuk['waktu_tunggu'],
            'waktu_tunggu_plus_tutup'   =>$process_rabuk['waktu_tunggu_plus_tutup'],
            'waktu_tunggu_simulasi' =>$process_rabuk['waktu_tunggu_simulasi']
        ]);
    }

    public function simulate_weight(Request $request)
    {
        // $login_data=$request->user();
        $req=$request->all();

        //variable

        $options=[
            'modbus_url'    =>$req['modbus_url'],
            'modbus_port'   =>$req['modbus_port'],
            'berat_rabuk'   =>$req['berat_rabuk']
        ];
        $process_rabuk=GeneralHelper::process_mv_rabuk_time("urea", $options['berat_rabuk'], $options);

        return response()->json([
            'waktu_tunggu'  =>$process_rabuk['waktu_tunggu'],
            'waktu_tunggu_plus_tutup'   =>$process_rabuk['waktu_tunggu_plus_tutup'],
            'waktu_tunggu_simulasi' =>$process_rabuk['waktu_tunggu_simulasi']
        ]);
    }
}
