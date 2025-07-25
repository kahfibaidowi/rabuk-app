<?php

namespace App\Helpers;

use ModbusTcpClient\Network\BinaryStreamConnection;
use ModbusTcpClient\Packet\ModbusFunction\WriteMultipleRegistersRequest;
use ModbusTcpClient\Packet\ModbusFunction\WriteMultipleRegistersResponse;
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
        //     'sp36_gram',
        //     'sp36_v_liter',
        //     'kcl_gram',
        //     'kcl_v_liter'
        // ];

        //larutan pupuk per liter
        $larutan_urea=$options['urea_gram']/max($options['urea_v_liter'], 1);
        $larutan_sp36=$options['sp36_gram']/max($options['sp36_v_liter'], 1);
        $larutan_kcl=$options['kcl_gram']/max($options['kcl_v_liter'], 1);

        $larutan_dipilih=$larutan_urea;
        switch($type){
            case "urea":
                $larutan_dipilih=$larutan_urea;
            break;
            case "sp36":
                $larutan_dipilih=$larutan_sp36;
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

    public static function process_mv_time($type="urea", $berat_rabuk, $options){
        //options params
        // $options=[
        //     'modbus_url',
        //     'modbus_port',
        //     'urea_gram',
        //     'urea_v_liter',
        //     'sp36_gram',
        //     'sp36_v_liter',
        //     'kcl_gram',
        //     'kcl_v_liter',
        //     'time'
        // ];


        //-----------------------------

        //params
        $motor_dipilih=16;
        $motor_tertutup=4;

        //waktu buka
        $waktu_buka=$options['time'];

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

    public static function process_mv_rabuk_time($type="urea", $berat_rabuk, $options){
        //options params
        // $options=[
        //     'modbus_url',
        //     'modbus_port',
        //     'urea_gram',
        //     'urea_v_liter',
        //     'sp36_gram',
        //     'sp36_v_liter',
        //     'kcl_gram',
        //     'kcl_v_liter',
        // ];


        //-----------------------------

        //params
        $motor_dipilih=16;
        $motor_tertutup=4;

        //variable
        $berat_rabuk=ceil($berat_rabuk);

        //waktu buka
        $waktu_buka=4;
        if($berat_rabuk<=45){
            $waktu_buka=6;
        }
        else if($berat_rabuk<=65){
            $waktu_buka=7;
        }
        else if($berat_rabuk<=95){
            $waktu_buka=8;
        }
        else if($berat_rabuk<=145){
            $waktu_buka=9;
        }
        else if($berat_rabuk<=240){
            $waktu_buka=10;
        }
        else if($berat_rabuk<=350){
            $waktu_buka=11;
        }
        else if($berat_rabuk<=450){
            $waktu_buka=12;
        }
        else if($berat_rabuk<=500){
            $waktu_buka=13;
        }
        else if($berat_rabuk<=650){
            $waktu_buka=14;
        }
        else if($berat_rabuk<=850){
            $waktu_buka=15;
        }
        else if($berat_rabuk<=1050){
            $waktu_buka=16;
        }
        else if($berat_rabuk<=1250){
            $waktu_buka=17;
        }
        else if($berat_rabuk<=1490){
            $waktu_buka=18;
        }
        else if($berat_rabuk<=1750){
            $waktu_buka=19;
        }
        else if($berat_rabuk<=2000){
            $waktu_buka=20;
        }
        else if($berat_rabuk>2000){
            $sisa=$berat_rabuk-2000;
            $waktu_tambahan=$sisa/250;
            $waktu_buka=round(20+$waktu_tambahan, 2)+0.01;
        }


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
}