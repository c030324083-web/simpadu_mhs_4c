/**
 * SIMPADU - Controller Logika Presensi Mahasiswa
 * File: presensi_mhs.js
 */

document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) { lucide.createIcons(); }

    // =========================================================================
    // CONFIG DATA STATE
    // =========================================================================
    const dataJadwalMatkul = {
        isSesiBukaDariDosen: false, 
        sudahAbsenDatabase: false, 
        statusTerpilihDatabase: null 
    };

    let temporaryStatus = null;

    // Mapping DOM Elements
    const viewInputPresensi = document.getElementById("view-input-presensi");
    const viewBelumMulai = document.getElementById("view-belum-mulai");
    const btnSubmit = document.getElementById("btn-submit-presensi");
    const statusCards = document.querySelectorAll(".status-card");
    const modalSuccess = document.getElementById("modal-success");
    const btnModalClose = document.getElementById("btn-modal-close");

    // =========================================================================
    // SIMULASI API FETCH (INTEGRASI DENGAN KELOMPOK 1)
    // =========================================================================
    async function fetchStatusSesiDariAPI() {
        try {
            // [BE-NOTE]: Ganti URL di bawah dengan Endpoint Kelompok 1 yang asli
            // const response = await fetch('URL_API_KELOMPOK_1_DI_SINI');
            // const dataAPI = await response.json();
            
            // --- MOCKUP RESPONS API SEMENTARA ---
            // Ubah nilai ID_KELAS_MK menjadi undefined/null untuk mengetes "Sesi Belum Dimulai"
            const dataAPI = {
                "ID_KELAS_MK": 0,
                "PERTEMUAN_KE": 1,
                "duration_minutes": 1
            };
            // ------------------------------------

            // Evaluasi: Jika ada properti ID_KELAS_MK, berarti sesi dibuka/digenerate
            if (dataAPI && dataAPI.ID_KELAS_MK !== undefined) {
                dataJadwalMatkul.isSesiBukaDariDosen = true;
                console.log("Sesi DIBUKA. Durasi:", dataAPI.duration_minutes, "menit.");
            } else {
                dataJadwalMatkul.isSesiBukaDariDosen = false;
                console.log("Sesi BELUM DIBUKA.");
            }

        } catch (error) {
            console.error("Gagal mengecek status sesi:", error);
            dataJadwalMatkul.isSesiBukaDariDosen = false;
        }

        // Panggil render UI setelah mengevaluasi data dari API
        cekStatusSesiHalaman();
    }

    // =========================================================================
    // LOGIKA RENDER UI UTAMA
    // =========================================================================
    function cekStatusSesiHalaman() {
        if (dataJadwalMatkul.sudahAbsenDatabase) {
            // Jika sudah absen: Tampilkan form (read-only)
            tampilkanFormInputUtama();
            kunciFormPresensiSelesai(dataJadwalMatkul.statusTerpilihDatabase);
        } else {
            // Jika belum absen: Cek evaluasi dari API
            if (dataJadwalMatkul.isSesiBukaDariDosen) {
                // API menyatakan Sesi Buka -> Tampilkan Form Input
                tampilkanFormInputUtama();
            } else {
                // API menyatakan Sesi Tutup -> Tampilkan Blocker Ikon Jam
                viewInputPresensi.classList.add("hidden");
                viewBelumMulai.classList.remove("hidden");
            }
        }
    }

    function tampilkanFormInputUtama() {
        viewBelumMulai.classList.add("hidden");
        viewInputPresensi.classList.remove("hidden");
        btnSubmit.disabled = true; // Submit mati sebelum status dipilih
    }

    // =========================================================================
    // EVENT LISTENERS INTERAKSI KARTU
    // =========================================================================
    statusCards.forEach(card => {
        card.addEventListener("click", () => {
            if (dataJadwalMatkul.sudahAbsenDatabase) return;

            // Bersihkan seleksi kartu lain
            statusCards.forEach(c => {
                c.classList.remove("border-blue-500", "bg-blue-50/30", "ring-2", "ring-blue-100");
                c.classList.add("border-gray-200");
            });

            // Terapkan seleksi pada kartu yang diklik
            card.classList.remove("border-gray-200");
            card.classList.add("border-blue-500", "bg-blue-50/30", "ring-2", "ring-blue-100");

            temporaryStatus = card.getAttribute("data-status");
            btnSubmit.disabled = false;
        });
    });

    // =========================================================================
    // EVENT LISTENER SUBMIT & MODAL
    // =========================================================================
    btnSubmit.addEventListener("click", () => {
        if (!temporaryStatus || dataJadwalMatkul.sudahAbsenDatabase) return;

        const waktuSekarangString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB";

        document.getElementById("modal-status-badge").textContent = temporaryStatus;
        document.getElementById("modal-timestamp").textContent = waktuSekarangString;

        const badge = document.getElementById("modal-status-badge");
        if (temporaryStatus === "Hadir") badge.className = "bg-green-100 text-green-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]";
        if (temporaryStatus === "Izin") badge.className = "bg-orange-100 text-orange-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]";
        if (temporaryStatus === "Sakit") badge.className = "bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]";
        if (temporaryStatus === "Alfa") badge.className = "bg-red-100 text-red-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]";

        modalSuccess.classList.remove("hidden");

        // Simpan state
        dataJadwalMatkul.sudahAbsenDatabase = true;
        dataJadwalMatkul.statusTerpilihDatabase = temporaryStatus;
    });

    btnModalClose.addEventListener("click", () => {
        modalSuccess.classList.add("hidden");
        kunciFormPresensiSelesai(dataJadwalMatkul.statusTerpilihDatabase);
    });

    function kunciFormPresensiSelesai(statusText) {
        statusCards.forEach(card => {
            if (card.getAttribute("data-status") === statusText) {
                card.classList.add("border-blue-500", "bg-blue-50/30", "ring-2", "ring-blue-100");
                card.classList.remove("border-gray-200", "opacity-60");
            } else {
                card.classList.remove("border-blue-500", "bg-blue-50/30", "ring-2", "ring-blue-100");
                card.classList.add("border-gray-100", "opacity-50");
                card.style.cursor = "default";
            }
        });

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> Presensi Sudah Terisi`;
        btnSubmit.className = "w-full bg-gray-200 text-gray-400 text-[14px] font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 border-none cursor-not-allowed shadow-none";

        if (window.lucide) { lucide.createIcons(); }
    }

    // =========================================================================
    // INIT PADA SAAT LOAD HALAMAN
    // =========================================================================
    // Mulai alur halaman dengan memanggil API (Simulasi)
    fetchStatusSesiDariAPI();
});