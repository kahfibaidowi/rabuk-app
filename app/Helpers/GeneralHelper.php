<?php

namespace App\Helpers;

use ModbusTcpClient\Network\BinaryStreamConnection;
use ModbusTcpClient\Packet\ModbusFunction\WriteMultipleRegistersRequest;
use ModbusTcpClient\Packet\ModbusFunction\WriteMultipleRegistersResponse;
use ModbusTcpClient\Packet\ModbusFunction\WriteSingleCoilRequest;
use ModbusTcpClient\Packet\ModbusFunction\WriteSingleCoilResponse;
use ModbusTcpClient\Packet\ResponseFactory;
use ModbusTcpClient\Utils\Endian;
use ModbusTcpClient\Utils\Types;


class GeneralHelper{

    public static function count_month($start, $end, $with_one=false){
        $date1=$start;
        $date2=$end;
        
        $ts1=strtotime($date1);
        $ts2=strtotime($date2);
        
        $year1=date('Y', $ts1);
        $year2=date('Y', $ts2);
        
        $month1=date('m', $ts1);
        $month2=date('m', $ts2);
        
        $diff=(($year2-$year1)*12)+($month2-$month1);
        
        return $with_one?$diff+1:$diff;
    }

    public static function curah_hujan($date, $curah_hujan){
        $new_date=strtotime($date);

        $year=(int)date("Y", $new_date);
        $month=(int)date("m", $new_date);
        $day=(int)date("d", $new_date);
        $input_ke=$day<=10?1:($day<=20?2:3);

        $ch_data=null;
        foreach($curah_hujan as $val){
            if($val['tahun']==$year && $val['bulan']==$month && $val['input_ke']=$input_ke){
                $ch_data=$val;
                break;
            }
        }

        return $ch_data;
    }

    public static function valve_volume_to_time($volume){
        $waktu_buka=$volume/100*0.4;
        if($waktu_buka<=4){
            $waktu_buka=$waktu_buka+0;
        }
        else if($waktu_buka<=9){
            $waktu_buka=$waktu_buka+0.2;
        }
        else if($waktu_buka<=10){
            $waktu_buka=$waktu_buka+0.6;
        }
        else if($waktu_buka<=11){
            $waktu_buka=$waktu_buka+0.8;
        }
        else if($waktu_buka<=22){
            $waktu_buka=$waktu_buka+1;
        }
        else if($waktu_buka>22){
            $waktu_buka=$waktu_buka+1.6;
        }

        return $waktu_buka;
    }

    public static function process_mv_1(){
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

    public static function process_mv($type="urea", $berat_rabuk, $options){
        //options params
        // $options=[
        //     'modbus_url',
        //     'modbus_port',
        //     'urea_gram',
        //     'urea_v_liter',
        //     'mkp_gram',
        //     'mkp_v_liter',
        //     'kcl_gram',
        //     'kcl_v_liter'
        // ];

        //larutan pupuk per liter
        $larutan_urea=$options['urea_gram']/max($options['urea_v_liter'], 1);
        $larutan_mkp=$options['mkp_gram']/max($options['mkp_v_liter'], 1);
        $larutan_kcl=$options['kcl_gram']/max($options['kcl_v_liter'], 1);

        $larutan_dipilih=$larutan_urea;
        switch($type){
            case "urea":
                $larutan_dipilih=$larutan_urea;
            break;
            case "mkp":
                $larutan_dipilih=$larutan_mkp;
            break;
            case "kcl":
                $larutan_dipilih=$larutan_kcl;
            break;
        }

        //-----------------------------

        //params
        $motor_dipilih=16;
        $motor_tertutup=4;

        //waktu buka
        $waktu_buka=($berat_rabuk*98)/$larutan_dipilih - 5.5;
        $waktu_buka=round($waktu_buka, 2);
        $waktu_buka=max($waktu_buka, 0.01);

        //iot control modbus
        Endian::$defaultEndian=Endian::BIG_ENDIAN;
        $list=[
            'modbus_url'    =>$options['modbus_url'],
            'modbus_port'   =>$options['modbus_port']
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

        $registers=[Types::toReal($motor_dipilih)];
        $packet=new WriteMultipleRegistersRequest($startAddress, $registers, $unitID);

        $registers2=[Types::toReal($motor_tertutup)];
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

        return [
            'waktu_tunggu'  =>$waktu_buka,
            'waktu_tunggu_plus_tutup'   =>/*$waktu_buka+2*/"",
            'waktu_tunggu_simulasi' =>$waktu_eksekusi
        ];
    }

    public static function process_mv_time($type="urea", $options){
        //options params
        // $options=[
        //     'modbus_url',
        //     'modbus_port',
        //     'urea_gram',
        //     'urea_v_liter',
        //     'mkp_gram',
        //     'mkp_v_liter',
        //     'kcl_gram',
        //     'kcl_v_liter',
        //     'time'
        // ];


        //-----------------------------

        //params

        //iot control modbus
        Endian::$defaultEndian=Endian::BIG_ENDIAN;
        $list=[
            'modbus_url'    =>$options['modbus_url'],
            'modbus_port'   =>$options['modbus_port'],
            'name'          =>$options['name'],
            'sensor_selected'   =>$options['sensor_selected'],
            'address'       =>$options['address'],
            'waktu_buka'    =>$options['waktu_buka']
        ];

        //kondisi
        if(!$list['sensor_selected']){
            return [
                'status'        =>"sensor_not_selected",
                'name'          =>$list['name'],
                'waktu_tunggu'  =>"",
                'waktu_tunggu_simulasi' =>""
            ];
        }

        $connection=BinaryStreamConnection::getBuilder()
            ->setPort($list['modbus_port'])
            ->setHost($list['modbus_url'])
            ->setConnectTimeoutSec(5)
            ->setWriteTimeoutSec(30)
            ->setReadTimeoutSec(30)
            ->build();

        $type=substr($list['address'], 0, 1);
        $startAddress=(int)(substr($list['address'], 1));
        $startAddress=$startAddress-1;
        $unitID=1;
        $waktu_buka=$list['waktu_buka'];

        if($type=="4"){
            $registers=[Types::toReal(1)];
            $packet=new WriteMultipleRegistersRequest($startAddress, $registers, $unitID);

            $registers2=[Types::toReal(0)];
            $packet2=new WriteMultipleRegistersRequest($startAddress, $registers2, $unitID);
        }
        else{
            $coil=true;
            $packet=new WriteSingleCoilRequest($startAddress, $coil, $unitID);

            $coil2=false;
            $packet2=new WriteSingleCoilRequest($startAddress, $coil2, $unitID);
        }

        $waktu_eksekusi="";
        $status="error";
        try {
            $binaryData = $connection->connect();
            $sleep=ceil($waktu_buka*1000*1000);

            $result=$binaryData->sendAndReceive($packet);
            $date_1=microtime(true)/1000;
            usleep($sleep); //sleep

            $result=$binaryData->sendAndReceive($packet2);
            $date_2=microtime(true)/1000;

            $waktu_eksekusi=($date_2-$date_1)*1000;
            $status="success";
        }
        catch(\Exception $exception) {
            echo 'An exception occurred'."<br/>";
            echo $exception->getMessage()."<br/>";
            echo $exception->getTraceAsString()."<br/>";
        }
        finally{
            $connection->close();
        }

        return [
            'status'        =>$status,
            'name'          =>$list['name'],
            'waktu_tunggu'  =>$waktu_buka,
            'waktu_tunggu_simulasi' =>$waktu_eksekusi
        ];
    }

    public static function process_mv_rabuk_time($type="urea", $options){
        Endian::$defaultEndian=Endian::BIG_ENDIAN;

        //options params
        // $options=[
        //     'modbus_url',
        //     'modbus_port',
        //     'sensor_active',
        //     'modbus_url',
        //     'berat_rabuk',
        // ];


        //-----------------------------

        //variable
        //iot control modbus
        $list=[
            'modbus_url'    =>$options['modbus_url'],
            'modbus_port'   =>$options['modbus_port'],
            'name'          =>$options['name'],
            'sensor_selected'   =>$options['sensor_selected'],
            'address'       =>$options['address'],
            'berat_rabuk'   =>$options['berat_rabuk']
        ];

        //kondisi
        if(!$list['sensor_selected']){
            return [
                'status'        =>"sensor_not_selected",
                'name'          =>$list['name'],
                'waktu_tunggu'  =>"",
                'waktu_tunggu_simulasi' =>""
            ];
        }

        //waktu buka
        $penambahan=floor($list['berat_rabuk']/200);
        $ml_step=90-($penambahan*1.5);
        $waktu_buka=$list['berat_rabuk']/$ml_step*0.4;
        if($waktu_buka<=4){
            $waktu_buka=$waktu_buka+0;
        }
        // else if($waktu_buka<=9){
        //     $waktu_buka=$waktu_buka+0.2;
        // }
        // else if($waktu_buka<=10){
        //     $waktu_buka=$waktu_buka+0.6;
        // }
        // else if($waktu_buka<=11){
        //     $waktu_buka=$waktu_buka+0.8;
        // }
        // else if($waktu_buka<=22){
        //     $waktu_buka=$waktu_buka+1;
        // }
        // else if($waktu_buka>22){
        //     $waktu_buka=$waktu_buka+1.6;
        // }
        // if($list['berat_rabuk']<=100){
        //     $waktu_buka=0.5;
        // }
        // else if($list['berat_rabuk']<=200){
        //     $waktu_buka=1;
        // }
        // else if($list['berat_rabuk']<=400){
        //     $waktu_buka=2;
        // }
        // else if($list['berat_rabuk']<=650){
        //     $waktu_buka=3;
        // }
        // else if($list['berat_rabuk']<=800){
        //     $waktu_buka=4;
        // }
        // else if($list['berat_rabuk']<=1000){
        //     $waktu_buka=5;
        // }
        // else if($list['berat_rabuk']<=1350){
        //     $waktu_buka=6;
        // }
        // else if($list['berat_rabuk']<=1550){
        //     $waktu_buka=7;
        // }
        // else if($list['berat_rabuk']<=1800){
        //     $waktu_buka=8;
        // }
        // else if($list['berat_rabuk']<=2000){
        //     $waktu_buka=9;
        // }
        // else if($list['berat_rabuk']>2000){
        //     $sisa=$list['berat_rabuk']-2000;
        //     $waktu_tambahan=$sisa/250;
        //     $waktu_buka=round(20+$waktu_tambahan, 2)+0.01;
        // }

        //process
        $connection=BinaryStreamConnection::getBuilder()
            ->setPort($list['modbus_port'])
            ->setHost($list['modbus_url'])
            ->setConnectTimeoutSec(5)
            ->setWriteTimeoutSec(30)
            ->setReadTimeoutSec(30)
            ->build();

        $type=substr($list['address'], 0, 1);
        $startAddress=(int)(substr($list['address'], 1));
        $startAddress=$startAddress-1;
        $unitID=1;

        $status="error";
        if($type=="4"){
            $registers=[Types::toReal(1)];
            $packet=new WriteMultipleRegistersRequest($startAddress, $registers, $unitID);

            $registers2=[Types::toReal(0)];
            $packet2=new WriteMultipleRegistersRequest($startAddress, $registers2, $unitID);
        }
        else{
            $coil=true;
            $packet=new WriteSingleCoilRequest($startAddress, $coil, $unitID);

            $coil2=false;
            $packet2=new WriteSingleCoilRequest($startAddress, $coil2, $unitID);
        }

        $waktu_eksekusi="";
        try {
            $binaryData = $connection->connect();
            $sleep=ceil($waktu_buka*1000*1000);

            $date_1=microtime(true)/1000;
            $result=$binaryData->sendAndReceive($packet);
            usleep($sleep); //sleep

            $result=$binaryData->sendAndReceive($packet2);
            $date_2=microtime(true)/1000;

            $waktu_eksekusi=($date_2-$date_1)*1000;
            $status="success";
        }
        catch(\Exception $exception) {
            // echo 'An exception occurred'."<br/>";
            // echo $exception->getMessage()."<br/>";
            // echo $exception->getTraceAsString()."<br/>";
        }
        finally{
            $connection->close();
        }

        return [
            'status'        =>$status,
            'name'          =>$list['name'],
            'waktu_tunggu'  =>$waktu_buka,
            'waktu_tunggu_simulasi' =>$waktu_eksekusi
        ];
    }

    public static function process_mv_step($type="urea", $options){
        //options params
        // $options=[
        //     'modbus_url',
        //     'modbus_port',
        //     'urea_gram',
        //     'urea_v_liter',
        //     'mkp_gram',
        //     'mkp_v_liter',
        //     'kcl_gram',
        //     'kcl_v_liter',
        //     'time'
        // ];


        //-----------------------------

        //params

        //iot control modbus
        Endian::$defaultEndian=Endian::BIG_ENDIAN;
        $list=[
            'modbus_url'    =>$options['modbus_url'],
            'modbus_port'   =>$options['modbus_port'],
            'name'          =>$options['name'],
            'sensor_selected'   =>$options['sensor_selected'],
            'address'       =>$options['address'],
            'waktu_buka'    =>$options['waktu_buka'],
            'step_detik'    =>$options['step_detik']
        ];

        //kondisi
        if(!$list['sensor_selected']){
            return [
                'status'        =>"sensor_not_selected",
                'name'          =>$list['name'],
                'waktu_tunggu'  =>"",
                'waktu_tunggu_simulasi' =>""
            ];
        }

        $connection=BinaryStreamConnection::getBuilder()
            ->setPort($list['modbus_port'])
            ->setHost($list['modbus_url'])
            ->setConnectTimeoutSec(5)
            ->setWriteTimeoutSec(30)
            ->setReadTimeoutSec(30)
            ->build();

        $type=substr($list['address'], 0, 1);
        $startAddress=(int)(substr($list['address'], 1));
        $startAddress=$startAddress-1;
        $unitID=1;
        $waktu_buka=$list['waktu_buka'];
        $step_detik=$list['step_detik'];
        $step=ceil($list['waktu_buka']/$list['step_detik']);

        if($type=="4"){
            $registers=[Types::toReal(1)];
            $packet=new WriteMultipleRegistersRequest($startAddress, $registers, $unitID);

            $registers2=[Types::toReal(0)];
            $packet2=new WriteMultipleRegistersRequest($startAddress, $registers2, $unitID);
        }
        else{
            $coil=true;
            $packet=new WriteSingleCoilRequest($startAddress, $coil, $unitID);

            $coil2=false;
            $packet2=new WriteSingleCoilRequest($startAddress, $coil2, $unitID);
        }

        $waktu_eksekusi="";
        $status="error";
        try {
            $binaryData = $connection->connect();
            $sleep=ceil($step_detik*1000*1000);

            for($i=1; $i<=$step; $i++){
                if($i==1){
                    $waktu_eksekusi=0;
                }
                
                $result=$binaryData->sendAndReceive($packet);
                $date_1=microtime(true)/1000;
                usleep($sleep); //sleep

                $result=$binaryData->sendAndReceive($packet2);
                $date_2=microtime(true)/1000;
                usleep(3*1000*1000);

                $waktu_eksekusi+=($date_2-$date_1)*1000;
            }
            
            $status="success";
        }
        catch(\Exception $exception) {
            echo 'An exception occurred'."<br/>";
            echo $exception->getMessage()."<br/>";
            echo $exception->getTraceAsString()."<br/>";
        }
        finally{
            $connection->close();
        }

        return [
            'status'        =>$status,
            'name'          =>$list['name'],
            'waktu_tunggu'  =>$waktu_buka,
            'waktu_tunggu_simulasi' =>$waktu_eksekusi
        ];
    }

    public static function process_mv_irigasi($type="urea", $options){
        //params

        //iot control modbus
        Endian::$defaultEndian=Endian::BIG_ENDIAN;
        $list=[
            'modbus_url'    =>$options['modbus_url'],
            'modbus_port'   =>$options['modbus_port'],
            'name'          =>$options['name'],
            'sensor_selected'   =>$options['sensor_selected'],
            'address_mv1'       =>$options['address_mv1'],
            'waktu_buka_mv1'    =>$options['waktu_buka_mv1'],
            'address_mv2'       =>$options['address_mv2'],
            'waktu_buka_mv2'    =>$options['waktu_buka_mv2'],
            'address_irigasi'   =>$options['address_irigasi']
        ];

        //kondisi
        if(!$list['sensor_selected']){
            return [
                'status'        =>"sensor_not_selected"
            ];
        }

        $connection=BinaryStreamConnection::getBuilder()
            ->setPort($list['modbus_port'])
            ->setHost($list['modbus_url'])
            ->setConnectTimeoutSec(5)
            ->setWriteTimeoutSec(30)
            ->setReadTimeoutSec(30)
            ->build();

        $type=substr($list['address_mv1'], 0, 1);
        $startAddress=(int)(substr($list['address_mv1'], 1));
        $startAddress=$startAddress-1;

        $type2=substr($list['address_mv2'], 0, 1);
        $startAddress2=(int)(substr($list['address_mv2'], 1));
        $startAddress2=$startAddress2-1;

        $type_irigasi=substr($list['address_irigasi'], 0, 1);
        $startAddress_irigasi=(int)(substr($list['address_irigasi'], 1));
        $startAddress_irigasi=$startAddress_irigasi-1;

        $unitID=1;
        $waktu_buka=$list['waktu_buka_mv1'];
        $waktu_buka_mv2=$list['waktu_buka_mv2'];
        $waktu_buka_half=($list['waktu_buka_mv1']+$list['waktu_buka_mv2'])/2;

        if($type=="4"){
            $registers=[Types::toReal(1)];
            $registers2=[Types::toReal(0)];

            $packet=new WriteMultipleRegistersRequest($startAddress, $registers, $unitID);
            $packet2=new WriteMultipleRegistersRequest($startAddress, $registers2, $unitID);
        }
        else{
            $coil=true;
            $coil2=false;

            $packet=new WriteSingleCoilRequest($startAddress, $coil, $unitID);
            $packet2=new WriteSingleCoilRequest($startAddress, $coil2, $unitID);
        }

        if($type2=="4"){
            $registers=[Types::toReal(1)];
            $registers2=[Types::toReal(0)];

            $packet_mv2=new WriteMultipleRegistersRequest($startAddress2, $registers, $unitID);
            $packet2_mv2=new WriteMultipleRegistersRequest($startAddress2, $registers2, $unitID);
        }
        else{
            $coil=true;
            $coil2=false;

            $packet_mv2=new WriteSingleCoilRequest($startAddress2, $coil, $unitID);
            $packet2_mv2=new WriteSingleCoilRequest($startAddress2, $coil2, $unitID);
        }

        if($type_irigasi=="4"){
            $registers=[Types::toReal(1)];
            $registers2=[Types::toReal(0)];

            $packet_irigasi=new WriteMultipleRegistersRequest($startAddress_irigasi, $registers, $unitID);
            $packet2_irigasi=new WriteMultipleRegistersRequest($startAddress_irigasi, $registers2, $unitID);
        }
        else{
            $coil=true;
            $coil2=false;

            $packet_irigasi=new WriteSingleCoilRequest($startAddress_irigasi, $coil, $unitID);
            $packet2_irigasi=new WriteSingleCoilRequest($startAddress_irigasi, $coil2, $unitID);
        }

        $waktu_eksekusi="";
        $waktu_tunggu_sebelum_pemupukan="";
        $waktu_tunggu_sesudah_pemupukan="";
        $status="error";
        try {
            $binaryData = $connection->connect();
            $sleep=ceil($waktu_buka*1000*1000);
            $sleep_mv2=ceil($waktu_buka_mv2*1000*1000);
            $sleep_irigasi=ceil($waktu_buka_half*1000*1000);

            //step 1 (irigasi - sebelum pemupukan)
            $result=$binaryData->sendAndReceive($packet_irigasi);
            $date_1_sebelum_pemupukan=microtime(true)/1000;
            usleep($sleep_irigasi); //sleep

            $result=$binaryData->sendAndReceive($packet2_irigasi);
            $date_2_sebelum_pemupukan=microtime(true)/1000;
            usleep(2*1000*1000);

            //step 2 (pemupukan)
            $result=$binaryData->sendAndReceive($packet);
            $date_1=microtime(true)/1000;
            usleep($sleep); //sleep

            $result=$binaryData->sendAndReceive($packet2);
            $date_2=microtime(true)/1000;
            usleep(2*1000*1000);

            //step 2 (pemupukan mv 2)
            $result=$binaryData->sendAndReceive($packet_mv2);
            $date_1=microtime(true)/1000;
            usleep($sleep_mv2); //sleep

            $result=$binaryData->sendAndReceive($packet2_mv2);
            $date_2=microtime(true)/1000;
            usleep(2*1000*1000);

            //step 3 (irigasi - sesudah pemupukan)
            $result=$binaryData->sendAndReceive($packet_irigasi);
            $date_1_sesudah_pemupukan=microtime(true)/1000;
            usleep($sleep_irigasi); //sleep

            $result=$binaryData->sendAndReceive($packet2_irigasi);
            $date_2_sesudah_pemupukan=microtime(true)/1000;
            usleep(2*1000*1000);

            //hasil
            $status="success";
        }
        catch(\Exception $exception) {
            echo 'An exception occurred'."<br/>";
            echo $exception->getMessage()."<br/>";
            echo $exception->getTraceAsString()."<br/>";
        }
        finally{
            $connection->close();
        }

        return [
            'status'        =>$status
        ];
    }

    public static function process_mv_rabuk($type="urea", $options){
        Endian::$defaultEndian=Endian::BIG_ENDIAN;

        //options params
        // $options=[
        //     'modbus_url',
        //     'modbus_port',
        //     'sensor_active',
        //     'modbus_url',
        //     'berat_rabuk',
        // ];


        //-----------------------------

        //variable
        //iot control modbus
        $list=[
            'modbus_url'    =>$options['modbus_url'],
            'modbus_port'   =>$options['modbus_port'],
            'name'          =>$options['name'],
            'sensor_selected'   =>$options['sensor_selected'],
            'address'       =>$options['address'],
            'waktu_buka'    =>$options['waktu_buka']
        ];

        //kondisi
        if(!$list['sensor_selected']){
            return [
                'status'        =>"sensor_not_selected",
                'name'          =>$list['name'],
                'waktu_tunggu'  =>"",
                'waktu_tunggu_simulasi' =>""
            ];
        }

        //waktu buka
        $waktu_buka=$list['waktu_buka'];

        //process
        $connection=BinaryStreamConnection::getBuilder()
            ->setPort($list['modbus_port'])
            ->setHost($list['modbus_url'])
            ->setConnectTimeoutSec(5)
            ->setWriteTimeoutSec(30)
            ->setReadTimeoutSec(30)
            ->build();

        $type=substr($list['address'], 0, 1);
        $startAddress=(int)(substr($list['address'], 1));
        $startAddress=$startAddress-1;
        $unitID=1;

        $status="error";
        if($type=="4"){
            $registers=[Types::toReal(1)];
            $packet=new WriteMultipleRegistersRequest($startAddress, $registers, $unitID);

            $registers2=[Types::toReal(0)];
            $packet2=new WriteMultipleRegistersRequest($startAddress, $registers2, $unitID);
        }
        else{
            $coil=true;
            $packet=new WriteSingleCoilRequest($startAddress, $coil, $unitID);

            $coil2=false;
            $packet2=new WriteSingleCoilRequest($startAddress, $coil2, $unitID);
        }

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
            $status="success";
        }
        catch(\Exception $exception) {
            // echo 'An exception occurred'."<br/>";
            // echo $exception->getMessage()."<br/>";
            // echo $exception->getTraceAsString()."<br/>";
        }
        finally{
            $connection->close();
        }

        return [
            'status'        =>$status,
            'name'          =>$list['name'],
            'waktu_tunggu'  =>$waktu_buka,
            'waktu_tunggu_simulasi' =>$waktu_eksekusi
        ];
    }
}