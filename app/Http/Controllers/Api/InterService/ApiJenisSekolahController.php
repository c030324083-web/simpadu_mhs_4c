<?php

namespace App\Http\Controllers\Api\InterService;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JenisSekolah;

class ApiJenisSekolahController extends Controller
{
    public function index()
    {
        $jenisSekolah = JenisSekolah::all();
        return response()->json([
            'success' => true,
            'message' => 'Daftar jenis sekolah berhasil diambil',
            'data' => $jenisSekolah,
        ]);
    }

    public function show($id)
    {
        $jenisSekolah = JenisSekolah::find($id);
        if (!$jenisSekolah) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis sekolah tidak ditemukan'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Jenis sekolah berhasil diambil',
            'data' => $jenisSekolah
        ]);
    }
}
