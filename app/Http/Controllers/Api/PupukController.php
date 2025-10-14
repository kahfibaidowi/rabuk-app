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
use App\Models\PengaturanModel;

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
            "dosis_mkp"    =>"present"
        ]);
        if($validation->fails()){
            return response()->json([
                'error' =>"VALIDATION_ERROR",
                'data'  =>$validation->errors()->first()
            ], 400);
        }

        //SUCCESS
        DB::transaction(function()use($req, &$data_urea){
            $lahan=LahanRepo::get($req['lahan_id']);
            $pengaturan=PengaturanRepo::get();

            //dinonaktifkan sementara
            $total_buka=0;
            $options_valve_urea=[
                'modbus_url'    =>$pengaturan['modbus_url'],
                'modbus_port'   =>$pengaturan['modbus_port'],
                'name'          =>"valve_urea",
                'sensor_selected'   =>false,
                'address'       =>"40029",
                'waktu_buka'    =>0
            ];
            $options_valve_mkp=[
                'modbus_url'    =>$pengaturan['modbus_url'],
                'modbus_port'   =>$pengaturan['modbus_port'],
                'name'          =>"valve_mkp",
                'sensor_selected'   =>false,
                'address'       =>"40031",
                'waktu_buka'    =>0
            ];
            $options_valve_irigasi=[
                'modbus_url'    =>$pengaturan['modbus_url'],
                'modbus_port'   =>$pengaturan['modbus_port'],
                'name'          =>"valve_irigasi",
                'sensor_selected'   =>true,
                'address'       =>"40033",
                'waktu_buka'    =>0
            ];

            if($req['dosis_urea']!=""){
                $volume_rabuk_urea=($req['dosis_urea']/$lahan['urea_per_liter'])*1000;
                $waktu_buka_urea=GeneralHelper::valve_volume_to_time($volume_rabuk_urea);

                $options_valve_urea['sensor_selected']=true;
                $options_valve_urea['waktu_buka']=$waktu_buka_urea;
                $total_buka+=$waktu_buka_urea;
            }
            if($req['dosis_mkp']!=""){
                $volume_rabuk_mkp=($req['dosis_mkp']/$lahan['mkp_per_liter'])*1000;
                $waktu_buka_mkp=GeneralHelper::valve_volume_to_time($volume_rabuk_mkp);

                $options_valve_mkp['sensor_selected']=true;
                $options_valve_mkp['waktu_buka']=$waktu_buka_mkp;
                $total_buka+=$waktu_buka_mkp;
            }

            $options_valve_irigasi['waktu_buka']=$total_buka/2;

            $process_irigasi_before=GeneralHelper::process_mv_rabuk("irigasi", $options_valve_irigasi);
            $data_irigasi_before=$process_irigasi_before;
            
            $process_rabuk_urea=GeneralHelper::process_mv_rabuk("urea", $options_valve_urea);
            $data_urea=$process_rabuk_urea;
            
            $process_rabuk_mkp=GeneralHelper::process_mv_rabuk("mkp", $options_valve_mkp);
            $data_mkp=$process_rabuk_mkp;
            
            $process_irigasi_after=GeneralHelper::process_mv_rabuk("irigasi", $options_valve_irigasi);
            $data_irigasi_after=$process_irigasi_after;

            //insert
            PupukModel::create([
                'lahan_id'      =>$req['lahan_id'],
                'usia_tanaman'  =>$req['usia_tanaman'],
                'jumlah_tanaman'=>$req['jumlah_tanaman'],
                'dosis_urea'    =>$req['dosis_urea']!=""?$req['dosis_urea']:null,
                'dosis_mkp'    =>$req['dosis_mkp']!=""?$req['dosis_mkp']:null
            ]);
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
            'mkp_gram'     =>$req['mkp_gram'],
            'mkp_v_liter'  =>$req['mkp_v_liter'],
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
            'name'          =>"valve_1",
            'sensor_selected'   =>true,
            'address'       =>$req['address'],
            'waktu_buka'    =>$req['waktu_buka']
        ];
        $process_rabuk=GeneralHelper::process_mv_time("urea", $options);

        return response()->json($process_rabuk);
    }

    public function simulate_weight(Request $request)
    {
        // $login_data=$request->user();
        $req=$request->all();

        //variable
        $options_valve_1=[
            'modbus_url'    =>$req['modbus_url'],
            'modbus_port'   =>$req['modbus_port'],
            'name'          =>"valve_1",
            'sensor_selected'   =>$req['sensor_selected_v1'],
            'address'       =>$req['address_v1'],
            'berat_rabuk'   =>$req['berat_rabuk_v1']
        ];
        $options_valve_2=[
            'modbus_url'    =>$req['modbus_url'],
            'modbus_port'   =>$req['modbus_port'],
            'name'          =>"valve_2",
            'sensor_selected'   =>$req['sensor_selected_v2'],
            'address'       =>$req['address_v2'],
            'berat_rabuk'   =>$req['berat_rabuk_v2']
        ];
        $options_valve_3=[
            'modbus_url'    =>$req['modbus_url'],
            'modbus_port'   =>$req['modbus_port'],
            'name'          =>"valve_3",
            'sensor_selected'   =>$req['sensor_selected_v3'],
            'address'       =>$req['address_v3'],
            'berat_rabuk'   =>$req['berat_rabuk_v3']
        ];

        //process
        $process_rabuk_valve_1=GeneralHelper::process_mv_rabuk_time("urea", $options_valve_1);
        $process_rabuk_valve_2=GeneralHelper::process_mv_rabuk_time("mkp", $options_valve_2);
        $process_rabuk_valve_3=GeneralHelper::process_mv_rabuk_time("kcl", $options_valve_3);

        //return
        return response()->json([
            'data'  =>[$process_rabuk_valve_1, $process_rabuk_valve_2, $process_rabuk_valve_3]
        ]);
    }

    public function simulate_step(Request $request)
    {
        // $login_data=$request->user();
        $req=$request->all();

        //variable
        $options_valve_1=[
            'modbus_url'    =>$req['modbus_url'],
            'modbus_port'   =>$req['modbus_port'],
            'name'          =>"valve_1",
            'sensor_selected'   =>true,
            'address'       =>$req['address'],
            'waktu_buka'    =>$req['waktu_buka'],
            'step_detik'    =>$req['step_detik']
        ];

        //process
        $process_rabuk=GeneralHelper::process_mv_step("urea", $options_valve_1);

        //return
        return response()->json($process_rabuk);
    }

    public function simulate_irigasi(Request $request)
    {
        // $login_data=$request->user();
        $req=$request->all();

        //variable
        $options_valve_1=[
            'modbus_url'    =>$req['modbus_url'],
            'modbus_port'   =>$req['modbus_port'],
            'name'          =>"valve_1",
            'sensor_selected'   =>true,
            'address_mv1'       =>$req['address_mv1'],
            'waktu_buka_mv1'    =>$req['waktu_buka_mv1'],
            'address_mv2'       =>$req['address_mv2'],
            'waktu_buka_mv2'    =>$req['waktu_buka_mv2'],
            'address_irigasi'   =>$req['address_irigasi']
        ];

        //process
        $process_rabuk=GeneralHelper::process_mv_irigasi("urea", $options_valve_1);

        //return
        return response()->json($process_rabuk);
    }
}
