<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LahanModel extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table='lahans';
    protected $primaryKey='id';
    protected $perPage=99999999999999999999;
    protected $fillable=[
       "nama_lahan",
       'ews_district_id',
       "lokasi",
       "pemilik",
       "luas_area",
       "jarak_tanam",
       "jumlah_tanaman",
       "jenis_tanaman",
       "tgl_tanam",
       "icon",
       "modbus_url",
       "modbus_port",
       "modbus_status",
       "urea_gram",
       "urea_v_liter",
       "sp36_gram",
       "sp36_v_liter",
       "kcl_gram",
       "kcl_v_liter"
    ];
   
   
    protected function casts(): array
    {
        return [
            'tgl_tanam' => 'datetime:Y-m-d',
        ];
    }
}
