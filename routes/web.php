<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Mahasiswa\DashboardMhsController;

#Auth
Route::get('', [AuthController::class, 'page'])->name('page_login');
Route::post('/auth', [AuthController::class, 'login'])->name('login');


#Dashboard Admin
Route::get('/dashboard_admin', [DashboardController::class, 'index'])->name('dashboard_admin');
Route::get('/data_mahasiswa', [DashboardController::class, 'data_mahasiswa'])->name('data_mahasiswa');
Route::post('/data_mahasiswa/{nim}', [DashboardController::class, 'data_show'])->name('data_show');
Route::get('/presensi-admin', [DashboardController::class,'presensi'])->name('presensi-admin');
Route::get('/krs-admin', [DashboardController::class,'krs'])->name('krs-admin');
Route::get('/khs-admin', [DashboardController::class,'khs'])->name('khs-admin');
Route::get('/jadwal-admin', [DashboardController::class,'jadwal'])->name('jadwal-admin');

#Dashboard Mahasiswa
Route::get('/dashboard_mahasiswa', [DashboardMhsController::class,'index'])->name('dashboard_mahasiswa');