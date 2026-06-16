<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\StatusMahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MobileAdminDashboardController extends Controller
{
    /**
     * Menampilkan data dashboard mobile
     * 
     * Digunakan oleh mobile untuk menampilkan dashboard admin
     */
    public function dashboardAdmin(Request $request)
    {
        try {
            // 1. Ambil Data Internal dari Database Lokal
            $totalMahasiswa = Mahasiswa::count();

            // Mengambil ID Status yang memiliki nama/kode 'Aktif'
            $statusAktif = StatusMahasiswa::where('NAMA_STATUS_MHS', 'Aktif')->first();
            
            $mahasiswaAktif = 0;
            if ($statusAktif) {
                $mahasiswaAktif = Mahasiswa::where('ID_STATUS_MHS', $statusAktif->id)->count();
            }

            // 2. Mengambil Token Bearer dari Request Frontend
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url');
            $urlKelompok4 = config('services.kelompok_4.url');

            // 3. Ambil Data Eksternal: Tagihan UKT (Kelompok 4) via HTTP Client
            $totalTagihan = 0;
            try {
                $responseUKT = Http::withToken($token)
                    ->withHeaders([
                        'X-API-Key'=> 'kel4apikey'
                    ])
                    ->timeout(5)
                    ->get($urlKelompok4 . '/ext/tagihan');

                if ($responseUKT->successful()) {
                    $dataUKT = $responseUKT->json();
                    if (isset($dataUKT['data']) && is_array($dataUKT['data'])) {
                        foreach ($dataUKT['data'] as $item) {
                            if (($item['status_tagihan'] ?? '') === 'Belum Bayar') {
                                $totalTagihan += (float) ($item['nominal'] ?? 0);
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::error('Gagal terhubung ke API Kelompok 4: ' . $e->getMessage());
            }

            // 4. Sinkronisasi Data Hari via API Kelompok 1 dan dapatkan ID Hari Terpusat
            $idHariIni = null;
            $namaHariIni = $this->getNamaHariIndonesiaSistem(); // Mendapatkan string hari ini ("Senin", "Selasa", dll)

            try {
                $responseMasterHari = Http::withToken($token)
                    ->timeout(5)
                    ->get($urlKelompok1 . '/data-master/hari');

                if ($responseMasterHari->successful()) {
                    $daftarHariPusat = collect($responseMasterHari->json()['data'] ?? []);
                    
                    // Mencari kecocokan nama hari sistem dengan data master hari milik Kelompok 1
                    $hariCocok = $daftarHariPusat->first(function($item) use ($namaHariIni) {
                        return strtolower($item['nama_hari'] ?? $item['hari'] ?? '') === strtolower($namaHariIni);
                    });

                    if ($hariCocok) {
                        $idHariIni = $hariCocok['id_hari'] ?? $hariCocok['id'] ?? null;
                    }
                }
            } catch (\Exception $e) {
                Log::error('Gagal mengambil data-master/hari Kelompok 1: ' . $e->getMessage());
            }

            // Fallback manual jika API Hari Kelompok 1 gagal merespon atau tidak cocok
            if (is_null($idHariIni)) {
                $mappingManual = ['Senin' => 1, 'Selasa' => 2, 'Rabu' => 3, 'Kamis' => 4, 'Jumat' => 5, 'Sabtu' => 6, 'Minggu' => 7];
                $idHariIni = $mappingManual[$namaHariIni] ?? 1;
            }

            // 5. Ambil Data Eksternal: Jadwal Perkuliahan Hari Ini (Kelompok 1) Berdasarkan ID Hari
            $jadwalHariIni = [];
            try {
                $responseJadwal = Http::withToken($token)
                    ->timeout(5)
                    ->get($urlKelompok1 . '/akademik/kelas-mk');

                if ($responseJadwal->successful()) {
                    $dataJadwal = $responseJadwal->json();
                    if (isset($dataJadwal['data']) && is_array($dataJadwal['data'])) {
                        
                        // Memfilter jadwal perkuliahan berdasarkan id_hari terpusat yang aktif hari ini
                        $jadwalHariIni = array_filter($dataJadwal['data'], function ($jadwal) use ($idHariIni) {
                            return ($jadwal['id_hari'] ?? null) == $idHariIni;
                        });
                        
                        // Reset index array setelah difilter
                        $jadwalHariIni = array_values($jadwalHariIni);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Gagal terhubung ke API akademik/kelas-mk Kelompok 1: ' . $e->getMessage());
            }

            // 6. Kembalikan Berupa Single Unified JSON Response
            return response()->json([
                'status' => 'success',
                'meta' => [
                    'hari_ini' => $namaHariIni,
                    'id_hari_aktif' => $idHariIni,
                    'timestamp' => now()->toIso8601String()
                ],
                'data' => [
                    'total_mahasiswa' => $totalMahasiswa,
                    'mahasiswa_aktif' => $mahasiswaAktif,
                    'total_tagihan_ukt' => $totalTagihan,
                    'jadwal_perkuliahan' => $jadwalHariIni
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Dashboard Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan pada server saat memuat data dashboard.'
            ], 500);
        }
    }

    /**
     * Helper internal untuk mendeteksi teks string hari lokal server
     */
    private function getNamaHariIndonesiaSistem()
    {
        $hari = date('D');
        $daftarHari = [
            'Sun' => 'Minggu',
            'Mon' => 'Senin',
            'Tue' => 'Selasa',
            'Wed' => 'Rabu',
            'Thu' => 'Kamis',
            'Fri' => 'Jumat',
            'Sat' => 'Sabtu'
        ];

        return $daftarHari[$hari] ?? 'Senin';

    }
}
