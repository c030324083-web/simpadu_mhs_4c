<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StatusMahasiswa;

class StatusMahasiswaController extends Controller
{
    public function index()
    {
        $statusMahasiswa = StatusMahasiswa::all();
        return response()->json([
            'success' => true,
            'message' => 'Daftar status mahasiswa berhasil diambil',
            'data' => $statusMahasiswa
        ]);
    }

    public function show($id)
    {
        $statusMahasiswa = StatusMahasiswa::find($id);
        if (!$statusMahasiswa) {
            return response()->json([
                'success' => false,
                'message' => 'Status mahasiswa tidak ditemukan'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Status mahasiswa berhasil diambil',
            'data' => $statusMahasiswa
        ]);
    }
}
