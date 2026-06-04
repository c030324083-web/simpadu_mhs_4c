<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\JenisKelaminController;
use App\Http\Controllers\StatusMahasiswaController;

Route::get('mahasiswa', [MahasiswaController::class, 'Index']);
Route::get('mahasiswa/{nim}', [MahasiswaController::class, 'Show']);
Route::post('mahasiswa', [MahasiswaController::class, 'Store']);
Route::put('mahasiswa/{nim}', [MahasiswaController::class, 'Update']);
Route::delete('mahasiswa/{nim}', [MahasiswaController::class, 'Destroy']);
Route::get('mahasiswa/search/{nama}', [MahasiswaController::class,'searchByName']);

Route::get('jenis-kelamin', [JenisKelaminController::class, 'index']);
Route::get('jenis-kelamin/{id}', [JenisKelaminController::class, 'show']);

Route::get('status-mhs', [StatusMahasiswaController::class, 'index']);
Route::get('status-mhs/{id}', [StatusMahasiswaController::class, 'show']);