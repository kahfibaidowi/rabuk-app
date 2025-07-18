<?php

namespace App\Repository;

use App\Models\PupukModel;

class PupukRepo{

    public static function get($id)
    {
        //query
        $query=PupukModel::where('id', $id);

        return $query->first()->toArray();
    }
    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['lahan_id']=isset($params['lahan_id'])?trim($params['lahan_id']):"";

        //query
        $query=PupukModel::query();
        //--lahan_id
        if($params['lahan_id']!=""){
            $query=$query->where("lahan_id", $params['lahan_id']);
        }
        
        $query=$query->orderByDesc("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}