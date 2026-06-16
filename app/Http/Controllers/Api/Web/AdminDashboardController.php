<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\StatusMahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends Controller
{
    /**
     * Menampilkan data statistik mahasiswa internal database lokal.
     * Endpoint: GET /api/web/admin/dashboard
     */
    public function dashboardAdmin(Request $request)
    {
        try {
            // 1. Ambil Data Internal dari Database Lokal
            $totalMahasiswa = Mahasiswa::count();

            // Mengambil ID Status yang memiliki nama/kode 'Aktif'
            $statusAktif = Mahasiswa::where('id_status_mhs', 1)->count();

            // 2. Kembalikan data internal saja secara cepat (Hapus semua proxy HTTP request luar)
            return response()->json([
                'status'  => 'success',
                'message' => 'Statistik internal berhasil dimuat.',
                'data'    => [
                    'total_mahasiswa' => $totalMahasiswa,
                    'mahasiswa_aktif' => $statusAktif
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Dashboard Internal Error: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan pada server saat memuat statistik internal.'
            ], 500);
        }
    }
}
