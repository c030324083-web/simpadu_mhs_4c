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
            // 1. Ambil Master Data Kelas dari Kelompok 1 via HTTP Client
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url');
            $dataMasterKelas = [];
    
            try {
                // Menggunakan endpoint sesuai skema yang Anda berikan
                $responseKelas = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-master');
                if ($responseKelas->successful()) {
                    $resJson = $responseKelas->json();
                    $dataMasterKelas = $resJson['data'] ?? [];
                }
            } catch (\Exception $e) {
                Log::error('Gagal mengambil master kelas Kelompok 1: ' . $e->getMessage());
            }
    
            // 2. Inisialisasi Query Builder (Sesuaikan dengan foreign key HURUF KAPITAL)
            // Perbaikan: relasi disesuaikan dengan kolom ID_STATUS_MHS milik database Anda
            $query = Mahasiswa::with([
                'statusMahasiswa' => function($q) {
                    // Pastikan select kolom primary key tabel status dan nama statusnya
                    // Gantilah 'id' di bawah jika primary key tabel status Anda bukan 'id' (misal 'ID_STATUS_MHS')
                    $q->select('id', 'nama_status'); 
                }
            ]);
    
            // 3. FITUR PENCARIAN (Gunakan nama kolom HURUF KAPITAL: NAMA, NIM)
            if ($request->has('search') && !empty($request->query('search'))) {
                $keyword = trim($request->query('search'));
                $query->where(function ($q) use ($keyword) {
                    $q->where('NAMA', 'LIKE', "%{$keyword}%")
                      ->orWhere('NIM', 'LIKE', "%{$keyword}%");
                });
            }
    
            // 4. FITUR FILTER PROGRAM STUDI (Gunakan nama kolom HURUF KAPITAL: ID_PRODI)
            if ($request->has('id_prodi') && !empty($request->query('id_prodi'))) {
                $query->where('ID_PRODI', $request->query('id_prodi'));
            }
    
            // 5. FITUR FILTER SEMESTER 
            if ($request->has('semester') && !empty($request->query('semester'))) {
                $semesterTarget = $request->query('semester');
                
                // Ambil semua NIM dari data eksternal kelompok 1 yang semester kelasnya cocok
                $nimSesuaiSemester = collect($dataMasterKelas)
                    ->filter(function ($item) use ($semesterTarget) {
                        return ($item['kelas']['semester'] ?? '') == $semesterTarget;
                    })
                    ->pluck('nim') // Ambil nim dari objek eksternal
                    ->unique()
                    ->toArray();
    
                // Filter mahasiswa lokal yang NIM-nya ada di daftar tersebut
                $query->whereIn('NIM', $nimSesuaiSemester);
            }
    
            // 6. FITUR SORTING (Gunakan nama kolom HURUF KAPITAL untuk database)
            $sortByInput = strtolower($request->query('sort_by', 'nim'));
            $sortBy = ($sortByInput === 'nama') ? 'NAMA' : 'NIM'; // Map ke huruf kapital
            $sortDir = strtolower($request->query('sort_dir', 'asc')) === 'desc' ? 'desc' : 'asc';
    
            $query->orderBy($sortBy, $sortDir);
    
            // 7. Eksekusi Pagination
            $mahasiswaLokal = $query->paginate(10);
    
            // 8. Transformasi Data: Menghubungkan Huruf Kapital Lokal ke JSON Output Semula
            $transformedData = $mahasiswaLokal->getCollection()->map(function ($mhs) use ($dataMasterKelas) {
                // Cari data kecocokan di API eksternal berdasarkan NIM mahasiswa lokal
                $kelasEksternal = collect($dataMasterKelas)->first(function ($item) use ($mhs) {
                    return ($item['nim'] ?? '') == $mhs->NIM;
                });
    
                return [
                    // PERBAIKAN: Membaca data lokal menggunakan HURUF KAPITAL sesuai isi database Anda
                    'nim'           => $mhs->NIM,
                    'nama'          => $mhs->NAMA,
                    'email'         => $mhs->EMAIL,
                    'status'        => $mhs->statusMahasiswa->nama_status ?? ($mhs->ID_STATUS_MHS == 1 ? 'Aktif' : 'Tidak Aktif'),
                    
                    // Data hasil perkawinan dari API Kelompok 1 (berdasarkan struktur kelas-master terbaru)
                    'program_studi' => $kelasEksternal['kelas']['kelas_nama'] ?? 'Prodi Belum Diatur',
                    'semester'      => isset($kelasEksternal['kelas']['semester']) ? (int)$kelasEksternal['kelas']['semester'] : 5,
                ];
            });
    
            // Kembalikan koleksi data yang sudah diperbaiki ke paginator
            $mahasiswaLokal->setCollection($transformedData);
    
            return response()->json([
                'success' => true,
                'message' => 'Daftar mahasiswa berhasil difilter dan diurutkan',
                'data'    => $mahasiswaLokal
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
