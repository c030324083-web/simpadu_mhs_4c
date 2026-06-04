@extends('layouts.app')

@section('title', 'dashboard_mhs')

@section('sidebar')
@include('components.sidebar_mhs')
@endsection

@section('content')

@include('components.header', [
    'title' => 'Dashboard Mahasiswa',
    'subtitle' => 'Selamat datang di dashboard mahasiswa'
])

<div class="container">
        <div class="main-content w-full min-h-screen p-8 text-gray-800">

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
                
                <div class="lg:col-span-7 xl:col-span-8 space-y-6">
                    
                    <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                        <h2 class="text-lg font-semibold text-gray-900 mb-6">Jadwal Mendatang</h2>
                        <div id="jadwalmatakuliahr" class="space-y-4">
                            </div>
                    </div>

                    <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                        <h2 class="text-lg font-semibold text-gray-900 mb-6">Pengumuman Terbaru</h2>
                        <div id="pengumuman" class="space-y-6">
                            </div>
                    </div>
                </div>

                <div class="lg:col-span-5 xl:col-span-4 space-y-6">
                    
                    <div id="totaltagihan" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center">
                        <div class="w-full text-left mb-4">
                        <h2 class="text-lg font-semibold text-gray-900">Total Tagihan</h2>
                    </div>
                </div>

                    <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                        <h2 class="text-lg font-semibold text-gray-900 mb-6">Kalender Akademik</h2>
                        </div>
                </div>
            </div>
        </div>
    </div>

@endsection
