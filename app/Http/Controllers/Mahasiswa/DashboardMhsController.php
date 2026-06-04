<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mahasiswa;

class DashboardMhsController extends Controller
{
    public function index()
    {
        return view('mahasiswa.dashboard_mhs');
    }
}
