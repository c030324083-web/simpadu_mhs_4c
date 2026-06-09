<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mahasiswa;

class DashboardMhsController extends Controller
{
    public function dashboard()
    {
        return view('mahasiswa.dashboard_mhs');
    }

    public function jadwal()
    {
        return view('mahasiswa.jadwal_kuliah');
    }

    public function presensi()
    {
        return view('mahasiswa.presensi');
    }

    public function penilaian()
    {
        return view('mahasiswa.penilaian');
    }

    public function khs()
    {
        return view('mahasiswa.khs');
    }

    public function krs()
    {
        return view('mahasiswa.krs');
    }

}
