<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Mahasiswa\DashboardMhsController;

Route::get('/clear-cache-serve', function(){Artisan::call('optimize:clear');return 'Cache server berhasil dibersihkan!';});

#Auth
Route::get('/', [AuthController::class, 'page'])->name('login_page');
Route::post('/', [AuthController::class, 'login'])->name('login');

Route::middleware('check.login')->group(function () {

    #Dashboard Admin
    Route::get('/dashboard_admin', [DashboardController::class, 'dashboard'])->name('dashboard_admin');
    Route::get('/data_mahasiswa', [DashboardController::class, 'data_mahasiswa'])->name('data_mahasiswa');
    Route::get('/data_mahasiswa/{nim}', [DashboardController::class, 'detail_mahasiswa'])->name('detail_mahasiswa');
    Route::get('/presensi-admin', [DashboardController::class,'presensi'])->name('presensi-admin');
    Route::get('/krs-admin', [DashboardController::class,'krs'])->name('krs-admin');
    Route::get('/penilaian-admin', [DashboardController::class,'penilaian'])->name('penilaian-admin');
    Route::get('/khs-admin', [DashboardController::class,'khs'])->name('khs-admin');
    Route::get('/jadwal', [DashboardController::class,'jadwal'])->name('jadwal');
    
    #Dashboard Mahasiswa
    Route::get('/dashboard_mahasiswa', [DashboardMhsController::class,'dashboard'])->name('dashboard_mahasiswa');
    Route::get('/jadwal-kuliah', [DashboardMhsController::class,'jadwal'])->name('jadwal_kuliah');
    Route::get('/presensi', [DashboardMhsController::class,'presensi'])->name('presensi');
    Route::get('/penilaian', [DashboardMhsController::class,'penilaian'])->name('penilaian');
    Route::get('/khs', [DashboardMhsController::class,'khs'])->name('khs');
    Route::get('/krs', [DashboardMhsController::class,'krs'])->name('krs');
    
});
