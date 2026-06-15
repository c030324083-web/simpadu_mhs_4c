<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminKrsController extends Controller
{
    /**
     * Halaman 1: Daftar Kelas Utama Modul KRS
     * URL: GET /api/web/krs
     */
    public function index(Request $request)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url');

            $responseKrs = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/krs');
            $responseKelas = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-master');

            if (!$responseKrs->successful() || !$responseKelas->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal terhubung ke service akademik.'], 502);
            }

            $rawKrs = collect($responseKrs->json()['data'] ?? []);
            $masterKelas = collect($responseKelas->json()['data'] ?? []);

            // Filtering Prodi & Kelas (Dropdown UI)
            if ($request->has('id_prodi') && !empty($request->query('id_prodi'))) {
                $idProdi = $request->query('id_prodi');
                $kelasSesuaiProdi = $masterKelas->where('prodi.id', $idProdi)->pluck('id')->toArray();
                $rawKrs = $rawKrs->whereIn('kelas_id', $kelasSesuaiProdi);
            }

            if ($request->has('id_kelas') && !empty($request->query('id_kelas'))) {
                $rawKrs = $rawKrs->where('kelas_id', $request->query('id_kelas'));
            }

            // Grouping data berdasarkan kelas_id
            $rekapTabel = $rawKrs->groupBy('kelas_id')->map(function ($items, $kelasId) use ($masterKelas) {
                $infoKelas = $masterKelas->firstWhere('id', $kelasId);

                return [
                    'id_kelas' => $kelasId,
                    'nama_kelas' => $infoKelas['kelas_nama'] ?? 'Kelas Tidak Diketahui',
                    'program_studi' => $infoKelas['prodi']['prodi_nama'] ?? '-',
                    'total_mahasiswa' => $items->unique('nim')->count(),
                ];
            })->values();

            return response()->json([
                'success' => true,
                'data' => $rekapTabel
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Halaman 2: Daftar Mahasiswa di Kelas Terpilih (Menampilkan SKS & Status KRS)
     * URL: GET /api/web/krs/kelas/{id_kelas}/mahasiswa
     */
    public function getMahasiswaByKelas(Request $request, $id_kelas)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url');

            // Tarik data KRS dan Kelas Master
            $responseKrs = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/krs');
            $responseKelas = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-master');

            if (!$responseKrs->successful() || !$responseKelas->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal mengambil data dari Service Akademik.'], 502);
            }

            $allKrs = collect($responseKrs->json()['data'] ?? []);
            $allKelas = collect($responseKelas->json()['data'] ?? []);

            $infoKelas = $allKelas->firstWhere('id', $id_kelas);
            $idProdiLokal = $infoKelas['prodi']['id'] ?? null;

            // Filter KRS khusus untuk kelas ini
            $krsKelasIni = $allKrs->where('kelas_id', $id_kelas);

            // Ambil daftar mahasiswa dari database lokal yang sesuai dengan prodi kelas ini
            $mahasiswaLokal = Mahasiswa::where('id_prodi', $idProdiLokal)->get();

            $dataMahasiswa = $mahasiswaLokal->map(function($mhs) use ($krsKelasIni) {
                // Cari log KRS milik mahasiswa ini
                $krsMhs = $krsKelasIni->where('nim', $mhs->nim);
                
                // Hitung total SKS yang diambil dari seluruh matakuliah di KRS-nya
                $totalSks = $krsMhs->sum('kelas_mk.kurikulum_mk.mata_kuliah.sks') ?: 0; 
                
                // Ambil status KRS (Asumsi: Disetujui / Belum Disetujui dari field krs)
                $statusKrs = $krsMhs->first()['status_krs'] ?? 'Belum Diajukan';

                return [
                    'nim' => $mhs->nim,
                    'nama' => $mhs->nama,
                    'total_sks' => $totalSks . ' SKS',
                    'status' => $statusKrs // 'Disetujui', 'Pending', atau 'Belum Diajukan'
                ];
            });

            return response()->json([
                'success' => true,
                'nama_kelas' => $infoKelas['kelas_nama'] ?? 'Kelas',
                'data' => $dataMahasiswa->values()
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Halaman 3: Detail KRS Mahasiswa (Sesuai Gambar UI image_45575c.png)
     * URL: GET /api/web/krs/kelas/{id_kelas}/mahasiswa/{nim}/detail
     */
    public function getDetailKrsMahasiswa(Request $request, $id_kelas, $nim)
    {
        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url');
            $urlKelompok2 = config('services.kelompok_2.url', 'https://api-pegawai-4c.akufarish.my.id:9001/api');

            // Tarik data krs lengkap dan data dosen dari kelompok 2
            $responseKrs = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/krs');
            $responseKelas = Http::withToken($token)->timeout(5)->get($urlKelompok1 . '/akademik/kelas-master');
            $responseDosen = Http::timeout(5)->get($urlKelompok2 . '/dosen');

            if (!$responseKrs->successful()) {
                return response()->json(['success' => false, 'message' => 'Gagal mengambil detail KRS pusat.'], 502);
            }

            $allKrs = collect($responseKrs->json()['data'] ?? []);
            $allKelas = collect($responseKelas->json()['data'] ?? []);
            $listDosen = collect($responseDosen->json()['data'] ?? $responseDosen->json() ?? []);

            $infoKelas = $allKelas->firstWhere('id', $id_kelas);
            
            // Filter data krs khusus mahasiswa ini di kelas ini
            $krsMahasiswa = $allKrs->where('kelas_id', $id_kelas)->where('nim', $nim);

            // Olah daftar matakuliah yang diambil
            $totalSks = 0;
            $daftarMatakuliah = $krsMahasiswa->map(function($item) use (&$totalSks, $listDosen) {
                $kelasMk = $item['kelas_mk'] ?? [];
                $sks = intval($kelasMk['kurikulum_mk']['mata_kuliah']['sks'] ?? $kelasMk['mata_kuliah']['sks'] ?? 0);
                $totalSks += $sks;

                // Cari nama dosen berdasarkan NIP dari Kelompok 2
                $dosen = $listDosen->firstWhere('nip', $kelasMk['nip'] ?? null);
                $namaDosen = $dosen['nama'] ?? $dosen['nama_dosen'] ?? 'Dosen Pengajar';

                // Parsing Hari & Jam Kuliah harian
                $hariArr = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu'];
                $hariNama = $hariArr[$kelasMk['id_hari'] ?? null] ?? 'Senin';
                $jamMulai = substr($kelasMk['waktu_mulai'] ?? '08:00:00', 0, 5);
                $jamSelesai = substr($kelasMk['waktu_selesai'] ?? '10:00:00', 0, 5);

                return [
                    'kode_mk' => $kelasMk['kurikulum_mk']['mata_kuliah']['kode_mk'] ?? $kelasMk['mata_kuliah']['kode_mk'] ?? '-',
                    'nama_mk' => $kelasMk['kurikulum_mk']['mata_kuliah']['nama_mk'] ?? $kelasMk['mata_kuliah']['nama_mk'] ?? '-',
                    'sks' => $sks,
                    'jadwal' => "{$hariNama} \n {$jamMulai} - {$jamSelesai}",
                    'dosen' => $namaDosen
                ];
            })->values();

            // Cari info dosen pembimbing akademik (PA) dari database lokal atau fallback data dummy
            $mhsLokal = Mahasiswa::where('nim', $nim)->first();
            $namaDosenPA = $listDosen->firstWhere('nip', $mhsLokal->nip_dosen_pa ?? '')['nama'] ?? 'Herlinawati, S.Ag., M.Pd.';

            $statusKrs = $krsMahasiswa->first()['status_krs'] ?? 'Disetujui';

            return response()->json([
                'success' => true,
                'meta' => [
                    'nama' => $mhsLokal->nama ?? 'Nama Mahasiswa',
                    'nim' => $nim,
                    'program_studi' => $infoKelas['prodi']['prodi_nama'] ?? 'D3 Teknik Informatika',
                    'kelas' => $infoKelas['kelas_nama'] ?? '-',
                    'dosen_pembimbing' => $namaDosenPA,
                    'status_krs' => $statusKrs,
                    'periode' => '2025 Genap', // Sesuai pilihan dropdown pada mockup gambar
                    'total_sks_akumulasi' => "Total {$totalSks} SKS"
                ],
                'matakuliah' => $daftarMatakuliah
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
