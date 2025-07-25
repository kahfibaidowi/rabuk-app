<?php

namespace App\Repository;

use App\Models\ModbusSensorModel;

class ModbusSensorRepo{

    public static function get($id)
    {
        //query
        $query=ModbusSensorModel::where('id', $id);

        return $query->first()->toArray();
    }
    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['user_id']=isset($params['user_id'])?trim($params['user_id']):"";

        //query
        $query=ModbusSensorModel::query();
        //--user_id
        if($params['user_id']!=""){
            $query=$query->where("user_id", $params['user_id']);
        }
        
        $query=$query->orderByDesc("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}