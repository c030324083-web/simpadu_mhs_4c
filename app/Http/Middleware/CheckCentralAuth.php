<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class CheckCentralAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated. Token tidak ditemukan.'], 401);
        }

        $urlKelompok1 = config('services.kelompok_1.url');

        try {
            // Anggap Kelompok 1 punya endpoint GET /auth/me atau GET /user untuk cek profile token aktif
            // Jika tidak ada, Anda bisa menembak endpoint master apa saja milik kelompok 1 yang membutuhkan auth token
            $response = Http::timeout(3)
                ->withToken($token)
                ->get($urlKelompok1 . '/profile'); // Menggunakan endpoint master terdekat milik mereka

            if (!$response->successful()) {
                return response()->json(['message' => 'Token tidak valid atau kedaluwarsa di server pusat.'], 401);
            }

            // Jika token valid, izinkan request masuk ke controller Mahasiswa Anda
            return $next($request);

        } catch (\Exception $e) {
            // Jika API Kelompok 1 mati, sebagai fallback aman kita tolak atau izinkan (tergantung kebijakan tim Anda)
            return response()->json(['message' => 'Layanan verifikasi auth pusat sedang gangguan.'], 503);
        }
    }
}
