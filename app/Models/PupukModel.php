<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PupukModel extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
     protected $table='pupuks';
     protected $primaryKey='id';
     protected $perPage=99999999999999999999;
     protected $fillable=[
        "lahan_id",
        "usia_tanaman",
        "jumlah_tanaman",
        "dosis_urea",
        "dosis_mkp",
        "dosis_kcl"
    ];
    protected $casts=[
    ];
}

