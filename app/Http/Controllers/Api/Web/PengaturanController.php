<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PengaturanController extends Controller
{
    /**
     * Update Informasi Profil User
     * URL: PUT/POST /api/web/pengaturan/profil
     */
    public function updateProfil(Request $request)
    {
        // 1. Validasi input form sesuai kebutuhan API pusat
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email'
        ]);

        try {
            $token = $request->bearerToken();
            $urlKelompok1 = config('services.kelompok_1.url', 'https://api-admin-4c.rifkiaja.my.id:9002/api');
            
            // Ambil ID user yang sedang login dari object request auth lokal
            $userLokal = $request->user(); 
            $idUser = $userLokal->id ?? 1; // Fallback jika integration manual, sesuaikan dengan id_user pusat

            // 2. Kirim data ke API Kelompok 1 sesuai payload JSON yang diminta
            $response = Http::withToken($token)
                ->timeout(5)
                ->put($urlKelompok1 . "/admin/users/{$idUser}", [
                    'name'      => $request->input('name'),
                    'email'     => $request->input('email'),
                    'is_active' => 'Y' // Default active sesuai kontrak API
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Gagal memperbarui data profil di server pusat.'
                ], $response->status());
            }

            // 3. Sinkronisasikan juga ke dalam database lokal jika Anda menyimpan replica data user/dosen
            if ($userLokal) {
                $userLokal->update([
                    'name'  => $request->input('name'),
                    'email' => $request->input('email'),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Informasi profil berhasil diperbarui.',
                'data'    => $response->json()['data'] ?? null
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
