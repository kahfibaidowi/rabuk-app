<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LahanDetailModel extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
     protected $table='lahan_details';
     protected $primaryKey='id';
     protected $perPage=99999999999999999999;
     protected $fillable=[
        "lahan_id",
        "soil_n",
        "soil_p",
        "soil_k",
        "soil_ph",
        "cec",
        "soil_ec",
        "soil_s",
        "soil_tds",
        "soil_h",
        "soil_t",
        "usia_tanaman",
        "curah_hujan",
        "modbus_status"
    ];
    protected $casts=[
    ];
}

