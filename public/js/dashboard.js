/**
 * =========================================================================================
 * SIMPADU - Front-End UI Dashboard (Independent & Bulletproof Service Fetching)
 * File: dashboard.js
 * =========================================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // Inisialisasi ikon jika library lucide tersedia
    if (typeof lucide !== 'undefined') {
        try { lucide.createIcons(); } catch(e) { console.error(e); }
    }

    // =========================================================
    // KONFIGURASI ENDPOINT & CREDENTIALS
    // =========================================================
    const BEARER_TOKEN = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    
    const API_LOKAL_SAYA        = "/api/web/admin/dashboard"; 
    const API_KELOMPOK_4        = "https://keuangan4c06.vps-poliban.my.id/api/ext/tagihan";
    const API_KELOMPOK_1_HARI   = "https://api-admin-4c.rifkiaja.my.id:9002/api/data-master/hari";
    const API_KELOMPOK_1_JADWAL = "https://api-admin-4c.rifkiaja.my.id:9002/api/akademik/kelas-mk";

    // =========================================================
    // TARGET SELECTOR ELEMENT - DISESUAIKAN DENGAN ID HTML ANDA
    // =========================================================
    const elTotalMhs    = document.getElementById("data-total-mahasiswa");
    const elMhsAktif    = document.getElementById("data-mahasiswa-aktif");
    const elTagihanUkt  = document.getElementById("data-tagihan-ukt");
    const elJadwalContainer = document.getElementById("container-jadwal");
    const elJadwalKosong    = document.getElementById("jadwal-kosong");

    // Helper untuk memasukkan teks ke UI secara aman
    function updateElementText(el, text) {
        if (el) {
            el.innerText = text;
        }
    }

    // =========================================================
    // 1. FETCH DATA INTERNAL (Total & Mahasiswa Aktif)
    // =========================================================
    async function loadInternalStats() {
        try {
            const response = await fetch(API_LOKAL_SAYA, {
                method: "GET",
                headers: { 
                    "Authorization": `Bearer ${BEARER_TOKEN}`, 
                    "Accept": "application/json" 
                }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            
            if (result && result.status === 'success' && result.data) {
                updateElementText(elTotalMhs, Number(result.data.total_mahasiswa || 0).toLocaleString('id-ID'));
                updateElementText(elMhsAktif, Number(result.data.mahasiswa_aktif || 0).toLocaleString('id-ID'));
            } else {
                updateElementText(elTotalMhs, "0");
                updateElementText(elMhsAktif, "0");
            }
        } catch (error) {
            console.error("Error pada Service Lokal (Dashboard):", error);
            updateElementText(elTotalMhs, "-");
            updateElementText(elMhsAktif, "-");
        }
    }

    // =========================================================
    // 2. FETCH DATA KELOMPOK 4 (Tagihan UKT)
    // =========================================================
    async function loadUktStats() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // Batasi maksimal 5 detik jika API down

            const response = await fetch(API_KELOMPOK_4, {
                method: "GET",
                headers: { 
                    "Authorization": `Bearer ${BEARER_TOKEN}`, 
                    "X-API-Key": "kel4apikey",
                    "Accept": "application/json" 
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            
            if (result && result.success && Array.isArray(result.data)) {
                let jumlahBelumBayar = 0;
                result.data.forEach(item => {
                    if (item.status_tagihan && item.status_tagihan.NAMA_STATUS_TAGIHAN === 'Belum Bayar') {
                        jumlahBelumBayar++;
                    }
                });
                updateElementText(elTagihanUkt, jumlahBelumBayar);
            } else {
                updateElementText(elTagihanUkt, "0");
            }
        } catch (error) {
            console.error("API Kelompok 4 (Keuangan) bermasalah/down:", error);
            updateElementText(elTagihanUkt, "N/A"); // Fallback jika service mati
        }
    }

    // =========================================================
    // 3. FETCH DATA KELOMPOK 1 (Jadwal Kuliah Hari Ini)
    // =========================================================
    async function loadJadwalHariIni() {
        if (!elJadwalContainer) return;
        
        try {
            // Tampilkan loading state dan pastikan status jadwal kosong disembunyikan
            elJadwalContainer.innerHTML = `<div class="text-slate-400 p-4 text-center">Memuat jadwal hari ini...</div>`;
            if (elJadwalKosong) elJadwalKosong.classList.add("hidden");

            // A. Dapatkan ID Hari dari Master Hari Kelompok 1
            let idHariIni = null;
            const namaHariIni = getNamaHariIndonesiaSistem();

            try {
                const resHari = await fetch(API_KELOMPOK_1_HARI, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${BEARER_TOKEN}`, "Accept": "application/json" }
                });
                if (resHari.ok) {
                    const dataHariJson = await resHari.json();
                    if (dataHariJson.success && Array.isArray(dataHariJson.data)) {
                        const cocok = dataHariJson.data.find(h => h.nama_hari.toLowerCase() === namaHariIni.toLowerCase());
                        if (cocok) idHariIni = cocok.id_hari;
                    }
                }
            } catch (e) {
                console.warn("Gagal mengambil master hari Kelompok 1, menggunakan fallback lokal.", e);
            }

            // Fallback ID Hari manual jika API master hari bermasalah
            if (!idHariIni) {
                const mappingManual = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, "Jumat": 5, "Jum'at": 5, 'Sabtu': 6, 'Minggu': 7 };
                idHariIni = mappingManual[namaHariIni] || 1;
            }

            // B. Ambil Jadwal Kelas-MK
            const resJadwal = await fetch(API_KELOMPOK_1_JADWAL, {
                method: "GET",
                headers: { "Authorization": `Bearer ${BEARER_TOKEN}`, "Accept": "application/json" }
            });
            
            if (!resJadwal.ok) throw new Error(`HTTP error! status: ${resJadwal.status}`);
            const dataJadwalJson = await resJadwal.json();

            if (dataJadwalJson.success && Array.isArray(dataJadwalJson.data)) {
                const jadwalHariIni = dataJadwalJson.data.filter(j => j.id_hari == idHariIni);
                renderJadwalCards(jadwalHariIni);
            } else {
                renderJadwalEmptyState();
            }
        } catch (error) {
            console.error("API Kelompok 1 (Akademik) bermasalah/down:", error);
            renderJadwalEmptyState();
        }
    }

    // =========================================================
    // HELPER RENDERING TEMPLATE JADWAL
    // =========================================================
    function renderJadwalCards(jadwalList) {
        if (!elJadwalContainer) return;
        
        if (jadwalList.length === 0) {
            renderJadwalEmptyState();
            return;
        }

        elJadwalContainer.innerHTML = "";
        if (elJadwalKosong) elJadwalKosong.classList.add("hidden");

        jadwalList.forEach(item => {
            const div = document.createElement("div");
            div.className = "bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow transition flex flex-col gap-2";
            
            const namaMatkul = item.kurikulum_mk && item.kurikulum_mk.mata_kuliah 
                ? item.kurikulum_mk.mata_kuliah.nama_mk 
                : "Mata Kuliah";
                
            const namaKelas  = item.kelas ? item.kelas.kelas_nama : "-";
            const jamMulai   = item.waktu_mulai ? item.waktu_mulai.substring(0, 5) : "00:00";
            const jamSelesai = item.waktu_akhir ? item.waktu_akhir.substring(0, 5) : "00:00";
            
            div.innerHTML = `
                <h4 class="text-slate-800 font-bold text-[15px] m-0">${namaMatkul}</h4>
                <div class="flex flex-col gap-1 text-[13px] text-slate-500">
                    <span class="flex items-center gap-1.5"><i data-lucide="users" class="w-3.5 h-3.5 text-slate-400"></i> Kelas ${namaKelas}</span>
                    <span class="flex items-center gap-1.5"><i data-lucide="clock" class="w-3.5 h-3.5 text-slate-400"></i> ${jamMulai} - ${jamSelesai} WITA</span>
                </div>
            `;
            elJadwalContainer.appendChild(div);
        });

        if (typeof lucide !== 'undefined') {
            try { lucide.createIcons(); } catch(e){}
        }
    }

    function renderJadwalEmptyState() {
        if (!elJadwalContainer) return;
        elJadwalContainer.innerHTML = ""; // Kosongkan loader teks
        
        if (elJadwalKosong) {
            elJadwalKosong.classList.remove("hidden"); // Munculkan elemen info kosong bawaan HTML
        }
        if (typeof lucide !== 'undefined') {
            try { lucide.createIcons(); } catch(e){}
        }
    }

    function getNamaHariIndonesiaSistem() {
        const hariEng = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const mapping = { 'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu', 'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu', 'Sunday': 'Minggu' };
        return mapping[hariEng] || 'Senin';
    }

    // =========================================================
    // EKSEKUSI PARALEL (TERISOLASI)
    // =========================================================
    loadInternalStats();
    loadUktStats();
    loadJadwalHariIni();
});