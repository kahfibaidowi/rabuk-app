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

    public static function process_mv($type="urea"){
        //larutan pupuk per liter
        $larutan_urea=33.333;
        $larutan_sp36=20;
        $larutan_kcl=40;

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

        //variable
        $tinggi_tandon=0.5;
        $panjang_pipa=5;
        $diameter_pipa=0.0127;
        $volume_dialirkan=0.001;
        $waktu_buka_tutup_mv=4;
        $diameter_bukaan_mv_max=0.00635;

        //laju air & debit max air
        $laju_air=sqrt(2*9.81*$tinggi_tandon);
        $luas_penampang_bukaan_mv_penuh=

        //params
        $pupuk=$req['berat_rabuk']; #gram pupuk yang akan dikonversi ke cair
        $konsentrasi_per_liter=$req['konsentrasi_per_liter']; #gram/liter
        $pupuk_cair=$pupuk/$konsentrasi_per_liter;
        $pupuk_cair_ml=ceil($pupuk_cair*1000);

        //satuan ml/s
        $motor_tutup=[4, 0]; #tertutup
        $motor_buka_quarter=[8, 284.5]; #terbuka 25%
        $motor_buka_mid=[16, 682.8]; #terbuka 60%
        $motor_buka_full=[20, 1138]; #terbuka 100%

        $motor_dipilih=$motor_tutup;
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