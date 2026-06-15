/**
 * =========================================================================================
 * SCRIPT LOGIKA PENILAIAN ADMIN - POLIBAN
 * =========================================================================================
 * [BE-NOTE]: 
 * File ini menangani transisi antar-tampilan SPA (Kelas -> Matkul -> Mahasiswa -> Detail).
 * 
 * - Event listener menggunakan event delegation (klik ditangkap melalui `id` di <tbody>).
 * - Teks judul Header akan otomatis berubah menyesuaikan parameter class dan matakuliah.
 * 
 * Jika arsitektur diubah ke Routing Laravel normal (multi-page), maka logic switchView() 
 * bisa dihapus dan ganti tag `<tr>` dengan `<a>` href langsung dari file Blade.
 * =========================================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi ikon Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* =======================================
       VARIABEL STATE (PENYIMPAN DATA DINAMIS)
       ======================================= */
    let selectedKelas = '';
    let selectedMatkul = ''; 

    // Mendapatkan elemen pembungkus View
    const viewKelas = document.getElementById('js-view-kelas');
    const viewMatkul = document.getElementById('js-view-matkul');
    const viewMhs = document.getElementById('js-view-mhs');
    const viewDetail = document.getElementById('js-view-detail');

    // Fungsi utama transisi halaman (tanpa reload)
    function switchView(target) {
        const views = [viewKelas, viewMatkul, viewMhs, viewDetail];
        views.forEach(v => {
            if(v) {
                v.classList.add('hidden');
                v.classList.remove('block');
            }
        });

        // Ambil elemen header
        const pageTitle = document.getElementById("pageTitle");
        const welcomeText = document.getElementById("welcomeText");

        // Mengatur tampilan halaman & teks header secara dinamis
        if (target === 'kelas' && viewKelas) {
            viewKelas.classList.replace('hidden', 'block');
            if (pageTitle) pageTitle.innerText = "Penilaian Mahasiswa";
            if (welcomeText) welcomeText.innerText = "Penilaian Mahasiswa Per Kelas";
        } 
        else if (target === 'matkul' && viewMatkul) {
            viewMatkul.classList.replace('hidden', 'block');
            if (pageTitle) pageTitle.innerText = "Penilaian Mahasiswa";
            if (welcomeText) welcomeText.innerText = "Penilaian Mahasiswa Per Matakuliah";

            const cardMatkulTitle = document.querySelector('#js-view-matkul h3');
            if (cardMatkulTitle) {
                cardMatkulTitle.innerText = `Daftar Matakuliah ${selectedKelas}`;
            }
        } 
        else if (target === 'mhs' && viewMhs) {
            viewMhs.classList.replace('hidden', 'block');
            
            // 1. Mengubah Page Title -> Penilaian Mahasiswa (Nama Matkul)
            if (pageTitle) pageTitle.innerText = `Penilaian Mahasiswa ${selectedMatkul}`;
            
            // 2. Mengubah Greeting Sub-judul Halaman Ke-3
            if (welcomeText) welcomeText.innerText = `Kelola Nilai Mahasiswa Kelas ${selectedKelas}`;
            
            // 3. Mengubah Teks Card Tabel
            const cardTitle = document.getElementById('js-card-title-mhs') || document.querySelector('#js-view-mhs h3');
            if (cardTitle) {
                cardTitle.innerText = `Daftar Nilai Mahasiswa ${selectedKelas}`;
            }
        } 
        else if (target === 'detail' && viewDetail) {
            viewDetail.classList.replace('hidden', 'block');
            
            // 4. Mengubah Judul Besar Halaman Ke-4 -> Penilaian Mahasiswa (Nama Matkul)
            if (pageTitle) pageTitle.innerText = `Penilaian Mahasiswa ${selectedMatkul}`;
            if (welcomeText) welcomeText.innerText = "Detail Nilai Mahasiswa";
        }

        // Render ulang ikon agar tidak hilang setelah DOM berubah
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    /* =======================================
       EVENT LISTENERS (PENGGANTI ONCLICK HTML)
       ======================================= */

    // 1. Klik Baris Kelas -> Ke Daftar Matkul
    const tbodyKelas = document.getElementById('js-tbody-kelas');
    if (tbodyKelas) {
        tbodyKelas.addEventListener('click', function(e) {
            const row = e.target.closest('.js-row-kelas');
            if (row) {
                // Mengambil teks dari kolom KELAS (kolom ke-2 / indeks 1 pada row) otomatis
                selectedKelas = row.cells[1].innerText.trim(); 
                switchView('matkul');
            }
        });
    }

    // 2. Klik Baris Matkul -> Ke Daftar Mahasiswa
    const tbodyMatkul = document.getElementById('js-tbody-matkul');
    if (tbodyMatkul) {
        tbodyMatkul.addEventListener('click', function(e) {
            const row = e.target.closest('.js-row-matkul');
            if (row) {
                // Mengambil teks dari kolom MATAKULIAH otomatis
                selectedMatkul = row.cells[1].innerText.trim();
                switchView('mhs');
            }
        });
    }

    // 3. Klik Tombol Eye Mahasiswa -> Ke Detail Penilaian
    const tbodyMhs = document.getElementById('js-tbody-mhs');
    if (tbodyMhs) {
        tbodyMhs.addEventListener('click', function(e) {
            const btn = e.target.closest('.js-btn-detail-mhs');
            if (btn) {
                switchView('detail');
            }
        });
    }

    // 4. Navigasi Tombol Kembali (Back)
    const btnBackKelas = document.getElementById('js-btn-back-kelas');
    if(btnBackKelas) btnBackKelas.addEventListener('click', () => switchView('kelas'));

    const btnBackMatkul = document.getElementById('js-btn-back-matkul');
    if(btnBackMatkul) btnBackMatkul.addEventListener('click', () => switchView('matkul'));

    const btnBackMhs = document.getElementById('js-btn-back-mhs');
    if(btnBackMhs) btnBackMhs.addEventListener('click', () => switchView('mhs'));

    // =======================================
    // Trik Singkat: Paksa sinkronisasi teks judul saat halaman pertama kali diload.
    // Menunggu 150ms agar file header.js selesai memasukkan tag #pageTitle ke HTML.
    // =======================================
    setTimeout(() => {
        const pageTitle = document.getElementById("pageTitle");
        const welcomeText = document.getElementById("welcomeText");
        
        if (pageTitle && pageTitle.innerText.includes("Penilaian")) {
            pageTitle.innerText = "Penilaian Mahasiswa";
        }
        if (welcomeText) {
            welcomeText.innerText = "Penilaian Mahasiswa Per Kelas";
        }
    }, 150);
});