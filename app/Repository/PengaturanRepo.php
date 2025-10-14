<?php

namespace App\Repository;

use App\Models\PengaturanModel;

class PengaturanRepo{

    public static function get()
    {
        //query
        $query=PengaturanModel::query();

        $data=[];
        foreach($query->get() as $val){
            $data[$val['label']]=$val['value'];
        }

        return $data;
    }
}