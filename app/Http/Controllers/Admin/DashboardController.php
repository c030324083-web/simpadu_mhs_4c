<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function dashboard()
    {
        $mahasiswa = route('list_mahasiswa');
        return view('admin.dashboard_admin');
    }

    public function data_mahasiswa() 
    {
        $mahasiswa = Mahasiswa::all();
        return view('admin.data_mahasiswa');
    }
    
    public function detail_mahasiswa($nim)
    {
        return view('admin.detail_mahasiswa');
    }

    public function presensi()
    {
        return view('admin.presensi');
    }

    public function penilaian()
    {
        return view('admin.penilaian');
    }

    public function krs()
    {
        return view('admin.krs');
    }

    public function khs()
    {
        return view('admin.khs');
    }

    public function jadwal()
    {
        return view('admin.jadwal');
    }
}
