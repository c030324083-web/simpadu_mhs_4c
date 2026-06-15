<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AdminPenilaianController extends Controller
{
    /**
     * Menampilkan Rekapitulasi Penilaian Sesuai UI SIMPADU
     * URL: GET /api/web/penilaian
     */
    public function index(Request $request)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url');

            // 1. Tarik data penilaian dan kelas dari Kelompok 1
            // Asumsi Kelompok 1 menyediakan endpoint log nilai mahasiswa harian/per komponen
            $responsePenilaian = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/penilaian-mahasiswa');
            $responseKelas = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-mk');

            if (!$responsePenilaian->successful() || !$responseKelas->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal terhubung ke service akademik pusat.'], 502);
            }

            $rawPenilaian = collect($responsePenilaian->json()['data'] ?? []);
            $masterKelas = collect($responseKelas->json()['data'] ?? []);

            // 2. PROSES FILTERING BERDASARKAN PRODI & KELAS (Dari Dropdown UI)
            if ($request->has('id_prodi') && !empty($request->query('id_prodi'))) {
                $idProdi = $request->query('id_prodi');
                // Filter data kelas yang berada di bawah prodi tersebut
                $kelasSesuaiProdi = $masterKelas->where('kelas.prodi.id', $idProdi)->pluck('kelas.id')->toArray();
                $rawPenilaian = $rawPenilaian->whereIn('kelas_id', $kelasSesuaiProdi);
            }

            if ($request->has('id_kelas') && !empty($request->query('id_kelas'))) {
                $rawPenilaian = $rawPenilaian->where('kelas_id', $request->query('id_kelas'));
            }

            // 3. FORMAT DATA UNTUK TABEL & AGREGASI NILAI
            // Memetakan struktur data agar siap dibaca oleh tabel Vanilla JS
            $rekapTabel = $rawPenilaian->groupBy('kelas_id')->map(function ($items, $kelasId) use ($masterKelas) {
                $infoKelas = $masterKelas->firstWhere('kelas.id', $kelasId);

                // Opsional: Menghitung rata-rata nilai kelas jika dibutuhkan di tabel UI penilaimu
                $rataRataNilai = $items->avg('nilai_angka') ? round($items->avg('nilai_angka'), 2) : 0;
                $totalMahasiswaDinilai = $items->unique('nim')->count();

                return [
                    'id_kelas' => $kelasId,
                    'nama_kelas' => $infoKelas['kelas']['nama_kelas'] ?? 'Kelas Tidak Diketahui',
                    'program_studi' => $infoKelas['kelas']['prodi']['nama_prodi'] ?? '-',
                    'mata_kuliah' => $infoKelas['kurikulum_mk']['mata_kuliah']['nama_mk'] ?? $infoKelas['mata_kuliah']['nama_mk'] ?? '-',
                    'total_mahasiswa' => $totalMahasiswaDinilai, // Jumlah siswa yang sudah diinput nilainya
                    'rata_rata_kelas' => $rataRataNilai
                ];
            })->values();

            // 4. FITUR SORTING (Berdasarkan Nama Kelas / Matakuliah)
            $sortParam = $request->query('sort', 'kelas-asc');
            $sortParts = explode('-', $sortParam);
            $sortBy = $sortParts[0] == 'kelas' ? 'nama_kelas' : 'mata_kuliah';
            $sortDir = ($sortParts[1] ?? 'asc') == 'desc' ? true : false;

            $rekapTabel = $rekapTabel->sortBy($sortBy, SORT_REGULAR, $sortDir)->values();

            // 5. RESPONSE UNIFIED JSON (Tanpa Counter Summary Kehadiran)
            return response()->json([
                'success' => true,
                'data' => $rekapTabel
            ], 200);

        } catch (\Exception $e) {
            Log::error('Penilaian Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Menampilkan daftar mata kuliah berdasarkan kelas yang diklik pada modul Penilaian
     * URL: GET /api/web/penilaian/kelas/{id_kelas}/mata-kuliah
     */
    public function getMatakuliahByKelas(Request $request, $id_kelas)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url');
            $urlPegawai = config('services.kelompok_2.url', 'https://api-pegawai-4c.akufarish.my.id:9001/api');

            // Tarik data relasi Kelas-MK dan data Dosen
            $responseKelasMk = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-mk');
            $responseDosen = Http::timeout(5)->get($urlPegawai . '/dosen');

            if (!$responseKelasMk->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal mengambil data dari Service Akademik.'], 502);
            }

            $allData = collect($responseKelasMk->json()['data'] ?? []);
            $listDosen = collect($responseDosen->json()['data'] ?? $responseDosen->json() ?? []);

            // Filter jadwal berdasarkan id_kelas
            $filteredJadwal = $allData->filter(function($item) use ($id_kelas) {
                return ($item['id_kelas'] == $id_kelas) || (($item['kelas']['id'] ?? null) == $id_kelas);
            });

            $namaKelas = $filteredJadwal->first()['kelas']['nama_kelas'] ?? 'Kelas';

            $listMatakuliah = $filteredJadwal->map(function($item) use ($listDosen) {
                $dosen = $listDosen->firstWhere('nip', $item['nip']);
                return [
                    'id_kelas_mk' => $item['id_kelas_mk'] ?? $item['id'] ?? null,
                    'id_mk'       => $item['kurikulum_mk']['mata_kuliah']['id_mk'] ?? $item['mata_kuliah']['id'] ?? null,
                    'kode_mk'     => $item['kurikulum_mk']['mata_kuliah']['kode_mk'] ?? '-',
                    'nama_mk'     => $item['kurikulum_mk']['mata_kuliah']['nama_mk'] ?? $item['mata_kuliah']['nama_mk'] ?? '-',
                    'nama_dosen'  => $dosen['nama'] ?? $dosen['nama_dosen'] ?? 'Dosen Pengajar',
                ];
            })->values();

            return response()->json([
                'success' => true,
                'nama_kelas' => $namaKelas,
                'data' => $listMatakuliah
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Menampilkan daftar mahasiswa beserta nilai akhirnya di kelas-mk tertentu
     * URL: GET /api/web/penilaian/kelas-mk/{id_kelas_mk}/mahasiswa
     */
    public function getRekapMahasiswaByKelasMk(Request $request, $id_kelas_mk)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url');

            // Ambil data nilai dari Kelompok 1 dan master kelas-mk
            $responsePenilaian = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/penilaian-mahasiswa');
            $responseKelasMk = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-mk');

            if (!$responsePenilaian->successful() || !$responseKelasMk->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal sinkronisasi data nilai pusat.'], 502);
            }

            $allPenilaian = collect($responsePenilaian->json()['data'] ?? []);
            $allKelasMk = collect($responseKelasMk->json()['data'] ?? []);

            $detailKelasMk = $allKelasMk->firstWhere('id_kelas_mk', $id_kelas_mk) ?? $allKelasMk->firstWhere('id', $id_kelas_mk);
            $namaMk = $detailKelasMk['kurikulum_mk']['mata_kuliah']['nama_mk'] ?? $detailKelasMk['mata_kuliah']['nama_mk'] ?? 'Mata Kuliah';
            $namaKelas = $detailKelasMk['kelas']['nama_kelas'] ?? 'Kelas';

            // Filter nilai yang terikat dengan id_kelas_mk ini
            $filteredNilai = $allPenilaian->where('kelas_mk_id', $id_kelas_mk);

            // Tarik data siswa dari prodi terkait di DB Lokal untuk mapping nama lengkap
            $idProdiLokal = $detailKelasMk['kelas']['prodi']['id'] ?? null;
            $mahasiswaLokal = Mahasiswa::where('id_prodi', $idProdiLokal)->get();

            $rekapSiswa = $mahasiswaLokal->map(function($mhs) use ($filteredNilai) {
                $nilaiMhs = $filteredNilai->where('nim', $mhs->nim);

                // Kalkulasi Nilai Akhir (Misal rerata komponen Tugas, UTS, UAS)
                $nilaiAkhir = $nilaiMhs->avg('nilai_angka') ? round($nilaiMhs->avg('nilai_angka'), 1) : 0;

                // Konversi nilai huruf sederhana
                $grade = 'E';
                if ($nilaiAkhir >= 80) $grade = 'A';
                elseif ($nilaiAkhir >= 70) $grade = 'B';
                elseif ($nilaiAkhir >= 60) $grade = 'C';
                elseif ($nilaiAkhir >= 50) $grade = 'D';

                return [
                    'nim' => $mhs->nim,
                    'nama' => $mhs->nama,
                    'nilai_angka' => $nilaiAkhir,
                    'grade' => $grade
                ];
            });

            return response()->json([
                'success' => true,
                'nama_kelas' => $namaKelas,
                'nama_matakuliah' => $namaMk,
                'data' => $rekapSiswa->values()
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Menampilkan Detail Komponen Nilai, Pembobotan, dan Nilai Akhir Terkalkulasi untuk Satu Mahasiswa
     * URL: GET /api/web/penilaian/kelas-mk/{id_kelas_mk}/mahasiswa/{nim}/detail
     */
    public function getDetailPenilaianMahasiswa(Request $request, $id_kelas_mk, $nim)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url');
            $urlKelompok2 = config('services.kelompok_2.url', 'https://api-pegawai-4c.akufarish.my.id:9001/api');
    
            // 1. Ambil data master kelas-mk dari Kelompok 1 untuk mencari id_kelas dan id_mk
            $responseKelasMk = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-mk');
            if (!$responseKelasMk->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal mengambil data Kelas-MK dari pusat.'], 502);
            }
            
            $allKelasMk = collect($responseKelasMk->json()['data'] ?? []);
            $detailKelasMk = $allKelasMk->firstWhere('id_kelas_mk', $id_kelas_mk) ?? $allKelasMk->firstWhere('id', $id_kelas_mk);
            
            if (!$detailKelasMk) {
                return response()->json(['success' => false, 'message' => 'Data Kelas-MK tidak ditemukan.'], 404);
            }
    
            $idKelas = $detailKelasMk['id_kelas'] ?? $detailKelasMk['kelas']['id'] ?? null;
            $idMk = $detailKelasMk['kurikulum_mk']['mata_kuliah']['id_mk'] ?? $detailKelasMk['mata_kuliah']['id'] ?? null;
    
            // 2. Tarik Komponen & Bobot Penilaian dari API Kelompok 2 secara dinamis
            // URL Target: https://.../api/nilai/settings?id_kelas=X&id_mk=Y
            $responseSettings = Http::withToken($token)->timeout(5)
                ->get($urlKelompok2 . "/nilai/settings", [
                    'id_kelas' => $idKelas,
                    'id_mk' => $idMk
                ]);
    
            // 3. Tarik Log Nilai Mentah dan Nilai Akhir Resmi dari API Kelompok 1
            $responseNilaiMentah = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/penilaian-mahasiswa');
            $responseNilaiAkhir  = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/nilai');
    
            if (!$responseNilaiMentah->successful() || !$responseNilaiAkhir->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal sinkronisasi data nilai dari Kelompok 1.'], 502);
            }
    
            $allNilaiMentah = collect($responseNilaiMentah->json()['data'] ?? []);
            $allNilaiAkhir  = collect($responseNilaiAkhir->json()['data'] ?? []);
    
            // Filter log nilai mentah spesifik untuk mahasiswa (NIM) pada kelas-mk ini
            $logNilaiMhs = $allNilaiMentah->where('kelas_mk_id', $id_kelas_mk)->where('nim', $nim);
    
            // 4. PROSES PARSING & PEMBOBOTAN KOMPONEN (Rincian Nilai Kiri)
            // Ambil pengaturan komponen dari Kelompok 2, jika gagal/kosong gunakan fallback default standard
            $komponenSettings = $responseSettings->successful() ? ($responseSettings->json()['data'] ?? []) : [];
            
            if (empty($komponenSettings)) {
                // Fallback default sesuai visual mockup jika API Kelompok 2 belum diset atau kosong
                $komponenSettings = [
                    ['komponen' => 'Tugas', 'bobot' => 20],
                    ['komponen' => 'Aktivitas Partisipasi', 'bobot' => 20],
                    ['komponen' => 'UTS', 'bobot' => 20],
                    ['komponen' => 'UAS', 'bobot' => 40],
                ];
            }
    
            $rincianNilai = [];
            $totalNilaiAkhirKalkulasi = 0;
    
            foreach ($komponenSettings as $setting) {
                $namaKomponen = $setting['komponen'] ?? $setting['nama_komponen'] ?? 'Komponen';
                $bobot = intval($setting['bobot'] ?? $setting['persentase'] ?? 0);
    
                // Cari nilai mentah dari kelompok 1 yang jenis_penilaian-nya cocok dengan nama komponen ini
                $nilaiMentah = $logNilaiMhs->filter(function($item) use ($namaKomponen) {
                    return str_contains(strtolower($item['jenis_penilaian'] ?? $item['komponen'] ?? ''), strtolower($namaKomponen));
                })->avg('nilai_angka') ?? 0; // Jika ada beberapa log tugas, kita ambil rata-ratanya
    
                // Hitung kontribusi nilai berdasarkan bobot persen
                $nilaiAkhirKomponen = round(($nilaiMentah * $bobot) / 100, 1);
                $totalNilaiAkhirKalkulasi += $nilaiAkhirKomponen;
    
                $rincianNilai[] = [
                    'komponen' => $namaKomponen,
                    'bobot' => $bobot . '%',
                    'nilai_mentah' => round($nilaiMentah, 1),
                    'nilai_akhir_komponen' => $nilaiAkhirKomponen
                ];
            }
    
            // 5. PROSES PARSING BLOK PROYEK (Hasil Proyek Kanan)
            $logProyek = $logNilaiMhs->filter(function($item) {
                return str_contains(strtolower($item['jenis_penilaian'] ?? $item['komponen'] ?? ''), 'proyek');
            });
    
            $hasilProyek = [];
            foreach ($logProyek as $proyek) {
                $hasilProyek[] = [
                    'nama_proyek' => $proyek['keterangan'] ?? $proyek['tema'] ?? 'Sistem Informasi Akademik',
                    'nilai' => $proyek['nilai_angka'] ?? 0
                ];
            }
            // Fallback data jika belum ada entri proyek di log mentah akademik
            if (empty($hasilProyek)) {
                $hasilProyek[] = ['nama_proyek' => 'Belum Ada Proyek / Project Mandiri', 'nilai' => 0];
            }
    
            // 6. AMBIL OFFICIAL GRADE AKHIR (Box Bawah)
            // Cari dari data resmi endpoint /akademik/nilai milik kelompok 1
            $officialNilai = $allNilaiAkhir->where('kelas_mk_id', $id_kelas_mk)->firstWhere('nim', $nim);
            
            $totalNilaiAkhirReal = $officialNilai['nilai_angka'] ?? $officialNilai['total_nilai'] ?? $totalNilaiAkhirKalkulasi;
            $gradeHuruf = $officialNilai['nilai_huruf'] ?? $officialNilai['grade'] ?? null;
    
            // Fallback penentuan Grade Huruf Otomatis jika kelompok 1 belum melakukan finalisasi nilai resmi
            if (!$gradeHuruf) {
                if ($totalNilaiAkhirReal >= 80) $gradeHuruf = 'A';
                elseif ($totalNilaiAkhirReal >= 70) $gradeHuruf = 'B';
                elseif ($totalNilaiAkhirReal >= 60) $gradeHuruf = 'C';
                elseif ($totalNilaiAkhirReal >= 50) $gradeHuruf = 'D';
                else $gradeHuruf = 'E';
            }
    
            // 7. UNIFIED RESPONSE UNTUK FRONTEND SPA
            return response()->json([
                'success' => true,
                'meta' => [
                    'nim' => $nim,
                    'mata_kuliah' => $detailKelasMk['kurikulum_mk']['mata_kuliah']['nama_mk'] ?? $detailKelasMk['mata_kuliah']['nama_mk'] ?? '-',
                    'kelas' => $detailKelasMk['kelas']['nama_kelas'] ?? '-',
                    'program_studi' => $detailKelasMk['kelas']['prodi']['nama_prodi'] ?? 'D3 Teknik Informatika'
                ],
                'rincian_nilai' => $rincianNilai,
                'hasil_proyek' => $hasilProyek,
                'summary' => [
                    'total_nilai_akhir' => round($totalNilaiAkhirReal, 1),
                    'grade' => $gradeHuruf
                ]
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
