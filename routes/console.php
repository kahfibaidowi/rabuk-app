<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use ModbusTcpClient\Network\BinaryStreamConnection;
use ModbusTcpClient\Packet\ModbusFunction\ReadHoldingRegistersRequest;
use ModbusTcpClient\Packet\ModbusFunction\ReadHoldingRegistersResponse;
use ModbusTcpClient\Composer\Read\ReadRegistersBuilder;
use ModbusTcpClient\Network\NonBlockingClient;
use ModbusTcpClient\Packet\ResponseFactory;
use ModbusTcpClient\Utils\Endian;
use App\Helpers\GeneralHelper;
use App\Repository\LahanRepo;
use App\Models\LahanModel;
use App\Models\LahanDetailModel;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

//
Schedule::call(function (){
    Endian::$defaultEndian=Endian::BIG_ENDIAN;

    $ews_url=env("EWS_URL", "localhost");

    $lahans=LahanRepo::gets([])['data'];
    
    foreach($lahans as $list){
        $connection=BinaryStreamConnection::getBuilder()
            ->setPort($list['modbus_port'])
            ->setHost($list['modbus_url'])
            ->setConnectTimeoutSec(5)
            ->setWriteTimeoutSec(30)
            ->setReadTimeoutSec(30)
            ->build();

        $startAddress=0;
        $quantity=18;
        $unitID=1;
        $packet=new ReadHoldingRegistersRequest($startAddress, $quantity, $unitID);

        try{
            $binaryData=$connection->connect()->sendAndReceive($packet);
    
            /**
             * @var $response ReadHoldingRegistersResponse
             */
            $response=ResponseFactory::parseResponseOrThrow($binaryData);

            $sensor_data=[];
            foreach($response->asDoubleWords() as $doubleWord) {
                $sensor_data[]=(float)$doubleWord->getFloat();
            }
            
            $ews_ch=Http::retry(3, 100)
                ->accept('application/json')
                ->get($ews_url."/api/frontpage/curah_hujan", [
                    "id_region" =>$list["ews_district_id"]
                ]);


            $usia_tanaman=GeneralHelper::count_month($list['tgl_tanam'], date("Y-m-d"));

            $curah_hujan=GeneralHelper::curah_hujan(date("Y-m-d"), $ews_ch['data']);
            $curah_hujan=!is_null($curah_hujan)?$curah_hujan['curah_hujan']:null;
            
            DB::transaction(function()use($list, $sensor_data, $usia_tanaman, $curah_hujan){
                LahanModel::where("id", $list['id'])
                    ->update([
                        'modbus_status' =>"connected"
                    ]);

                LahanDetailModel::create([
                    "lahan_id"      =>$list['id'],
                    'soil_n'        =>$sensor_data[0],
                    'soil_p'        =>$sensor_data[1],
                    'soil_k'        =>$sensor_data[2],
                    'soil_ph'       =>$sensor_data[3],
                    'soil_s'        =>$sensor_data[4],
                    'soil_tds'      =>$sensor_data[5],
                    'cec'           =>null,
                    'soil_ec'       =>$sensor_data[6],
                    'soil_h'        =>$sensor_data[7],
                    'soil_t'        =>$sensor_data[8],
                    'usia_tanaman'  =>$usia_tanaman,
                    'curah_hujan'   =>$curah_hujan,
                    "modbus_status" =>"connected"
                ]);
            });
        }
        catch(\Exception $e){
            DB::transaction(function()use($list){
                LahanModel::where("id", $list['id'])
                    ->update([
                        'modbus_status' =>"disconnected"
                    ]);

                LahanDetailModel::create([
                    "lahan_id"      =>$list['id'],
                    "modbus_status" =>"failed_connect"
                ]);
            });

            echo "An exception occurred".PHP_EOL;
            echo $e->getMessage().PHP_EOL;
            echo $e->getTraceAsString().PHP_EOL;
        }
        finally{
            $connection->close();
        }
    }
})
// Schedule::call(function (){
//     $modbus_url=env("MODBUS_SERVER_URL", "localhost");
//     $ews_url=env("EWS_URL", "localhost");

//     $lahans=LahanRepo::gets([])['data'];
    
//     foreach($lahans as $list){
//         $connect_modbus=Http::retry(3, 100)
//             ->accept('application/json')
//             ->post($modbus_url."/connect", [
//                 "url"       =>$list['modbus_url'],
//                 "port"      =>$list['modbus_port'],
//                 "lahan_id"  =>$list['id']
//             ]);

//         $sensor_status="";
//         $sensor_data=[];
//         $retry=0;
//         while($sensor_status=="" && $retry<=20){
//             $modbus_data=Http::retry(3, 100)
//                 ->accept('application/json')
//                 ->get($modbus_url."/data_sensor", [
//                     "process_id"=>$connect_modbus['process_id'],
//                     "lahan_id"  =>$list['id']
//                 ]);

//             $sensor_status=$modbus_data['status'];
//             $sensor_data=$modbus_data['data'];
//             $retry++;
//             sleep(3);
//         }
        
//         if($sensor_status=="connected"){
//             $ews_ch=Http::retry(3, 100)
//                 ->accept('application/json')
//                 ->get($ews_url."/api/frontpage/curah_hujan", [
//                     "id_region" =>$list["ews_district_id"]
//                 ]);


//             $usia_tanaman=GeneralHelper::count_month($list['tgl_tanam'], date("Y-m-d"));

//             $curah_hujan=GeneralHelper::curah_hujan(date("Y-m-d"), $ews_ch['data']);
//             $curah_hujan=!is_null($curah_hujan)?$curah_hujan['curah_hujan']:null;
            
//             DB::transaction(function()use($list, $sensor_data, $usia_tanaman, $curah_hujan){
//                 LahanModel::where("id", $list['id'])
//                     ->update([
//                         'modbus_status' =>"connected"
//                     ]);

//                 LahanDetailModel::create([
//                     "lahan_id"      =>$list['id'],
//                     'soil_n'        =>$sensor_data[0],
//                     'soil_p'        =>$sensor_data[1],
//                     'soil_k'        =>$sensor_data[2],
//                     'soil_ph'       =>$sensor_data[3],
//                     'cec'           =>$sensor_data[4],
//                     'soil_ec'       =>$sensor_data[5],
//                     'soil_s'        =>null,
//                     'soil_tds'      =>null,
//                     'soil_h'        =>$sensor_data[6],
//                     'soil_t'        =>$sensor_data[7],
//                     'usia_tanaman'  =>$usia_tanaman,
//                     'curah_hujan'   =>$curah_hujan,
//                     "modbus_status" =>"connected"
//                 ]);
//             });
//         }
//         else{
//             DB::transaction(function()use($list){
//                 LahanModel::where("id", $list['id'])
//                     ->update([
//                         'modbus_status' =>"disconnected"
//                     ]);

//                 LahanDetailModel::create([
//                     "lahan_id"      =>$list['id'],
//                     "modbus_status" =>"failed_connect"
//                 ]);
//             });
//         }
//     }
// })
->cron("* * * * *");
// ->everyFiveMinutes();
//->everyThirtyMinutes();