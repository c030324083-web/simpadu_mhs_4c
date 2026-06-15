<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminJadwalKuliahController extends Controller
{
    /**
     * Halaman 1: Daftar Kelas Utama Modul Jadwal Kuliah
     * URL: GET /api/web/jadwal-kuliah
     */
    public function index(Request $request)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url', 'https://api-admin-4c.rifkiaja.my.id:9002/api');

            // Ambil data master relasi kelas-mk dan master kelas
            $responseKelasMk = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-mk');
            $responseKelas = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-master');

            if (!$responseKelasMk->successful() || !$responseKelas->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal mengambil data jadwal dari pusat.'], 502);
            }

            $rawJadwal = collect($responseKelasMk->json()['data'] ?? []);
            $masterKelas = collect($responseKelas->json()['data'] ?? []);

            // Filtering prodi/kelas jika dipilih dari dropdown filter frontend
            if ($request->has('id_prodi') && !empty($request->query('id_prodi'))) {
                $idProdi = $request->query('id_prodi');
                $kelasSesuaiProdi = $masterKelas->where('prodi.id', $idProdi)->pluck('id')->toArray();
                $rawJadwal = $rawJadwal->whereIn('id_kelas', $kelasSesuaiProdi);
            }

            // Grouping data jadwal per kelas
            $rekapKelas = $rawJadwal->groupBy('id_kelas')->map(function ($items, $kelasId) use ($masterKelas) {
                $infoKelas = $masterKelas->firstWhere('id', $kelasId);
                return [
                    'id_kelas' => $kelasId,
                    'nama_kelas' => $infoKelas['kelas_nama'] ?? 'Kelas Tidak Diketahui',
                    'program_studi' => $infoKelas['prodi']['prodi_nama'] ?? '-',
                    'total_matakuliah' => $items->unique('id_kurikulum_mk')->count(),
                ];
            })->values();

            return response()->json([
                'success' => true,
                'data' => $rekapKelas
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Halaman 2: Detail Kalender Jadwal Mingguan Per Kelas (Target Sesuai image_3a8fc9.png)
     * URL: GET /api/web/jadwal-kuliah/kelas/{id_kelas}
     */
    public function getJadwalByKelas(Request $request, $id_kelas)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url', 'https://api-admin-4c.rifkiaja.my.id:9002/api');
            $urlPegawai = config('services.kelompok_2.url', 'https://api-pegawai-4c.akufarish.my.id:9001/api');

            // 1. Ambil data Kelas-MK, Master Hari, dan Data Pegawai (Dosen)
            $responseKelasMk = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-mk');
            $responseHari = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/data-master/hari');
            $responseDosen = Http::timeout(5)->get($urlPegawai . '/dosen');

            if (!$responseKelasMk->successful() || !$responseHari->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal sinkronisasi data jadwal akademik.'], 502);
            }

            $allJadwal = collect($responseKelasMk->json()['data'] ?? []);
            $allHari = collect($responseHari->json()['data'] ?? []);
            $listDosen = collect($responseDosen->json()['data'] ?? $responseDosen->json() ?? []);

            // 2. Filter data jadwal khusus kelas ini
            $jadwalKelas = $allJadwal->filter(function($item) use ($id_kelas) {
                return ($item['id_kelas'] == $id_kelas) || (($item['kelas']['id'] ?? null) == $id_kelas);
            });

            if ($jadwalKelas->isEmpty()) {
                return response()->json(['success' => false, 'message' => 'Jadwal untuk kelas ini belum diatur.'], 404);
            }

            $namaKelas = $jadwalKelas->first()['kelas']['nama_kelas'] ?? $jadwalKelas->first()['kelas']['kelas_nama'] ?? 'TI-4C';

            // 3. Ambil daftar master jam/slot waktu yang unik secara terurut (Sorted)
            $slotWaktu = $jadwalKelas->map(function($item) {
                $mulai = substr($item['waktu_mulai'] ?? '08:00:00', 0, 5);
                $selesai = substr($item['waktu_selesai'] ?? '09:40:00', 0, 5);
                return "${mulai} - ${selesai}";
            })->unique()->sort()->values();

            // 4. Bangun Matriks Jadwal Mingguan (Sesuai Struktur Tabel UI)
            $matriksJadwal = [];
            foreach ($slotWaktu as $jam) {
                // Inisialisasi baris berdasarkan slot jam
                $barisJadwal = [
                    'jam' => $jam,
                    'Senin' => null,
                    'Selasa' => null,
                    'Rabu' => null,
                    'Kamis' => null,
                    'Jumat' => null
                ];

                foreach (['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as $namaHari) {
                    // Cari ID Hari dari data master kelompok 1 berdasarkan nama hari
                    $hariMaster = $allHari->first(function($h) use ($namaHari) {
                        return strtolower($h['nama_hari'] ?? $h['hari'] ?? '') === strtolower($namaHari);
                    });
                    $idHari = $hariMaster['id'] ?? $hariMaster['id_hari'] ?? null;

                    // Fallback mapping manual jika ID Hari tidak ketemu dari service master
                    if (!$idHari) {
                        $mappingHariManual = ['Senin' => 1, 'Selasa' => 2, 'Rabu' => 3, 'Kamis' => 4, 'Jumat' => 5];
                        $idHari = $mappingHariManual[$namaHari];
                    }

                    // Cocokkan data jadwal yang sesuai dengan jam dan hari saat ini
                    $matchJadwal = $jadwalKelas->first(function($item) use ($jam, $idHari) {
                        $itemJam = substr($item['waktu_mulai'] ?? '', 0, 5) . ' - ' . substr($item['waktu_selesai'] ?? '', 0, 5);
                        return ($itemJam === $jam) && ($item['id_hari'] == $idHari);
                    });

                    if ($matchJadwal) {
                        $dosen = $listDosen->firstWhere('nip', $matchJadwal['nip']);
                        
                        $barisJadwal[$namaHari] = [
                            'kode_mk' => $matchJadwal['kurikulum_mk']['mata_kuliah']['kode_mk'] ?? '-',
                            'nama_mk' => $matchJadwal['kurikulum_mk']['mata_kuliah']['nama_mk'] ?? $matchJadwal['mata_kuliah']['nama_mk'] ?? '-',
                            'singkatan_mk' => $matchJadwal['kurikulum_mk']['mata_kuliah']['kode_mk'] ?? 'MK',
                            'ruang' => $matchJadwal['ruang']['nama_ruang'] ?? $matchJadwal['ruang']['kode_ruang'] ?? 'H-203',
                            'dosen' => $dosen['nama'] ?? 'Dosen Pengajar'
                        ];
                    }
                }
                $matriksJadwal[] = $barisJadwal;
            }

            return response()->json([
                'success' => true,
                'nama_kelas' => $namaKelas,
                'data' => $matriksJadwal
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
