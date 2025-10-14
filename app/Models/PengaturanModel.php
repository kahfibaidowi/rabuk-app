<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanModel extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
     protected $table='pengaturans';
     protected $primaryKey='id';
     protected $perPage=99999999999999999999;
     protected $fillable=[
        "name",
        "value"
    ];
    protected $casts=[
    ];
}

