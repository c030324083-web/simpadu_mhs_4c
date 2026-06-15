/* =========================================================================================
   [BE-NOTE PENTING UNTUK TIM BACKEND]:
   File JS ini saat ini menggunakan pendekatan memanipulasi DOM (menyembunyikan & 
   memunculkan div) untuk mensimulasikan perpindahan halaman (Kelas -> Matkul -> Mhs -> Detail).
   
   OPSI UNTUK BE (Silakan sesuaikan dengan arsitektur kalian):
   1. Jika menggunakan Routing Laravel Biasa (Pindah URL tiap klik): 
      Kalian bisa MENGHAPUS fungsi switchView() ini dan mengubah Event Listener 
      di bagian bawah menjadi `window.location.href = '/route-tujuan'`.
   2. Jika ingin tetap 1 halaman tanpa reload (Livewire / AJAX):
      Kalian bisa mempertahankan struktur ini, dan menambahkan AJAX request (fetch) 
      di dalam Event Listener untuk memuat isi tabel secara dinamis.
   ========================================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi ikon Lucide jika tersedia
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* =======================================
       VARIABEL STATE (PENYIMPAN DATA DINAMIS)
       ======================================= */
    /* [BE-NOTE]: Variabel ini hanya untuk simulasi teks di Frontend. 
       Jika pakai Routing Laravel, data nama kelas bisa langsung dipassing dari Controller ke Blade. */
    let selectedKelas = '';
    let selectedMatkul = ''; // Untuk menyimpan nama matakuliah

    // Mendapatkan elemen pembungkus View
    const viewKelas = document.getElementById('js-view-kelas');
    const viewMatkul = document.getElementById('js-view-matkul');
    const viewMhs = document.getElementById('js-view-mhs');
    const viewDetail = document.getElementById('js-view-detail');

    // Fungsi utama untuk mengatur perpindahan tampilan
    function switchView(target) {
        // Sembunyikan semua view terlebih dahulu
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

        /* [BE-NOTE]: Logika pengubahan teks di bawah ini (innerText) bisa diabaikan/dihapus 
           jika kalian memecah 4 view ini menjadi 4 file .blade.php yang berbeda. 
           (Karena judul bisa diset langsung di file Blade-nya). */
           
        // Tampilkan view yang ditargetkan dan ubah teks dinamis
        if (target === 'kelas' && viewKelas) {
            viewKelas.classList.remove('hidden');
            viewKelas.classList.add('block');
            if (pageTitle) pageTitle.innerText = "Presensi";
            if (welcomeText) welcomeText.innerText = "Kelola Presensi/Kehadiran Mahasiswa";
        } 
        else if (target === 'matkul' && viewMatkul) {
            viewMatkul.classList.remove('hidden');
            viewMatkul.classList.add('block');
            if (pageTitle) pageTitle.innerText = "Presensi Mahasiswa";
            if (welcomeText) welcomeText.innerText = `Presensi Mahasiswa Per Matakuliah`;

            // MENGUBAH DINAMIS CARD HALAMAN 2 (DAFTAR MATAKULIAH)
            const matkulTitle = document.querySelector('#js-view-matkul h3');
            if (matkulTitle) {
                matkulTitle.innerText = `Daftar Matakuliah ${selectedKelas}`;
            }
        } 
        else if (target === 'mhs' && viewMhs) {
            viewMhs.classList.remove('hidden');
            viewMhs.classList.add('block');
            if (pageTitle) pageTitle.innerText = `Presensi Matakuliah ${selectedMatkul}`;
            
            // Ubah sub-judul header (opsional)
            if (welcomeText) welcomeText.innerText = "Kelola Presensi/Kehadiran Mahasiswa";

            // MENGUBAH DINAMIS CARD HALAMAN 3 (DAFTAR MAHASISWA)
            const mhsTitle = document.querySelector('#js-view-mhs h3');
            if (mhsTitle) {
                mhsTitle.innerText = `Daftar Presensi Mahasiswa ${selectedKelas}`;
            }
        } 
        else if (target === 'detail' && viewDetail) {
            viewDetail.classList.remove('hidden');
            viewDetail.classList.add('block');
            if (pageTitle) pageTitle.innerText = `Presensi Matakuliah ${selectedMatkul}`;
            if (welcomeText) welcomeText.innerText = "Detail Presensi Mahasiswa";
        }

        // Render ulang ikon yang mungkin baru muncul
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    /* =======================================
       EVENT LISTENERS (TOMBOL & BARIS TABEL)
       ======================================= */

    // Gunakan Event Delegation (Lebih aman jika data tabel dimuat secara dinamis)
    
    // 1. Klik Baris di Tabel Kelas -> Ke Matkul
    const tbodyKelas = document.getElementById('js-tbody-kelas');
    if (tbodyKelas) {
        tbodyKelas.addEventListener('click', function(e) {
            const row = e.target.closest('.js-row-kelas');
            if (row) {
                // Ambil teks dari kolom kedua tabel kelas (Indeks 1)
                selectedKelas = row.cells[1].innerText.trim();
                switchView('matkul');
            }
        });
    }

    // 2. Klik Baris di Tabel Matkul -> Ke Mhs
    const tbodyMatkul = document.getElementById('js-tbody-matkul');
    if (tbodyMatkul) {
        tbodyMatkul.addEventListener('click', function(e) {
            const row = e.target.closest('.js-row-matkul');
            if (row) {
                selectedMatkul = row.cells[1].innerText.trim();
                
                /* [BE-NOTE]: Simulasi klik baris matkul. Ganti dengan window.location.href jika perlu. */
                switchView('mhs');
            }
        });
    }

    // 3. Klik Tombol Eye (Mata) di Tabel Mhs -> Ke Detail
    const tbodyMhs = document.getElementById('js-tbody-mhs');
    if (tbodyMhs) {
        tbodyMhs.addEventListener('click', function(e) {
            if (e.target.closest('.js-btn-detail-mhs')) {
                /* [BE-NOTE]: Simulasi klik detail mahasiswa. Ganti dengan window.location.href jika perlu. */
                switchView('detail');
            }
        });
    }

    // 4. Logika Tombol Kembali (Back Buttons)
    /* [BE-NOTE]: Tombol ini bisa diganti menjadi tag <a> biasa di HTML dengan href route sebelumnya, 
       sehingga event listener ini bisa dihapus jika pakai routing Laravel. */
    const btnBackKelas = document.getElementById('js-btn-back-kelas');
    if(btnBackKelas) btnBackKelas.addEventListener('click', () => switchView('kelas'));

    const btnBackMatkul = document.getElementById('js-btn-back-matkul');
    if(btnBackMatkul) btnBackMatkul.addEventListener('click', () => switchView('matkul'));

    const btnBackMhs = document.getElementById('js-btn-back-mhs');
    if(btnBackMhs) btnBackMhs.addEventListener('click', () => switchView('mhs'));
});