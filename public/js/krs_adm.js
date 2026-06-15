/**
 * SIMPADU - Kelompok 3 (Modul KRS)
 * Front-End UI Interactions
 * File: krs_adm.js
 * * =========================================================================================
 * [BE-NOTE]:
 * Script ini berfungsi penuh untuk "Single Page Application" (SPA) style pada Front-End dummy.
 * * Jika Anda berpindah ke Laravel Blade (Multi-page routing):
 * Fungsi switchView() ini bisa dihapus sepenuhnya. Transisi halaman (Kelas -> Mhs -> Detail) 
 * dapat di-*handle* dengan tag <a> standar atau <button> yang mengarah ke route/URL masing-masing.
 * * Untuk Dropdown Periode (periode-select-krs), gunakan fetch/AJAX untuk refresh tabel,
 * atau gunakan onchange="this.form.submit()" pada <select> jika diletakkan di dalam form GET.
 * =========================================================================================
 */

// Variabel Global untuk mengingat kelas yang diklik
let selectedKelas = 'TI-4C'; // Nilai default

document.addEventListener("DOMContentLoaded", () => {
    // 1. Render icon Lucide saat web pertama kali dimuat
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. TANGKAP EVENT DROPDOWN PERIODE DI VIEW DETAIL
    const periodeSelectKRS = document.getElementById('periode-select-krs');
    const loadingOverlayKRS = document.getElementById('loading-overlay-krs');
    const tableBodyMK = document.getElementById('krs-table-mk');
    const totalSKS = document.getElementById('krs-det-totalsks');

    if (periodeSelectKRS) {
        periodeSelectKRS.addEventListener('change', function() {
            const selectedPeriode = this.value; 

            // Tampilkan Overlay Loading
            if (loadingOverlayKRS) {
                loadingOverlayKRS.classList.remove('hidden');
                loadingOverlayKRS.classList.add('flex');
            }

            // SIMULASI PROSES FETCH DATA BACKEND (1 Detik)
            setTimeout(() => {
                // Menutup Overlay
                if (loadingOverlayKRS) {
                    loadingOverlayKRS.classList.add('hidden');
                    loadingOverlayKRS.classList.remove('flex');
                }

                // Efek visual pergantian data (Dummy Data Update)
                if (tableBodyMK && totalSKS) {
                    tableBodyMK.style.opacity = 0.5;
                    setTimeout(() => tableBodyMK.style.opacity = 1, 200);
                    
                    if (selectedPeriode.includes('2024')) {
                        totalSKS.innerText = "Total 20 SKS";
                    } else {
                        totalSKS.innerText = "Total 18 SKS";
                    }
                }
                
                console.log(`[Admin KRS] Data diperbarui untuk periode: ${selectedPeriode}`);
            }, 800); 
        });
    }
});

/**
 * Fungsi untuk berpindah antar view (SPA-style routing)
 * @param {string} target - 'kelas', 'mhs', atau 'detail'
 */
function switchView(target) {
    
    // 1. TANGKAP DATA KELAS SAAT BARIS DIKLIK
    // Logika ini membaca event klik secara langsung tanpa perlu mengubah tag HTML
    if (window.event) {
        const el = window.event.target;
        const row = el.closest('tr'); // Mencari elemen baris (TR) yang sedang diklik
        
        // Pastikan baris yang diklik berada di tabel Kelas dan memiliki kolom
        if (row && row.closest('#krs-table-kelas') && row.cells.length > 1) {
            // Ambil teks dari kolom ke-2 (indeks 1), yaitu kolom KELAS
            selectedKelas = row.cells[1].innerText.trim();
        }
    }

    // 2. LOGIKA MENYEMBUNYIKAN & MENAMPILKAN VIEW
    const views = ['view-kelas', 'view-mhs', 'view-detail'];
    
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('block');
        }
    });

    const targetEl = document.getElementById(`view-${target}`);
    if (targetEl) {
        targetEl.classList.remove('hidden');
        targetEl.classList.add('block');
    }

    // 3. MENGUBAH DINAMIS HEADER & TEKS CARD
    const pageTitle = document.getElementById("pageTitle");
    const welcomeText = document.getElementById("welcomeText");

    if (target === 'kelas') {
        if (pageTitle) pageTitle.innerText = "KRS";
        if (welcomeText) welcomeText.innerText = "Kartu Rencana Studi Mahasiswa";
    } 
    else if (target === 'mhs') {
        if (pageTitle) pageTitle.innerText = "KRS";
        if (welcomeText) welcomeText.innerText = "Kartu Rencana Studi Mahasiswa";
        
        // --- BAGIAN INI MENGUBAH JUDUL CARD BERDASARKAN KELAS ---
        const cardTitleMhs = document.getElementById('krs-mhs-title');
        if (cardTitleMhs) {
            cardTitleMhs.innerText = `Daftar KRS Mahasiswa ${selectedKelas}`;
        }
    } 
    else if (target === 'detail') {
        if (pageTitle) pageTitle.innerText = "KRS";
        if (welcomeText) welcomeText.innerText = "Detail KRS Mahasiswa";
    }

    // 4. Render ulang icon lucide di view yang baru dibuka
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}