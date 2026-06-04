<?php

namespace App\Http\Controllers\Auth;

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
        $response = Http::post('https://api-admin-4c.rifkiaja.my.id:9002/api/auth/login', [
            'email' => $request->email,
            'password' => $request->password
        ]);

        if (!$response->successful()) {
            return back()->withErrors([
                'login' => 'Login gagal. Pastikan email dan password benar.'
            ]);
        }
        
        $data = $response->json();

        session([
            'access_token' => $data['data']['access_token'],
            'user' => $data['data']['user'],
            'roles' => $data['data']['user']['roles'],
        ]);

        if ($data['data']['user']['roles'] === 'admin_mahasiswa') {
            return redirect()->route('dashboard_admin');
        }

        if ($data['data']['user']['roles'] === 'mahasiswa') {
            return redirect()->route('dashboard_mahasiswa');
        }
    }
}
