<?php

namespace App\Repository;

use App\Models\LahanModel;

class LahanRepo{

    public static function get($id)
    {
        //query
        $query=LahanModel::where('id', $id);

        return $query->first()->toArray();
    }
    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['jenis_tanaman']=isset($params['jenis_tanaman'])?trim($params['jenis_tanaman']):"";

        //query
        $query=LahanModel::query();
        //--jenis_tanaman
        if($params['jenis_tanaman']!=""){
            $query=$query->where("jenis_tanaman", $params['jenis_tanaman']);
        }
        
        $query=$query->orderByDesc("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
}