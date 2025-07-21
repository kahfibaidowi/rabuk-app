<?php

namespace App\Http\Controllers\Api;

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
        DB::transaction(function()use($req){
            $lahan=LahanRepo::get($req['lahan_id']);

            if($req['dosis_urea']!=""){
                //variable
                $pupuk=$req['dosis_urea']; #gram pupuk yang akan dikonversi ke cair
                $konsentrasi_per_liter=10; #gram/liter
                $pupuk_cair=$pupuk/$konsentrasi_per_liter;
                $pupuk_cair_ml=ceil($pupuk_cair*1000);

                //satuan ml/s
                $motor_tutup=[4, 0]; #tertutup
                $motor_buka_quarter=[8, 284.5]; #terbuka 25%
                $motor_buka_mid=[16, 682.8]; #terbuka 60%
                $motor_buka_full=[20, 1138]; #terbuka 100%

                $motor_dipilih=[4, 0];
                switch("20"){
                    case "8":
                        $motor_dipilih=$motor_buka_quarter;
                    break;
                    case "16":
                        $motor_dipilih=$motor_buka_mid;
                    break;
                    case "20":
                        $motor_dipilih=$motor_buka_full;
                    break;
                }

                //waktu buka
                $waktu_buka=$pupuk_cair_ml/$motor_dipilih[1];
                $waktu_buka=round($waktu_buka, 2);

                //iot control modbus
                Endian::$defaultEndian=Endian::BIG_ENDIAN;
                $list=[
                    'modbus_url'    =>$lahan['modbus_url'],
                    'modbus_port'   =>$lahan['modbus_port']
                ];

                $connection=BinaryStreamConnection::getBuilder()
                    ->setPort($list['modbus_port'])
                    ->setHost($list['modbus_url'])
                    ->setConnectTimeoutSec(5)
                    ->setWriteTimeoutSec(30)
                    ->setReadTimeoutSec(30)
                    ->build();

                $startAddress=18;
                $unitID=1;

                $registers=[Types::toReal($motor_dipilih[0])];
                $packet=new WriteMultipleRegistersRequest($startAddress, $registers, $unitID);

                $registers2=[Types::toReal($motor_tutup[0])];
                $packet2=new WriteMultipleRegistersRequest($startAddress, $registers2, $unitID);

                $waktu_eksekusi="";
                try {
                    $binaryData = $connection->connect();
                    $sleep=ceil($waktu_buka*1000*1000);

                    $result=$binaryData->sendAndReceive($packet);
                    $date_1=microtime(true)/1000;
                    usleep($sleep); //sleep

                    $result=$binaryData->sendAndReceive($packet2);
                    $date_2=microtime(true)/1000;

                    $waktu_eksekusi=($date_2-$date_1)*1000;

                }
                catch(\Exception $exception) {
                    echo 'An exception occurred'."<br/>";
                    echo $exception->getMessage()."<br/>";
                    echo $exception->getTraceAsString()."<br/>";
                }
                finally{
                    $connection->close();
                }
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
        $pupuk=$req['berat_rabuk']; #gram pupuk yang akan dikonversi ke cair
        $konsentrasi_per_liter=$req['konsentrasi_per_liter']; #gram/liter
        $pupuk_cair=$pupuk/$konsentrasi_per_liter;
        $pupuk_cair_ml=ceil($pupuk_cair*1000);

        //satuan ml/s
        $motor_tutup=[4, 0]; #tertutup
        $motor_buka_quarter=[8, 284.5]; #terbuka 25%
        $motor_buka_mid=[16, 682.8]; #terbuka 60%
        $motor_buka_full=[20, 1138]; #terbuka 100%

        $motor_dipilih=[4, 0];
        switch($req['motor_value']){
            case "8":
                $motor_dipilih=$motor_buka_quarter;
            break;
            case "16":
                $motor_dipilih=$motor_buka_mid;
            break;
            case "20":
                $motor_dipilih=$motor_buka_full;
            break;
        }

        //waktu buka
        $waktu_buka=$pupuk_cair_ml/$motor_dipilih[1];
        $waktu_buka=round($waktu_buka, 2);

        //iot control modbus
        Endian::$defaultEndian=Endian::BIG_ENDIAN;
        $list=[
            'modbus_url'    =>$req['modbus_url'],
            'modbus_port'   =>$req['modbus_port']
        ];

        $connection=BinaryStreamConnection::getBuilder()
            ->setPort($list['modbus_port'])
            ->setHost($list['modbus_url'])
            ->setConnectTimeoutSec(5)
            ->setWriteTimeoutSec(30)
            ->setReadTimeoutSec(30)
            ->build();

        $startAddress=18;
        $unitID=1;

        $registers=[Types::toReal($motor_dipilih[0])];
        $packet=new WriteMultipleRegistersRequest($startAddress, $registers, $unitID);

        $registers2=[Types::toReal($motor_tutup[0])];
        $packet2=new WriteMultipleRegistersRequest($startAddress, $registers2, $unitID);

        $waktu_eksekusi="";
        try {
            $binaryData = $connection->connect();
            $sleep=ceil($waktu_buka*1000*1000);

            $result=$binaryData->sendAndReceive($packet);
            $date_1=microtime(true)/1000;
            usleep($sleep); //sleep

            $result=$binaryData->sendAndReceive($packet2);
            $date_2=microtime(true)/1000;

            $waktu_eksekusi=($date_2-$date_1)*1000;

        }
        catch(\Exception $exception) {
            echo 'An exception occurred'."<br/>";
            echo $exception->getMessage()."<br/>";
            echo $exception->getTraceAsString()."<br/>";
        }
        finally{
            $connection->close();
        }

        return response()->json([
            'waktu_tunggu_ideal'    =>$waktu_buka,
            'waktu_tunggu_simulasi' =>$waktu_eksekusi
        ]);
    }
}
