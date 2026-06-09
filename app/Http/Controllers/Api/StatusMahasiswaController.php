<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StatusMahasiswa;

class StatusMahasiswaController extends Controller
{
    public function index()
    {
        $statusMahasiswa = StatusMahasiswa::all();
        return response()->json([
            'status' => 'success',
            'message' => 'Daftar status mahasiswa berhasil diambil',
            'data' => $statusMahasiswa
        ]);
    }

    public function show($id)
    {
        $statusMahasiswa = StatusMahasiswa::find($id);
        if (!$statusMahasiswa) {
            return response()->json([
                'status' => 'error',
                'message' => 'Status mahasiswa tidak ditemukan'
            ], 404);
        }
        return response()->json([
            'status' => 'success',
            'message' => 'Status mahasiswa berhasil diambil',
            'data' => $statusMahasiswa
        ]);
    }
}
