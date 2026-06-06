<!-- SIDEBAR -->
<div class="sidebar">
    <div class="logo">
        <div class="logo-box">
            <img src="{{ asset('assets/img/logo_poliban.png') }}" alt="Logo Poliban">
        </div>
        <div class="brand-text">
            <h1>Poliban</h1>
            <p>SI Akademik</p>
        </div>
    </div>

    <ul class="menu">
        <li data-menu="dashboard">
            <a href="{{ route('dashboard_admin') }}">
                <i data-lucide="layout-dashboard"></i>
                <span>Dashboard</span>
            </a>
        </li>

        <li data-menu="mahasiswa">
            <a href="{{ route('data_mahasiswa') }}">
                <i data-lucide="graduation-cap"></i>
                <span>Data Mahasiswa</span>
            </a>
        </li>

        <li data-menu="presensi">
            <a href="{{ route('presensi-admin') }}">
                <i data-lucide="clipboard-list"></i>
                <span>Presensi</span>
            </a>
        </li>

        <li data-menu="penilaian">
            <a href="#">
                <i data-lucide="award"></i>
                <span>Penilaian</span>
            </a>
        </li>

        <li data-menu="krs">
            <a href="{{ route('krs-admin') }}">
                <i data-lucide="file-text"></i>
                <span>KRS</span>
            </a>
        </li>

        <li data-menu="khs">
            <a href="{{ route('khs-admin') }}">
                <i data-lucide="file-text"></i>
                <span>KHS</span>
            </a>
        </li>

        <li data-menu="jadwal">
            <a href="{{ route('jadwal-admin') }}">
                <i data-lucide="calendar"></i>
                <span>Jadwal Kuliah</span>
            </a>
        </li>

        <li data-menu="pengaturan">
            <a href="#">
                <i data-lucide="settings"></i>
                <span>Pengaturan</span>
            </a>
        </li>
    </ul>
    <ul class="bottom">

        <li data-menu="keluar">
            <a href="#">
                <i data-lucide="log-out"></i>
                <span>Keluar</span>
            </a>
        </li>
    </ul>
</div>