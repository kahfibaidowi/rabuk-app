<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use ModbusTcpClient\Network\BinaryStreamConnection;
use ModbusTcpClient\Packet\ModbusFunction\WriteSingleRegisterRequest;
use ModbusTcpClient\Packet\ModbusFunction\WriteSingleRegisterResponse;
use ModbusTcpClient\Packet\ModbusFunction\WriteMultipleRegistersRequest;
use ModbusTcpClient\Packet\ModbusFunction\WriteMultipleRegistersResponse;
use ModbusTcpClient\Packet\ModbusFunction\ReadHoldingRegistersRequest;
use ModbusTcpClient\Packet\ModbusFunction\ReadHoldingRegistersResponse;
use ModbusTcpClient\Packet\ModbusFunction\WriteSingleCoilRequest;
use ModbusTcpClient\Packet\ModbusFunction\WriteSingleCoilResponse;
use ModbusTcpClient\Composer\Read\ReadRegistersBuilder;
use ModbusTcpClient\Packet\ResponseFactory;
use ModbusTcpClient\Utils\Endian;
use ModbusTcpClient\Utils\Types;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;


//AUTH ROUTE
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthController::class, 'login'])->name('login');
    Route::post('login_user_pass', [AuthController::class, 'login_user_pass'])->name("login_user_pass");
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
});


//DASHBOARD ROUTE
Route::get('/', [DashboardController::class, 'dashboard']);
Route::get('/ai_recomendation', [DashboardController::class, 'ai_recomendation']);
Route::get('/lahan', [DashboardController::class, 'lahan']);
Route::get('/lahan/add', [DashboardController::class, 'add_lahan']);
Route::get('/lahan/edit', [DashboardController::class, 'edit_lahan']);
Route::get('/lahan/cek_tanaman', [DashboardController::class, 'cek_tanaman']);
Route::get('/simulate_rabuk', [DashboardController::class, 'simulate_rabuk']);
Route::get('/simulate_time', [DashboardController::class, 'simulate_time']);
Route::get('/simulate_weight', [DashboardController::class, 'simulate_weight']);
Route::get('/simulate_step', [DashboardController::class, 'simulate_step']);
Route::get('/simulate_irigasi', [DashboardController::class, 'simulate_irigasi']);

//API ROUTE
Route::middleware(["api"])->prefix("/api")->group(base_path('routes/api.php'));

Route::get('/testing', function () {
    $modbus_url="http://localhost:8080";

    $list=[
        'modbus_url'    =>"192.168.0.1",
        'modbus_port'   =>"502",
        'id'            =>1
    ];
    $connect_modbus=Http::retry(3, 100)
        ->accept('application/json')
        ->post($modbus_url."/connect", [
            "url"       =>$list['modbus_url'],
            "port"      =>$list['modbus_port'],
            "lahan_id"  =>$list['id']
        ]);
    
    $sensor_status="";
    $sensor_data=['sd'];
    $retry=0;
    while($sensor_status==""){
        $modbus_data=Http::retry(3, 100)
            ->accept('application/json')
            ->get($modbus_url."/data_sensor", [
                "process_id"=>$connect_modbus['process_id'],
                "lahan_id"  =>$list['id']
            ]);

        $sensor_status=$modbus_data['status'];
        $sensor_data=$modbus_data['data'];
        $retry++;
    }

    return response()->json([
        'data'  =>$sensor_data,
        'status'=>$sensor_status,
        'retry' =>$retry
    ]);
});

Route::get("/testingget1", function(){
    Endian::$defaultEndian=Endian::BIG_ENDIAN;
    $list=[
        'modbus_url'    =>"127.0.0.1",
        'modbus_port'   =>502
    ];
    // $list=[
    //     'modbus_url'    =>"10.10.1.2",
    //     'modbus_port'   =>502
    // ];
    $connection=BinaryStreamConnection::getBuilder()
        ->setPort($list['modbus_port'])
        ->setHost($list['modbus_url'])
        ->setConnectTimeoutSec(5)
        ->setWriteTimeoutSec(30)
        ->setReadTimeoutSec(30)
        ->build();

    $startAddress=0;
    $quantity=20;
    $unitID=1;
    $packet=new ReadHoldingRegistersRequest($startAddress, $quantity, $unitID);

    $binaryData=$connection->connect()->sendAndReceive($packet);
    
    /**
     * @var $response ReadHoldingRegistersResponse
     */
    $response=ResponseFactory::parseResponseOrThrow($binaryData);

    $sensor_data=[];
    foreach($response->asDoubleWords() as $doubleWord) {
        $sensor_data[]=(float)$doubleWord->getFloat();
    }

    print_r($sensor_data);
});

Route::get('/testing2', function () {
    Endian::$defaultEndian=Endian::BIG_ENDIAN;

    $list=[
        'modbus_url'    =>"127.0.0.1",
        'modbus_port'   =>502
    ];
    $connection=BinaryStreamConnection::getBuilder()
        ->setPort($list['modbus_port'])
        ->setHost($list['modbus_url'])
        ->setConnectTimeoutSec(5)
        ->setWriteTimeoutSec(30)
        ->setReadTimeoutSec(30)
        ->build();

    $startAddress=0;
    $value=20;
    $unitID=1;
    $packet=new WriteSingleRegisterRequest($startAddress, $value, $unitID);
    echo 'Packet to be sent (in hex): ' . $packet->toHex()."<br/>";

    try {
        $binaryData=$connection->connect()->sendAndReceive($packet);
        echo 'Binary received (in hex):   ' . unpack('H*', $binaryData)[1]."<br/>";

        /* @var $response WriteSingleRegisterResponse */
        $response=ResponseFactory::parseResponseOrThrow($binaryData);
        echo 'Parsed packet (in hex):     '.$response->toHex()."<br/>";
        echo 'Register value parsed from packet:'."<br/>";
        print_r($response->getWord()->getInt16());

    }
    catch (Exception $exception) {
        echo 'An exception occurred'."<br/>";
        echo $exception->getMessage()."<br/>";
        echo $exception->getTraceAsString()."<br/>";
    }
    finally {
        $connection->close();
    }
});

//tested
Route::get('/testing3', function () {
    Endian::$defaultEndian=Endian::BIG_ENDIAN;

    $list=[
        'modbus_url'    =>"127.0.0.1",
        'modbus_port'   =>502
    ];
    // $list=[
    //     'modbus_url'    =>"10.10.1.2",
    //     'modbus_port'   =>502
    // ];
    $connection=BinaryStreamConnection::getBuilder()
        ->setPort($list['modbus_port'])
        ->setHost($list['modbus_url'])
        ->setConnectTimeoutSec(5)
        ->setWriteTimeoutSec(30)
        ->setReadTimeoutSec(30)
        ->build();

    $startAddress=0;
    $unitID=1;
    $registers=[Types::toReal(8)];
    $packet=new WriteMultipleRegistersRequest($startAddress, $registers, $unitID); // NB: This is Modbus TCP packet not Modbus RTU over TCP!
    echo 'Packet to be sent (in hex): ' . $packet->toHex()."<br/>";

    $registers2=[Types::toReal(4)];
    $packet2=new WriteMultipleRegistersRequest($startAddress, $registers2, $unitID); // NB: This is Modbus TCP packet not Modbus RTU over TCP!
    echo 'Packet to be sent (in hex): ' . $packet2->toHex()."<br/>";
    echo "<br/><br/>";

    try {
        $binaryData = $connection->connect();
        $sleep=2*1000000;
        $result=$binaryData->sendAndReceive($packet2);
        echo 'Binary received (in hex):   ' . unpack('H*', $result)[1]."<br/>";
        usleep($sleep);
        // $binaryData = $connection->connect();
        $result=$binaryData->sendAndReceive($packet);
        echo 'Binary received (in hex):   ' . unpack('H*', $result)[1]."<br/>";
        usleep($sleep);
        // $binaryData = $connection->connect();
        $result=$binaryData->sendAndReceive($packet2);
        echo 'Binary received (in hex):   ' . unpack('H*', $result)[1]."<br/>";
        usleep($sleep);
        // $binaryData = $connection->connect();
        $result=$binaryData->sendAndReceive($packet);
        echo 'Binary received (in hex):   ' . unpack('H*', $result)[1]."<br/>";
        echo "sukses boi";
        // for($i=0; $i<10; $i++){
        //     $packet_data=$i%2==0?$packet:$packet2;
        //     $result=$binaryData->sendAndReceive($packet_data);
        //     echo 'Binary received (in hex):   ' . unpack('H*', $result)[1]."<br/>";
        //     sleep(2);
        // }
        // echo "<br/><br/>";

        // /* @var $response WriteMultipleRegistersResponse */
        // $response = ResponseFactory::parseResponseOrThrow($binaryData);
        // echo 'Parsed packet (in hex):     ' . $response->toHex()."<br/>";
        // echo 'Registers count written parsed from packet:'."<br/>";
        // print_r($response->getRegistersCount());

    } catch (Exception $exception) {
        echo 'An exception occurred'."<br/>";
        echo $exception->getMessage()."<br/>";
        echo $exception->getTraceAsString()."<br/>";
    } finally {
        $connection->close();
    }
});

Route::get('/testing_rabuk_gram', function(){
    $pupuk=2.7; #2.7 gram pupuk yang akan dikonversi ke cair
    $konsentrasi_per_liter=10; #10 gram/liter
    $pupuk_cair=2.7/10;
    $pupuk_cair_ml=ceil($pupuk_cair*1000);

    //satuan ml/s
    $motor_tutup=[4, 0]; #tertutup
    $motor_buka_quarter=[8, 284.5]; #terbuka 25%
    $motor_buka_mid=[16, 682.8]; #terbuka 60%
    $motor_buka_full=[20, 1138]; #terbuka 100%
    $motor_dipilih=$motor_buka_quarter;

    $waktu_buka=$pupuk_cair_ml/$motor_dipilih[1];
    $waktu_buka=round($waktu_buka, 2);

    echo $waktu_buka."<br/>";

    //iot control modbus
    Endian::$defaultEndian=Endian::BIG_ENDIAN;
    $list=[
        'modbus_url'    =>"127.0.0.1",
        'modbus_port'   =>502
    ];

    $connection=BinaryStreamConnection::getBuilder()
        ->setPort($list['modbus_port'])
        ->setHost($list['modbus_url'])
        ->setConnectTimeoutSec(5)
        ->setWriteTimeoutSec(30)
        ->setReadTimeoutSec(30)
        ->build();

    $startAddress=0;
    $unitID=1;

    $registers=[Types::toReal($motor_dipilih[0])];
    $packet=new WriteMultipleRegistersRequest($startAddress, $registers, $unitID);

    $registers2=[Types::toReal($motor_tutup[0])];
    $packet2=new WriteMultipleRegistersRequest($startAddress, $registers2, $unitID);

    try {
        $binaryData = $connection->connect();
        $sleep=ceil($waktu_buka*1000*1000);

        $result=$binaryData->sendAndReceive($packet);
        $date_1=microtime(true)/1000;
        usleep($sleep); //sleep

        $result=$binaryData->sendAndReceive($packet2);
        $date_2=microtime(true)/1000;

        echo "sleep ".$date_1." - ".$date_2;
        echo "<br/>waktu eksekusi program=".($date_2-$date_1)*1000;

    }
    catch(\Exception $exception) {
        echo 'An exception occurred'."<br/>";
        echo $exception->getMessage()."<br/>";
        echo $exception->getTraceAsString()."<br/>";
    }
    finally{
        $connection->close();
    }
});

Route::get('/testing_coil', function(){
    $waktu_buka=5;

    //iot control modbus
    Endian::$defaultEndian=Endian::BIG_ENDIAN;
    $list=[
        'modbus_url'    =>"127.0.0.1",
        'modbus_port'   =>502
    ];

    $connection=BinaryStreamConnection::getBuilder()
        ->setPort($list['modbus_port'])
        ->setHost($list['modbus_url'])
        ->setConnectTimeoutSec(5)
        ->setWriteTimeoutSec(30)
        ->setReadTimeoutSec(30)
        ->build();

    $startAddress=0;
    $unitID=1;

    $registers=true;
    $packet=new WriteSingleCoilRequest($startAddress, $registers, $unitID);

    $registers2=false;
    $packet2=new WriteSingleCoilRequest($startAddress, $registers2, $unitID);

    try {
        $binaryData = $connection->connect();
        $sleep=ceil($waktu_buka*1000*1000);

        $result=$binaryData->sendAndReceive($packet);
        $date_1=microtime(true)/1000;
        usleep($sleep); //sleep

        $result=$binaryData->sendAndReceive($packet2);
        $date_2=microtime(true)/1000;

        echo "sleep ".$date_1." - ".$date_2;
        echo "<br/>waktu eksekusi program=".($date_2-$date_1)*1000;

    }
    catch(\Exception $exception) {
        echo 'An exception occurred'."<br/>";
        echo $exception->getMessage()."<br/>";
        echo $exception->getTraceAsString()."<br/>";
    }
    finally{
        $connection->close();
    }
});