<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JenisKelamin;

class JenisKelaminController extends Controller
{
    public function index()
    {
        $jenisKelamin = JenisKelamin::all();
        return response()->json([
            'status' => 'success',
            'message' => 'Daftar jenis kelamin berhasil diambil',
            'data' => $jenisKelamin
        ]);
    }

    public function show($id)
    {
        $jenisKelamin = JenisKelamin::find($id);
        if (!$jenisKelamin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jenis kelamin tidak ditemukan'
            ], 404);
        }
        return response()->json([
            'status' => 'success',
            'message' => 'Jenis kelamin berhasil diambil',
            'data' => $jenisKelamin
        ]);
    }
}
