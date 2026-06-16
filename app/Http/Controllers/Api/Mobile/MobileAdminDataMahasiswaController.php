<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MobileAdminDataMahasiswaController extends Controller
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
}
