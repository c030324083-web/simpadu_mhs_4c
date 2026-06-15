<?php

namespace App\Http\Controllers\Api\InterService;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mahasiswa;

class ApiMahasiswaController extends Controller
{
    /**
     * Menampilkan daftar mahasiswa.
     *
     * Endpoint ini digunakan untuk mengambil seluruh data mahasiswa.
     */
    public function Index()
    {
        $mahasiswa = Mahasiswa::with(['jenisKelamin' => function ($query) {
            $query->select('id_jk', 'nama_jk');
        }])->get(['nim', 'nama', 'id_jk']);
        return response()->json([
            'success' => true,
            'message' => 'Daftar mahasiswa berhasil diambil',
            'data' => $mahasiswa
        ]);
    }

    /**
     * Menampilkan detail mahasiswa
     * 
     * Endpoint ini digunakan untuk melihat detail mahasiswa menggunakan nim
     */
    public function Show($nim)
    {
        $mahasiswa = Mahasiswa::find($nim);
        if ($mahasiswa) {
            return response()->json([
                'success' => true,
                'message' => 'Data mahasiswa ditemukan',
                'data' => $mahasiswa
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Data mahasiswa tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Summary of Store
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function Store(Request $request)
    {
        $validatedData = $request->validate([
            'NIM'               => 'required|string|unique:mahasiswa,NIM',
            'NAMA'              => 'required|string',
            'EMAIL'             => 'required|email',
            'NO_HP'             => 'nullable',
            'ID_JK'             => 'required|exists:jenis_kelamin,id_jk', // sesuaikan nama kolom id di tabel jenis_kelamin
            'ID_USER'           => 'required|integer',
            'ID_AGAMA'          => 'nullable',
            'ID_STATUS_MHS'     => 'nullable',
            'ID_PRODI'          => 'nullable',
            'TANGGAL_LAHIR'     => 'nullable|date',
            'ALAMAT'            => 'nullable',
            'ID_KABUPATEN'      => 'nullable',
            'ID_PROVINSI'       => 'nullable',
            'ID_UKT_KATEGORI'   => 'nullable',
            'NAMA_AYAH'         => 'nullable',
            'ID_PEKERJAAN_AYAH' => 'nullable',
            'PENGHASILAN_AYAH'  => 'nullable',
            'SLIP_GAJI_AYAH'    => 'nullable',
            'NAMA_IBU'          => 'nullable',
            'ID_PEKERJAAN_IBU'  => 'nullable',
            'PENGHASILAN_IBU'   => 'nullable',
            'SLIP_GAJI_IBU'     => 'nullable',
            // Tambahkan validasi untuk field lainnya sesuai kebutuhan
        ]);

        $mahasiswa = Mahasiswa::create($validatedData);
        return response()->json([
            'success' => true,
            'message' => 'Mahasiswa berhasil ditambahkan',
            'data' => $mahasiswa
        ], 201);
    }

    public function Update(Request $request, $nim)
    {
        $mahasiswa = Mahasiswa::find($nim);
        if ($mahasiswa) {
            $validatedData = $request->validate([
                'NAMA'              => 'nullable|string',
                'EMAIL'             => 'nullable|email',
                'NO_HP'             => 'nullable',
                'ID_JK'             => 'nullable|exists:jenis_kelamin,id_jk', // sesuaikan nama kolom id di tabel jenis_kelamin
                'ID_USER'           => 'nullable|integer',
                'ID_AGAMA'          => 'nullable',
                'ID_STATUS_MHS'     => 'nullable',
                'ID_PRODI'          => 'nullable',
                'TANGGAL_LAHIR'     => 'nullable|date',
                'ALAMAT'            => 'nullable',
                'ID_KABUPATEN'      => 'nullable',
                'ID_PROVINSI'       => 'nullable',
                'ID_UKT_KATEGORI'   => 'nullable',
                'NAMA_AYAH'         => 'nullable',
                'ID_PEKERJAAN_AYAH' => 'nullable',
                'PENGHASILAN_AYAH'  => 'nullable',
                'SLIP_GAJI_AYAH'    => 'nullable',
                'NAMA_IBU'          => 'nullable',
                'ID_PEKERJAAN_IBU'  => 'nullable',
                'PENGHASILAN_IBU'   => 'nullable',
                'SLIP_GAJI_IBU'     => 'nullable',
                // Tambahkan validasi untuk field lainnya sesuai kebutuhan
            ]);

            $mahasiswa->update($validatedData);
            return response()->json([
                'success' => true,
                'message' => 'Mahasiswa berhasil diperbarui',
                'data' => $mahasiswa
            ]);
        } else {
            return response()->json([
                'success' => false,
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
                'success' => true,
                'message' => 'Mahasiswa berhasil dihapus'
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Data mahasiswa tidak ditemukan'
            ], 404);
        }
    }

    public function searchByName(Request $request, $nama = null)
    {
        $keyword = trim($nama ?? $request->query('nama', ''));

        if ($keyword === '') {
            return response()->json([
                'success' => false,
                'message' => 'Parameter nama wajib diisi untuk pencarian'
            ], 400);
        }

        $mahasiswa = Mahasiswa::with([
            'jenisKelamin:id_jk,nama_jk',
            'statusMahasiswa:id_status_mhs,nama_status'
        ])->where('nama', 'LIKE', "%{$keyword}%")
          ->get(['nim', 'nama', 'id_jk', 'id_status_mhs', 'email']);

        return response()->json([
            'success' => true,
            'message' => 'Hasil pencarian mahasiswa',
            'data' => $mahasiswa
        ]);
    }

    public function filterByStatus(Request $request, $id_status_mhs = null)
    {
        $status = trim($id_status_mhs ?? $request->query('status', ''));

        if ($status === '') {
            return response()->json([
                'success' => false,
                'message' => 'Parameter status wajib diisi untuk filter'
            ], 400);
        }

        $mahasiswa = Mahasiswa::with([
            'jenisKelamin:id_jk,nama_jk',
            'statusMahasiswa:id_status_mhs,nama_status_mhs'
        ])->where('id_status_mhs', $status)
          ->get(['nim', 'nama', 'id_jk', 'id_status_mhs', 'email']);

        return response()->json([
            'success' => true,
            'message' => "Daftar mahasiswa dengan status {$status}",
            'data' => $mahasiswa
        ]);
    }

    public function filterByJenisKelamin(Request $request, $id_jk = null)
    {
        $jenisKelamin = trim($id_jk ?? $request->query('jenis_kelamin', ''));

        if ($jenisKelamin === '') {
            return response()->json([
                'success' => false,
                'message' => 'Parameter jenis_kelamin wajib diisi untuk filter'
            ], 400);
        }

        $mahasiswa = Mahasiswa::with([
            'jenisKelamin:id_jk,nama_jk',
            'statusMahasiswa:id_status_mhs,nama_status'
        ])->where('id_jk', $jenisKelamin)
          ->get(['nim', 'nama', 'id_jk', 'id_status_mhs', 'email']);

        return response()->json([
            'success' => true,
            'message' => "Daftar mahasiswa dengan jenis kelamin {$jenisKelamin}",
            'data' => $mahasiswa
        ]);
    }
}
