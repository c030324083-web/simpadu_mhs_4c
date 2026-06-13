<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    public function page()
    {
        return view("admin.login");
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $response = Http::post(
            'https://api-admin-4c.rifkiaja.my.id:9002/api/auth/login',
            [
                'email' => $request->email,
                'password' => $request->password,
            ]
        );

        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah'
            ], 401);
        }

        $data = $response->json();

        session([
            'access_token' => $data['data']['access_token'],
            'refresh_token' => $data['data']['refresh_token'],
            'user' => $data['data']['user'],
            'roles' => $data['data']['user']['roles'] ?? null,
        ]);

        $role = session('roles');
    }

    public function refreshToken()
    {
        $refreshToken = session('refresh_token');

        if (!$refreshToken) {
            return false;
        }

        $response = Http::post(
            'https://api-admin-4c.rifkiaja.my.id:9002/api/auth/refresh',
            [
                'refresh_token' => $refreshToken
            ]
        );

        if (!$response->successful()) {
            session()->flush();

            return false;
        }

        $data = $response->json();

        session([
            'access_token' => $data['data']['access_token'],
            'refresh_token' => $data['data']['refresh_token']
        ]);

        return true;
    }

    public function logout()
    {
        $token = session('access_token');

        if ($token) {
            Http::withToken($token)
                ->post('https://api-admin-4c.rifkiaja.my.id:9002/api/auth/logout');
        }

        session()->invalidate();
        session()->regenerateToken();
    }
}
