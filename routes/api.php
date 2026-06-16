<?php

use App\Http\Controllers\Api\Mobile\MobileAdminDashboardController;
use App\Http\Controllers\Api\Web\PengaturanController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Web\AuthController;
use App\Http\Controllers\Api\Web\JenisKelaminController;
use App\Http\Controllers\Api\Web\StatusMahasiswaController;
use App\Http\Controllers\Api\Web\AdminDashboardController;
use App\Http\Controllers\Api\Web\AdminDataMahasiswaController;
use App\Http\Controllers\Api\Web\AdminPresensiController;
use App\Http\Controllers\Api\InterService\ApiJenisKelaminController;
use App\Http\Controllers\Api\InterService\ApiStatusMahasiswaController;
use App\Http\Controllers\Api\InterService\ApiMahasiswaController;

// Jalur Endpoint Autentikasi
Route::post('/auth/login', [AuthController::class,'login']);
Route::post('/auth/refresh', [AuthController::class,'refresh']);
Route::post('/auth/logout', [AuthController::class,'logout']);

// Jalur Endpoint Data
Route::middleware('check.central.auth')->group(function () {

    // Endpoint untuk Frontend
    Route::prefix('web')-> group(function () {
    
        // Jenis Kelamin
        Route::get('/jenis-kelamin', [JenisKelaminController::class, 'index']);
        Route::get('/jenis-kelamin/{id}', [JenisKelaminController::class, 'show']);

        // Status Mahasiswa
        Route::get('/status-mhs', [StatusMahasiswaController::class, 'index']);
        Route::get('/status-mhs/{id}', [StatusMahasiswaController::class, 'show']);

        // Mahasiswa
        Route::get('mahasiswa', [AdminDataMahasiswaController::class, 'Index']);
        Route::get('mahasiswa/search/{nama}', [AdminDataMahasiswaController::class,'searchByName']);
        Route::get('mahasiswa/status/{id_status_mhs}', [AdminDataMahasiswaController::class,'filterByStatus']);
        Route::get('mahasiswa/jenis-kelamin/{idjk}', [AdminDataMahasiswaController::class,'filterByJenisKelamin']);
        Route::get('mahasiswa/{nim}', [AdminDataMahasiswaController::class, 'Show']);
        Route::post('mahasiswa', [AdminDataMahasiswaController::class, 'Store']);
        Route::put('mahasiswa/{nim}', [AdminDataMahasiswaController::class, 'Update']);
        Route::delete('mahasiswa/{nim}', [AdminDataMahasiswaController::class, 'Destroy']);

        // Dashboard Admin
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'dashboardAdmin']);
        Route::get('/admin/data-mahasiswa', [AdminDataMahasiswaController::class, 'index']);
        Route::get('/admin/presensi', [AdminDashboardController::class, 'dataMahasiswa']);
        Route::get('/admin/krs', [AdminDashboardController::class, 'dataMahasiswa']);
        Route::get('/admin/khs', [AdminDashboardController::class, 'dataMahasiswa']);
        Route::get('/admin/jadwal-kuliah', [AdminDashboardController::class, 'dataMahasiswa']);

        // Dashboard Mahasiswa

        // Pengaturan
        Route::get('/pengaturan', [PengaturanController::class,'updateProfil']);
    });

    // Endpoint untuk Mobile
    Route::prefix('mobile')->group(function () {

        // Dashboard Admin
        Route::get('/admin/dashboard', [MobileAdminDashboardController::class,'dashboardAdmin']);
    });

    // Endpoint untuk Service lain
    Route::prefix('service')->group(function () {

        Route::get('/jenis-kelamin', [ApiJenisKelaminController::class,'index']);
        Route::get('/jenis-kelamin/{id}', [ApiJenisKelaminController::class,'show']);

        Route::get('/status-mhs', [ApiStatusMahasiswaController::class,'index']);
        Route::get('/status-mhs/{id}', [ApiStatusMahasiswaController::class,'show']);

        Route::get('/mahasiswa', [ApiMahasiswaController::class, 'Index']);
        Route::get('/mahasiswa/search/{nama}', [ApiMahasiswaController::class,'searchByName']);
        Route::get('/mahasiswa/status/{id_status_mhs}', [ApiMahasiswaController::class,'filterByStatus']);
        Route::get('/mahasiswa/jenis-kelamin/{idjk}', [ApiMahasiswaController::class,'filterByJenisKelamin']);
        Route::get('/mahasiswa/{nim}', [ApiMahasiswaController::class, 'Show']);
        Route::post('/mahasiswa', [ApiMahasiswaController::class, 'Store']);
        Route::put('/mahasiswa/{nim}', [ApiMahasiswaController::class, 'Update']);
        Route::delete('/mahasiswa/{nim}', [ApiMahasiswaController::class, 'Destroy']);
        Route::get('/mahasiswa/{id_ukt_kategori}', []);

    });

});

