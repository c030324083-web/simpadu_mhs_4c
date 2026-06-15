<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AdminDataMahasiswaController extends Controller
{
    /**
     * Menampilkan daftar mahasiswa sesuai filter & sorting UI SIMPADU
     */
    public function Index(Request $request)
    {
        try {
            // 1. Ambil Master Data Kelas/MK dari Kelompok 1 via HTTP Client di awal
            // Ini penting agar kita bisa memfilter mahasiswa lokal berdasarkan semester eksternal
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url');
            $dataMasterKelas = [];

            try {
                $responseKelas = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-mk');
                if ($responseKelas->successful()) {
                    $resJson = $responseKelas->json();
                    $dataMasterKelas = $resJson['data'] ?? [];
                }
            } catch (\Exception $e) {
                Log::error('Gagal mengambil master kelas Kelompok 1: ' . $e->getMessage());
            }

            // 2. Inisialisasi Query Builder untuk tabel Mahasiswa Lokal
            $query = Mahasiswa::with([
                'jenisKelamin:id_jk,nama_jk',
                'statusMahasiswa:id_status_mhs,nama_status'
            ]);

            // 3. FITUR PENCARIAN (Input 'Cari' di UI - Bisa NIM atau Nama)
            if ($request->has('search') && !empty($request->query('search'))) {
                $keyword = trim($request->query('search'));
                $query->where(function ($q) use ($keyword) {
                    $q->where('nama', 'LIKE', "%{$keyword}%")
                      ->orWhere('nim', 'LIKE', "%{$keyword}%");
                });
            }

            // 4. FITUR FILTER PROGRAM STUDI (Dropdown "Semua Program Studi")
            if ($request->has('id_prodi') && !empty($request->query('id_prodi'))) {
                $query->where('id_prodi', $request->query('id_prodi'));
            }

            // 5. FITUR FILTER SEMESTER (Dropdown "Semua Semester" dari API Kelompok 1)
            // Karena semester ada di API luar, kita cari prodi/kelas mana saja di API luar yang memiliki semester tersebut,
            // lalu kita filter id_prodi lokal yang berada di dalam daftar tersebut.
            if ($request->has('semester') && !empty($request->query('semester'))) {
                $semesterTarget = $request->query('semester');
                
                // Ambil semua id_prodi dari kelompok 1 yang sesuai dengan semester yang dipilih
                $prodiIdsSesuaiSemester = collect($dataMasterKelas)
                    ->where('kelas.semester', $semesterTarget)
                    ->pluck('kelas.prodi.id')
                    ->unique()
                    ->toArray();

                // Filter mahasiswa lokal yang id_prodi-nya masuk ke dalam daftar prodiIdsSesuaiSemester
                $query->whereIn('id_prodi', $prodiIdsSesuaiSemester);
            }

            // 6. FITUR SORTING (Dropdown "Sort by Nama (A-Z)", dll)
            $sortBy = $request->query('sort_by', 'nim'); // default diurutkan berdasarkan nim
            $sortDir = strtolower($request->query('sort_dir', 'asc')) === 'desc' ? 'desc' : 'asc';

            // Validasi kolom agar aman dari SQL Injection
            if (in_array($sortBy, ['nim', 'nama'])) {
                $query->orderBy($sortBy, $sortDir);
            }

            // 7. Eksekusi Pagination (Sesuai tampilan tabel SIMPADU yang dibatasi per halaman)
            $mahasiswaLokal = $query->paginate(10);

            // 8. Gabungkan data lokal dan teks nama prodi/semester dari kelompok 1
            $transformedData = $mahasiswaLokal->getCollection()->map(function ($mhs) use ($dataMasterKelas) {
                // Cari data kelas yang cocok berdasarkan id_prodi lokal di dalam master kelompok 1
                $kelasEksternal = collect($dataMasterKelas)->firstWhere('kelas.prodi.id', $mhs->id_prodi);

                return [
                    'nim' => $mhs->nim,
                    'nama' => $mhs->nama,
                    'email' => $mhs->email,
                    'status' => $mhs->statusMahasiswa->nama_status ?? 'Tidak Aktif',
                    // Data di bawah dikawinkan dari API Kelompok 1
                    'program_studi' => $kelasEksternal['kelas']['prodi']['nama_prodi'] ?? 'Prodi Belum Diatur',
                    'semester' => $kelasEksternal['kelas']['semester'] ?? '-',
                ];
            });

            // Kembalikan koleksi data yang sudah di-transform ke paginator
            $mahasiswaLokal->setCollection($transformedData);

            return response()->json([
                'success' => true,
                'message' => 'Daftar mahasiswa berhasil difilter dan diurutkan',
                'data' => $mahasiswaLokal
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses data: ' . $e->getMessage()
            ], 500);
        }
    }

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
            'statusMahasiswa:id_status_mhs,nama_status'
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
