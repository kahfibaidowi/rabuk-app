<?php

namespace App\Repository;

use App\Models\LahanDetailModel;

class LahanDetailRepo{

    public static function get($id)
    {
        //query
        $query=LahanDetailModel::where('id', $id);

        return $query->first()->toArray();
    }
    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['lahan_id']=isset($params['lahan_id'])?trim($params['lahan_id']):"";
        $params['date_start']=isset($params['date_start'])?trim($params['date_start']):"";
        $params['date_end']=isset($params['date_end'])?trim($params['date_end']):"";

        //query
        $query=LahanDetailModel::query();
        //--lahan_id
        if($params['lahan_id']!=""){
            $query=$query->where("lahan_id", $params['lahan_id']);
        }
        //--date between
        if($params['date_start']!=""){
            $query=$query->whereBetween("created_at", [
                $params['date_start'], 
                $params['date_end']
            ]);
        }
        
        $query=$query->orderByDesc("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
    public static function get_last($params)
    {
        $params['status']=isset($params['status'])?trim($params['status']):"";
        $params['lahan_id']=isset($params['lahan_id'])?trim($params['lahan_id']):"";

        //query
        $query=LahanDetailModel::query();
        //--status
        if($params['status']!=""){
            $query=$query->where("modbus_status", $params['status']);
        }
        //--lahan_id
        if($params['lahan_id']!=""){
            $query=$query->where("lahan_id", $params['lahan_id']);
        }

        $query=$query->orderByDesc("id");

        //return
        $data=$query->first();

        if(!is_null($data)){
            return $data->toArray();
        }
        return null;
    }
}