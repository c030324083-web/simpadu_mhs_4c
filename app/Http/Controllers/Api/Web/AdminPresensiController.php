<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AdminPresensiController extends Controller
{

    /**
     * Menampilkan Rekapitulasi Presensi Sesuai UI SIMPADU
     * URL: GET /api/web/presensi
     */
    public function index(Request $request)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url');

            // 1. Tarik data absensi/perkuliahan dari Kelompok 1
            // Asumsi Kelompok 1 menyediakan data log presensi harian mahasiswa
            $responsePresensi = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/presensi-mahasiswa');
            $responseKelas = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-mk');

            if (!$responsePresensi->successful() || !$responseKelas->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal terhubung ke service akademik pusat.'], 502);
            }

            $rawPresensi = collect($responsePresensi->json()['data'] ?? []);
            $masterKelas = collect($responseKelas->json()['data'] ?? []);

            // 2. PROSES FILTERING BERDASARKAN PRODI & KELAS (Dari Dropdown UI)
            if ($request->has('id_prodi') && !empty($request->query('id_prodi'))) {
                $idProdi = $request->query('id_prodi');
                // Filter data kelas yang berada di bawah prodi tersebut
                $kelasSesuaiProdi = $masterKelas->where('kelas.prodi.id', $idProdi)->pluck('kelas.id')->toArray();
                $rawPresensi = $rawPresensi->whereIn('kelas_id', $kelasSesuaiProdi);
            }

            if ($request->has('id_kelas') && !empty($request->query('id_kelas'))) {
                $rawPresensi = $rawPresensi->where('kelas_id', $request->query('id_kelas'));
            }

            // 3. HITUNG COUNTER RINGKASAN (Untuk Card di Atas Tabel UI)
            // Menghitung jumlah sesi/kelas unik hari ini
            $totalSesiHariIni = $rawPresensi->unique('jadwal_id')->count(); 

            // Menghitung akumulasi status kehadiran mahasiswa
            $totalHadir = 0;
            $totalSakit = 0;
            $totalIzin  = 0;
            $totalAlpha = 0;

            foreach ($rawPresensi as $log) {
                switch (strtolower($log['status_kehadiran'] ?? '')) {
                    case 'hadir': $totalHadir++; break;
                    case 'sakit': $totalSakit++; break;
                    case 'izin':  $totalIzin++; break;
                    case 'alpha': $totalAlpha++; break;
                }
            }

            // 4. FORMAT DATA UNTUK TABEL & SORTING
            // Memetakan struktur data agar siap dibaca oleh tabel Vanilla JS
            $rekapTabel = $rawPresensi->groupBy('kelas_id')->map(function ($items, $kelasId) use ($masterKelas) {
                $infoKelas = $masterKelas->firstWhere('kelas.id', $kelasId);

                return [
                    'id_kelas' => $kelasId,
                    'nama_kelas' => $infoKelas['kelas']['nama_kelas'] ?? 'Kelas Tidak Diketahui',
                    'program_studi' => $infoKelas['kelas']['prodi']['nama_prodi'] ?? '-',
                    'mata_kuliah' => $infoKelas['mata_kuliah']['nama_mk'] ?? '-',
                    'hadir' => $items->where('status_kehadiran', 'Hadir')->count(),
                    'sakit' => $items->where('status_kehadiran', 'Sakit')->count(),
                    'izin'  => $items->where('status_kehadiran', 'Izin')->count(),
                    'alpha' => $items->where('status_kehadiran', 'Alpha')->count(),
                ];
            })->values();

            // 5. FITUR SORTING (Berdasarkan Nama Kelas / Matakuliah)
            $sortParam = $request->query('sort', 'kelas-asc');
            $sortParts = explode('-', $sortParam);
            $sortBy = $sortParts[0] == 'kelas' ? 'nama_kelas' : 'mata_kuliah';
            $sortDir = ($sortParts[1] ?? 'asc') == 'desc' ? true : false;

            $rekapTabel = $rekapTabel->sortBy($sortBy, SORT_REGULAR, $sortDir)->values();

            // 6. RESPONSE UNIFIED JSON
            return response()->json([
                'success' => true,
                'summary' => [
                    'total_sesi' => $totalSesiHariIni,
                    'hadir' => $totalHadir,
                    'sakit' => $totalSakit,
                    'izin'  => $totalIzin,
                    'alpha' => $totalAlpha
                ],
                'data' => $rekapTabel
            ], 200);

        } catch (\Exception $e) {
            Log::error('Presensi Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Menampilkan daftar sesi/pertemuan berdasarkan id_kelas_mk (Mata Kuliah di Kelas Tertentu)
     * URL: GET /api/web/presensi/kelas-mk/{id_kelas_mk}/sesi
     */
    public function getSesiByKelasMk(Request $request, $id_kelas_mk)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok1.url', 'https://api-admin-4c.rifkiaja.my.id:9002/api');

            // Tarik data detail kelas-mk dari Kelompok 1
            $responseKelasMk = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-mk');

            if (!$responseKelasMk->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal mengambil data akademik pusat.'], 502);
            }

            $allData = collect($responseKelasMk->json()['data'] ?? []);

            // Cari mata kuliah spesifik berdasarkan id_kelas_mk
            $detailJadwal = $allData->firstWhere('id_kelas_mk', $id_kelas_mk);

            if (!$detailJadwal) {
                return response()->json(['success' => false, 'message' => 'Sesi mata kuliah tidak ditemukan.'], 404);
            }

            // Karena data sesi/pertemuan harian biasanya idealnya berulang (contoh 16 pertemuan), 
            // jika API luar hanya memberikan satu tema induk, kita buatkan loop representasi pertemuannya di sini.
            // Namun, jika API luar punya array "pertemuan/log", silakan disesuaikan.

            $namaMk = $detailJadwal['kurikulum_mk']['mata_kuliah']['nama_mk'] ?? 'Mata Kuliah';
            $namaKelas = $detailJadwal['kelas']['kelas_nama'] ?? 'Kelas';

            // Contoh simulasi daftar sesi berdasarkan data tema kelompok 1
            $daftarSesi = [
                [
                    'pertemuan_ke' => 1,
                    'tema' => $detailJadwal['tema'] ?? 'Pengenalan Kontrak Kuliah',
                    'deskripsi' => $detailJadwal['deskripsi'] ?? '-',
                    'waktu_selesai' => 'Selesai: ' . date('d M Y') . ' ' . substr($detailJadwal['waktu_akhir'], 0, 5),
                    'status' => 'Selesai'
                ],
                [
                    'pertemuan_ke' => 2,
                    'tema' => 'Pembahasan Teori Dasar & Implementasi',
                    'deskripsi' => 'Materi lanjutan bab 2',
                    'waktu_selesai' => 'Jadwal: ' . date('d M Y', strtotime('+7 days')) . ' ' . substr($detailJadwal['waktu_mulai'], 0, 5),
                    'status' => 'Belum Selesai'
                ]
            ];

            return response()->json([
                'success' => true,
                'nama_kelas' => $namaKelas,
                'nama_matakuliah' => $namaMk,
                'data' => $daftarSesi
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Menampilkan Rekap Persentase Kehadiran Mahasiswa per Mata Kuliah (Kelas Terpilih)
     * URL: GET /api/web/presensi/kelas-mk/{id_kelas_mk}/mahasiswa
     */
    public function getRekapMahasiswaByKelasMk(Request $request, $id_kelas_mk)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok1.url', 'https://api-admin-4c.rifkiaja.my.id:9002/api');

            // 1. Ambil seluruh data log presensi dari Kelompok 1
            $responsePresensi = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/presensi-mahasiswa');
            $responseKelasMk  = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-mk');

            if (!$responsePresensi->successful() || !$responseKelasMk->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal mengambil data dari Service Akademik.'], 502);
            }

            $allPresensi = collect($responsePresensi->json()['data'] ?? []);
            $allKelasMk  = collect($responseKelasMk->json()['data'] ?? []);

            // 2. Filter log presensi yang hanya berelasi dengan id_kelas_mk ini
            $filteredPresensi = $allPresensi->where('kelas_mk_id', $id_kelas_mk); // sesuaikan key log jika 'id_kelas_mk' atau 'kelas_mk_id'

            // Cari info Mata Kuliah & Kelas untuk komponen Header UI
            $detailKelasMk = $allKelasMk->firstWhere('id_kelas_mk', $id_kelas_mk);
            $namaMk = $detailKelasMk['kurikulum_mk']['mata_kuliah']['nama_mk'] ?? 'Mata Kuliah';
            $namaKelas = $detailKelasMk['kelas']['kelas_nama'] ?? 'Kelas';

            // Hitung total pertemuan/sesi yang sudah berjalan untuk matakuliah ini
            // Jika di log belum ada presensi sama sekali, kita set default total pertemuan = 1 (mencegah division by zero)
            $totalPertemuan = $filteredPresensi->unique('jadwal_id')->count() ?: 1; 

            // 3. Ambil data seluruh mahasiswa dari database lokal kamu yang berada di prodi tersebut
            // atau sesuaikan dengan relasi kelas lokal kamu jika ada.
            $idProdiLokal = $detailKelasMk['kelas']['id_prodi'] ?? null;
            $mahasiswaLokal = Mahasiswa::where('id_prodi', $idProdiLokal)->get();

            // 4. Proses Grouping & Perhitungan Persentase Kehadiran
            $rekapMahasiswa = $mahasiswaLokal->map(function($mhs) use ($filteredPresensi, $totalPertemuan) {
                // Filter log absensi khusus untuk mahasiswa ini saja (berdasarkan NIM)
                $logMhs = $filteredPresensi->where('nim', $mhs->nim);

                $hadir = $logMhs->where('status_kehadiran', 'Hadir')->count();
                $sakit = $logMhs->where('status_kehadiran', 'Sakit')->count();
                $izin  = $logMhs->where('status_kehadiran', 'Izin')->count();
                $alpha = $logMhs->where('status_kehadiran', 'Alpha')->count();

                // Rumus Matematika Persentase Kehadiran
                $persentase = round(($hadir / $totalPertemuan) * 100);

                return [
                    'nim' => $mhs->nim,
                    'nama' => $mhs->nama,
                    'hadir' => $hadir,
                    'sakit' => $sakit,
                    'izin' => $izin,
                    'alpha' => $alpha,
                    'persentase' => $persentase . '%'
                ];
            });

            // 5. Fitur Sorting Opsional di UI (Berdasarkan NIM atau Nama)
            $search = $request->query('search');
            if (!empty($search)) {
                $rekapMahasiswa = $rekapMahasiswa->filter(function($item) use ($search) {
                    return str_contains(strtolower($item['nama']), strtolower($search)) || 
                           str_contains($item['nim'], $search);
                });
            }

            return response()->json([
                'success' => true,
                'nama_kelas' => $namaKelas,
                'nama_matakuliah' => $namaMk,
                'total_pertemuan' => $totalPertemuan,
                'data' => $rekapMahasiswa->values()
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Menampilkan Detail Riwayat Kehadiran Per Sesi untuk SATU Mahasiswa Spesifik
     * URL: GET /api/web/presensi/kelas-mk/{id_kelas_mk}/mahasiswa/{nim}/detail
     */
    public function getDetailKehadiranMahasiswa(Request $request, $id_kelas_mk, $nim)
    {
        try {
            $token = $request->bearerToken();
            $urlAkademik = config('services.kelompok1.url', 'https://api-admin-4c.rifkiaja.my.id:9002/api');
            $urlPegawai  = config('services.kelompok2.url', 'https://api-pegawai-4c.akufarish.my.id:9001/api');
    
            // 1. Tarik seluruh data pendukung dari multi-service API
            $responsePresensi = Http::withToken($token)->timeout(5)->get($urlAkademik . '/akademik/presensi-mahasiswa');
            $responseKelasMk  = Http::withToken($token)->timeout(5)->get($urlAkademik . '/akademik/kelas-mk');
            $responseDosen    = Http::timeout(5)->get($urlPegawai . '/dosen');
    
            if (!$responsePresensi->successful() || !$responseKelasMk->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal mengambil data dari Service Akademik.'], 502);
            }
    
            $allPresensi = collect($responsePresensi->json()['data'] ?? []);
            $allKelasMk  = collect($responseKelasMk->json()['data'] ?? []);
            $listDosen   = collect($responseDosen->json()['data'] ?? $responseDosen->json() ?? []);
    
            // 2. Ambil detail Mata Kuliah, Kelas, dan NIP Dosen pengajar
            $detailKelasMk = $allKelasMk->firstWhere('id_kelas_mk', $id_kelas_mk);
            if (!$detailKelasMk) {
                return response()->json(['success' => false, 'message' => 'Sesi kelas mata kuliah tidak ditemukan.'], 404);
            }
    
            // Cari nama dosen pengajar dari API Pegawai
            $dosen = $listDosen->firstWhere('nip', $detailKelasMk['nip']);
            $namaDosen = $dosen['nama'] ?? $dosen['nama_dosen'] ?? 'Dosen Pengajar';
    
            $namaMk = $detailKelasMk['kurikulum_mk']['mata_kuliah']['nama_mk'] ?? 'Mata Kuliah';
            $namaKelas = $detailKelasMk['kelas']['kelas_nama'] ?? 'Kelas';
    
            // 3. Filter log presensi berdasarkan id_kelas_mk DAN NIM mahasiswa tersebut
            $logPresensiMahasiswa = $allPresensi->where('kelas_mk_id', $id_kelas_mk)->where('nim', $nim);
    
            // 4. Transformasikan data riwayat per pertemuan (Simulasi / mapping data log riwayat)
            // Karena data riwayat pertemuan idealnya berurutan, kita petakan log dari kelompok 1
            $hariArr = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu'];
            $namaHari = $hariArr[$detailKelasMk['id_hari']] ?? 'Hari';
    
            // Jika kelompok 1 menyimpan riwayat log absensi per pertemuan secara linear, kita map langsung:
            // Di sini kita buat fallback representasi pertemuan berurutan jika struktur datanya berupa array log pertemuan
            $riwayatSesi = $logPresensiMahasiswa->map(function($log, $index) use ($detailKelasMk, $namaHari) {
                return [
                    'pertemuan_ke' => $index + 1, // atau dari $log['pertemuan_ke'] jika ada di API Kelompok 1
                    'tanggal_waktu'=> date('d F Y', strtotime($log['created_at'] ?? now())) . ' | ' . substr($detailKelasMk['waktu_mulai'], 0, 5),
                    'materi'       => $detailKelasMk['tema'] ?? 'Pembahasan Materi Perkuliahan',
                    'status'       => $log['status_kehadiran'] ?? 'Alpha' // Hadir / Sakit / Izin / Alpha
                ];
            })->values();
    
            // Jika data kosong, berikan informasi struktur data kosong yang rapi
            return response()->json([
                'success' => true,
                'meta' => [
                    'nim' => $nim,
                    'mata_kuliah' => $namaMk,
                    'kelas' => $namaKelas,
                    'dosen' => $namaDosen
                ],
                'data' => $riwayatSesi
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}