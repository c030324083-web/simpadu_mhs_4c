@extends('layouts.app')

@section('title', 'data_mahasiswa')

@section('sidebar')
@include('components.sidebar')
@endsection

@section('content')

@include('components.header', [
    'title' => 'Data Mahasiswa',
    'subtitle' => 'Kelola data mahasiswa dengan mudah'
])

    <div class="container">

        <div class="main flex-1 p-6 md:p-8 lg:p-10 w-full overflow-y-auto bg-[#f8fafc]">

            <div class="main">

                <div class="top-bar">

                    <button id="btn-add" onclick="openModal()">
                        <i data-lucide="plus"></i>
                        Tambah Mahasiswa
                    </button>

                    <div class="filters">
                        <select>
                            <option>Semua Program Studi</option>
                        </select>

                        <select>
                            <option>Semua Semester</option>
                        </select>
                    </div>

                </div>

            </div>

            <div class="table-box">

                <div class="table-header">
                    <h1>Daftar Mahasiswa</h1>
                </div>

                <div class="table-controls">

                    <div class="search-box">
                        <input type="text" placeholder="Cari NIM atau Nama Mahasiswa...">
                        <i data-lucide="search"></i>
                    </div>

                    <div class="sort-box">
                        <span>Sort by</span>
                        <select>
                            <option>NIM (A-Z)</option>
                        </select>
                    </div>

                    <div class="list-btn">
                        <i data-lucide="list"></i>
                    </div>

                </div>

                <table>
                    <thead>
                        <tr>
                            <th>NIM</th>
                            <th>Nama Mahasiswa</th>
                            <th>Program Studi</th>
                            <th>Semester</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        @foreach($mahasiswa as $mhs)
                        <tr>
                            <td>{{ $mhs->nim }}</td>
                            <td>{{ $mhs->nama }}</td>
                            <td>{{ $mhs->program_studi }}</td>
                            <td>{{ $mhs->semester }}</td>
                            <td>{{ $mhs->status }}</td>
                        </tr>
                        @endforeach
                    </tbody>

                </table>

            </div>

        </div>

    </div>

    <div class="modal" id="modalMahasiswa">
        <div class="modal-content">

            <h3>Tambah Mahasiswa</h3>

            <div class="form-grid">
                <div class="form-group">
                    <label>NIM <span style="color:red">*</span></label>
                    <input type="text" id="inputNim" placeholder="Masukkan NIM">
                </div>

                <div class="form-group">
                    <label>Nama Lengkap <span style="color:red">*</span></label>
                    <input type="text" id="inputNama" placeholder="Masukkan Nama Lengkap">
                </div>

                <div class="form-group">
                    <label>Email <span style="color:red">*</span></label>
                    <input type="email" id="inputEmail" placeholder="contoh@gmail.com">
                </div>

                <div class="form-group">
                    <label>No Hp <span style="color:red">*</span></label>
                    <input type="text" id="inputHp" placeholder="08xxxxxxxxxx">
                </div>

                <div class="form-group">
                    <label>Jenis Kelamin <span style="color:red">*</span></label>
                    <select id="inputJk">
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Jurusan <span style="color:red">*</span></label>
                    <select id="inputJurusan">
                        <option value="">Memuat data...</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Program Studi <span style="color:red">*</span></label>
                    <select id="inputProdi">
                        <option value="">Memuat data...</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Kelas <span style="color:red">*</span></label>
                    <select id="inputKelas">
                        <option value="">Memuat data...</option>
                    </select>
                </div>


                <div class="form-group">
                    <label>Tahun Akademik <span style="color:red">*</span></label>
                    <select id="inputTahun">
                        <option value="">Memuat data...</option>
                    </select>
                </div>

            <div class="modal-actions">
                <button class="btn-cancel" onclick="closeModal()">Batal</button>
                <button class="btn-save" id="btnSimpan">
                    <i data-lucide="file-text"></i>
                    Simpan
                </button>
            </div>
        </div>
    </div>

    @vite([
        'resources/css/data_mhs.css'
    ])

@endsection
