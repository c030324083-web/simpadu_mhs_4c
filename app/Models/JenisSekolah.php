<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisSekolah extends Model
{
    protected $table = 'jenis_sekolah';
    protected $primaryKey = 'ID_JENIS_SEKOLAH';
    public $incrementing = false;
    public $timestamps = false;

    public function mahasiswa()
    {
        return $this->hasMany(Mahasiswa::class,'id_jenis_sekolah','id_jenis_sekolah');
    }
}
