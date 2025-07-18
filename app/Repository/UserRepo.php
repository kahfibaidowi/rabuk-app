<?php

namespace App\Repository;

use App\Models\User;

class UserRepo{

    public static function get($id)
    {
        //query
        $query=User::where('id', $id);

        return $query->first()->toArray();
    }
    public static function gets($params)
    {
        $params['per_page']=isset($params['per_page'])?trim($params['per_page']):"";
        $params['q']=isset($params['q'])?$params['q']:"";
        $params['role']=isset($params['role'])?trim($params['role']):"";

        //query
        $query=User::query();
        $query=$query->where("name", "like", "%".$params['q']."%");
        //--role
        if($params['role']!=""){
            $query=$query->where("role", $params['role']);
        }
        
        $query=$query->orderByDesc("id");

        //return
        return $query->paginate($params['per_page'])->toArray();
    }
    public static function user_count_all()
    {
        //query
        $query=User::where("role", "user");

        return $query->count();
    }
}