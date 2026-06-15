<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mahasiswa extends Model
{
    protected $table = 'mahasiswa';
    protected $primaryKey = 'NIM';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $fillable = [
        'NIM',
        'ID_STATUS_MHS',
        'ID_JK',
        'NAMA',
        'ID_AGAMA',
        'ID_USER',
        'EMAIL',
        'ID_PRODI',
        'TANGGAL_LAHIR',
        'NO_HP',
        'ALAMAT',
        'ID_KABUPATEN',
        'ID_PROVINSI',
        'ID_UKT_KATEGORI',
        'NAMA_AYAH',
        'ID_PEKERJAAN_AYAH',
        'PENGHASILAN_AYAH',
        'SLIP_GAJI_AYAH',
        'NAMA_IBU',
        'ID_PEKERJAAN_IBU',
        'PENGHASILAN_IBU',
        'SLIP_GAJI_IBU'
    ];

    public function jenisKelamin()
    {
        return $this->belongsTo(JenisKelamin::class, 'id_jk', 'id_jk');
    }

    public function statusMahasiswa()
    {
        return $this->belongsTo(StatusMahasiswa::class, 'id_status_mhs', 'id_status_mhs');
    }
}
