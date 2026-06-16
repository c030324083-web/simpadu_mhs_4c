<?php

namespace App\Http\Controllers\Api\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * 1. Login
     * 
     * 
     */
    public function login(Request $request)
    {
        // Validasi input dari frontend Vanilla JS Anda
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Ambil URL default Kelompok 1 dari config/services.php
        $urlKelompok1 = config('services.kelompok_1.url');

        try {
            // Tembak API Kelompok 1 menggunakan POST dan kirim json body
            $response = Http::timeout(5)
                ->post($urlKelompok1 . '/auth/login', [
                    'email' => $request->email,
                    'password' => $request->password,
                ]);

            // Jika Kelompok 1 mengembalikan status sukses (200-299)
            if ($response->successful()) {
                return response()->json($response->json(), $response->status());
            }

            // Jika gagl (misal 401 Unauthorized dari Kelompok 1)
            return response()->json($response->json(), $response->status());

        } catch (\Exception $e) {
            Log::error('Auth Login - Gagal terhubung ke API Kelompok 1: ' . $e->getMessage());
            return response()->json([
                'message' => 'Layanan autentikasi pusat sedang tidak tersedia.'
            ], 503);
        }
    }

    /**
     * 2. Refresh Token
     * 
     */
    public function refresh(Request $request)
    {
        // Validasi body request dari frontend Anda
        $request->validate([
            'refresh_token' => 'required|string',
        ]);

        $urlKelompok1 = config('services.kelompok_1.url');

        try {
            // Tembak API Kelompok 1 untuk me-refresh token
            $response = Http::timeout(5)
                ->post($urlKelompok1 . '/auth/refresh', [
                    'refresh_token' => $request->refresh_token,
                ]);

            return response()->json($response->json(), $response->status());

        } catch (\Exception $e) {
            Log::error('Auth Refresh - Gagal terhubung ke API Kelompok 1: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal memperbarui token, layanan pusat bermasalah.'
            ], 503);
        }
    }

    /**
     * 3. Logout
     * 
     * 
     */
    public function logout(Request $request)
    {
        // Ambil token Bearer yang dikirim oleh frontend Vanilla JS Anda saat ini
        $bearerToken = $request->bearerToken();

        if (!$bearerToken) {
            return response()->json(['message' => 'Token tidak ditemukan'], 401);
        }

        $urlKelompok1 = config('services.kelompok_1.url');

        try {
            // Kirim request logout ke Kelompok 1 dengan melampirkan token yang sama di Header
            $response = Http::timeout(5)
                ->withToken($bearerToken)
                ->post($urlKelompok1 . '/auth/logout');

            return response()->json($response->json(), $response->status());

        } catch (\Exception $e) {
            Log::error('Auth Logout - Gagal terhubung ke API Kelompok 1: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal logout dari server pusat.'
            ], 503);
        }
    }
}
