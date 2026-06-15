<?php

namespace App\Http\Controllers\Api\InterService;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JenisKelamin;

class ApiJenisKelaminController extends Controller
{
    public function index()
    {
        $jenisKelamin = JenisKelamin::all();
        return response()->json([
            'success' => true,
            'message' => 'Daftar jenis kelamin berhasil diambil',
            'data' => $jenisKelamin
        ]);
    }

    public function show($id)
    {
        $jenisKelamin = JenisKelamin::find($id);
        if (!$jenisKelamin) {
            return response()->json([
                'success' => false,
                'message' => 'Jenis kelamin tidak ditemukan'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Jenis kelamin berhasil diambil',
            'data' => $jenisKelamin
        ]);
    }
}
