<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mahasiswa;

class MahasiswaController extends Controller
{
    public function Index()
    {
        $mahasiswa = Mahasiswa::with(['jenisKelamin' => function ($query) {
            $query->select('id_jk', 'nama_jk');
        }])->get(['nim', 'nama', 'id_jk']);
        return response()->json([
            'status' => 'success',
            'message' => 'Daftar mahasiswa berhasil diambil',
            'data' => $mahasiswa
        ]);
    }

    public function Show($nim)
    {
        $mahasiswa = Mahasiswa::find($nim);
        if ($mahasiswa) {
            return response()->json([
                'status' => 'success',
                'message' => 'Data mahasiswa ditemukan',
                'data' => $mahasiswa
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Data mahasiswa tidak ditemukan'
            ], 404);
        }
    }

    public function Store(Request $request)
    {
        $validatedData = $request->validate([
            'nim' => 'required|string|unique:mahasiswa',
            'nama' => 'required|string',
            'id_jk' => 'required|exists:jenis_kelamin,id_jk',
            'id_user' => 'required',
            'email' => 'required|email',
            // Tambahkan validasi untuk field lainnya sesuai kebutuhan
        ]);

        $mahasiswa = Mahasiswa::create($validatedData);
        return response()->json([
            'status' => 'success',
            'message' => 'Mahasiswa berhasil ditambahkan',
            'data' => $mahasiswa
        ], 201);
    }

    public function Update(Request $request, $nim)
    {
        $mahasiswa = Mahasiswa::find($nim);
        if ($mahasiswa) {
            $validatedData = $request->validate([
                'nama' => 'sometimes|required|string',
                'id_jk' => 'sometimes|required|exists:jenis_kelamin,id_jk',
                'id_user' => 'sometimes|required',
                'email' => 'sometimes|required|email',
                // Tambahkan validasi untuk field lainnya sesuai kebutuhan
            ]);

            $mahasiswa->update($validatedData);
            return response()->json([
                'status' => 'success',
                'message' => 'Mahasiswa berhasil diperbarui',
                'data' => $mahasiswa
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Data mahasiswa tidak ditemukan'
            ], 404);
        }
    }

    public function Destroy($nim)
    {
        $mahasiswa = Mahasiswa::find($nim);
        if ($mahasiswa) {
            $mahasiswa->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Mahasiswa berhasil dihapus'
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Data mahasiswa tidak ditemukan'
            ], 404);
        }
    }

    public function searchByName(Request $request, $nama = null)
    {
        $keyword = trim($nama ?? $request->query('nama', ''));

        if ($keyword === '') {
            return response()->json([
                'status' => 'error',
                'message' => 'Parameter nama wajib diisi untuk pencarian'
            ], 400);
        }

        $mahasiswa = Mahasiswa::with([
            'jenisKelamin:id_jk,nama_jk',
            'statusMahasiswa:id_status_mhs,nama_status'
        ])->where('nama', 'LIKE', "%{$keyword}%")
          ->get(['nim', 'nama', 'id_jk', 'id_status_mhs', 'email']);

        return response()->json([
            'status' => 'success',
            'message' => 'Hasil pencarian mahasiswa',
            'data' => $mahasiswa
        ]);
    }

    public function filterByStatus(Request $request, $id_status_mhs = null)
    {
        $status = trim($id_status_mhs ?? $request->query('status', ''));

        if ($status === '') {
            return response()->json([
                'status' => 'error',
                'message' => 'Parameter status wajib diisi untuk filter'
            ], 400);
        }

        $mahasiswa = Mahasiswa::with([
            'jenisKelamin:id_jk,nama_jk',
            'statusMahasiswa:id_status_mhs,nama_status'
        ])->where('id_status_mhs', $status)
          ->get(['nim', 'nama', 'id_jk', 'id_status_mhs', 'email']);

        return response()->json([
            'status' => 'success',
            'message' => "Daftar mahasiswa dengan status {$status}",
            'data' => $mahasiswa
        ]);
    }

    public function filterByJenisKelamin(Request $request, $id_jk = null)
    {
        $jenisKelamin = trim($id_jk ?? $request->query('jenis_kelamin', ''));

        if ($jenisKelamin === '') {
            return response()->json([
                'status' => 'error',
                'message' => 'Parameter jenis_kelamin wajib diisi untuk filter'
            ], 400);
        }

        $mahasiswa = Mahasiswa::with([
            'jenisKelamin:id_jk,nama_jk',
            'statusMahasiswa:id_status_mhs,nama_status'
        ])->where('id_jk', $jenisKelamin)
          ->get(['nim', 'nama', 'id_jk', 'id_status_mhs', 'email']);

        return response()->json([
            'status' => 'success',
            'message' => "Daftar mahasiswa dengan jenis kelamin {$jenisKelamin}",
            'data' => $mahasiswa
        ]);
    }
}
