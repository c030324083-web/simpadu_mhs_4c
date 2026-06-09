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
            <a href="{{ route('dashboard_mahasiswa') }}">
                <i data-lucide="layout-dashboard"></i>
                <span>Dashboard</span>
            </a>
        </li>

        <li data-menu="jadwal">
            <a href="{{ route('jadwal_kuliah') }}">
                <i data-lucide="calendar"></i>
                <span>Jadwal Kuliah</span>
            </a>
        </li>

        <li data-menu="presensi">
            <a href="{{ route('presensi') }}">
                <i data-lucide="clipboard-list"></i>
                <span>Presensi</span>
            </a>
        </li>

        <li data-menu="penilaian">
            <a href="{{ route('penilaian') }}">
                <i data-lucide="award"></i>
                <span>Penilaian</span>
            </a>
        </li>

        <li data-menu="krs">
            <a href="{{ route('krs') }}">
                <i data-lucide="file-text"></i>
                <span>KRS</span>
            </a>
        </li>

        <li data-menu="khs">
            <a href="{{ route('khs') }}">
                <i data-lucide="file-text"></i>
                <span>KHS</span>
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