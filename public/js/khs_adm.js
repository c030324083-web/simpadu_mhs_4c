/**
 * =========================================================================================
 * SCRIPT LOGIKA KHS ADMIN - POLIBAN
 * =========================================================================================
 * [BE-NOTE]: 
 * File ini menangani transisi antar-tampilan SPA (Kelas -> Mahasiswa -> Detail)
 * serta meng-handle interaksi pada Dropdown Periode KHS di view Detail Admin.
 * * Jika Backend mengubah arsitektur ini ke routing konvensional Laravel (multi-page), 
 * seluruh fungsi view (switchView) di sini bisa dihapus, lalu ubah JS ini hanya fokus
 * pada pemanggilan Data Table / Filter Dropdown periode menggunakan Fetch API.
 * =========================================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inisialisasi awal ikon Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ==========================================
    // BAGIAN A: LOGIKA VIEW (SPA NAVIGATION)
    // ==========================================
    const viewKelas = document.getElementById('view-kelas');
    const viewMhs = document.getElementById('view-mhs');
    const viewDetail = document.getElementById('view-detail');

    // Fungsi transisi antar tampilan
    function switchView(target) {
        // Sembunyikan semua section
        const views = [viewKelas, viewMhs, viewDetail];
        views.forEach(v => {
            if(v) {
                v.classList.add('hidden');
                v.classList.remove('block');
            }
        });

        // Tampilkan section target
        const targetEl = document.getElementById(`view-${target}`);
        if(targetEl) {
            targetEl.classList.remove('hidden');
            targetEl.classList.add('block');
        }

        // Sinkronisasi teks Header Atas (Bawaan Header Template)
        const pageTitle = document.getElementById("pageTitle");
        const welcomeText = document.getElementById("welcomeText");

        if (pageTitle) pageTitle.innerText = "KHS";
        if (welcomeText) {
            if (target === 'kelas') welcomeText.innerText = "Kartu Hasil Studi Mahasiswa Per Kelas";
            if (target === 'mhs') welcomeText.innerText = "Kartu Hasil Studi Mahasiswa Per Mahasiswa";
            if (target === 'detail') welcomeText.innerText = "Detail KHS Mahasiswa";
        }

        // Render ulang ikon Lucide agar tidak pecah/hilang
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // EVENT LISTENERS UNTUK TOMBOL/BARIS
    const tbodyKelas = document.getElementById('js-tbody-kelas');
    if (tbodyKelas) {
        tbodyKelas.addEventListener('click', (e) => {
            const row = e.target.closest('.js-row-kelas');
            if (row) {
                const namaKelas = row.cells[1].innerText.trim();
                const mhsTitle = document.getElementById('mhs-title');
                if (mhsTitle) mhsTitle.innerText = `Daftar KHS Mahasiswa ${namaKelas}`;
                switchView('mhs');
            }
        });
    }

    const tbodyMhs = document.getElementById('js-tbody-mhs');
    if (tbodyMhs) {
        tbodyMhs.addEventListener('click', (e) => {
            const btn = e.target.closest('.js-btn-detail-mhs');
            if (btn) switchView('detail');
        });
    }

    const btnBackKelas = document.getElementById('js-btn-back-kelas');
    if (btnBackKelas) btnBackKelas.addEventListener('click', () => switchView('kelas'));

    const btnBackMhs = document.getElementById('js-btn-back-mhs');
    if (btnBackMhs) btnBackMhs.addEventListener('click', () => switchView('mhs'));


    // ==========================================
    // BAGIAN B: LOGIKA DROPDOWN PERIODE DETAIL
    // ==========================================
    const periodeSelectKHSAdm = document.getElementById('periode-select-khs-adm');
    const loadingOverlayKHSAdm = document.getElementById('loading-overlay-khs-adm');
    const tableBodyMK = document.getElementById('khs-table-mk');
    
    // Elemen Kalkulasi KHS
    const totalSKS = document.getElementById('khs-det-totalsks');
    const totalIPS = document.getElementById('khs-det-totalips');
    const totalIPK = document.getElementById('khs-det-totalipk');

    if (periodeSelectKHSAdm) {
        periodeSelectKHSAdm.addEventListener('change', function() {
            const selectedPeriode = this.value; 

            // Tampilkan Loading
            if (loadingOverlayKHSAdm) {
                loadingOverlayKHSAdm.classList.remove('hidden');
                loadingOverlayKHSAdm.classList.add('flex');
            }

            // SIMULASI PROSES AJAX / FETCH DATA (1 Detik)
            setTimeout(() => {
                // Sembunyikan Loading
                if (loadingOverlayKHSAdm) {
                    loadingOverlayKHSAdm.classList.add('hidden');
                    loadingOverlayKHSAdm.classList.remove('flex');
                }

                // Efek pergantian data (Dummy)
                if (tableBodyMK && totalSKS && totalIPS) {
                    tableBodyMK.style.opacity = 0.5;
                    setTimeout(() => tableBodyMK.style.opacity = 1, 200);
                    
                    if (selectedPeriode.includes('2024')) {
                        totalSKS.innerText = "20";
                        totalIPS.innerText = "3.75";
                        totalIPK.innerText = "3.80";
                    } else {
                        totalSKS.innerText = "18";
                        totalIPS.innerText = "3.86";
                        totalIPK.innerText = "3.93";
                    }
                }
                
                console.log(`[Admin KHS] Data Detail KHS diperbarui untuk periode: ${selectedPeriode}`);
            }, 800); 
        });
    }
});