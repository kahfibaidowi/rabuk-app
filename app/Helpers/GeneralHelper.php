<?php

namespace App\Helpers;


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
}