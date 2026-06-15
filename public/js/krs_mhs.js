/**
 * =========================================================================================
 * SIMPADU - Kelompok 3 (Modul KRS Mahasiswa)
 * Front-End UI Interactions
 * File: js/krs_mhs.js
 * =========================================================================================
 * [BE-NOTE]:
 * - Filter periode KRS sekarang dikendalikan oleh 'global_filter_sort.js'.
 * - Tim BE cukup mengabaikan filter array ini dan menambahkan trigger/submit 
 *   di tag HTML <select id="periode-select-krs"> untuk merefresh data.
 * - Ubah nilai 'statusKRS' di bawah dengan data hasil lemparan Controller Blade
 *   ("belum", "menunggu", atau "disetujui") untuk mengubah Badge dan Tampilan Tabel.
 * =========================================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 1. DATA DUMMY & STATE MANAGEMENT
    // [BE-NOTE]: Nilai ini harus dinamis saat render awal oleh Backend
    let statusKRS = "belum"; 

    // Data Kelas Dummy (Memiliki properti 'periode' agar bisa disortir GlobalJS)
    const daftarKelasAwal = [
        { periode: "2025-genap", kode: "C0320401", nama: "Administrasi Database (4C)", hari: "Rabu", jam: "13:30 - 16:00", sks: 3, dosen: "Rahimi Fitri, S.Kom, M.Kom" },
        { periode: "2025-genap", kode: "C0320402", nama: "Keamanan Jaringan (4C)", hari: "Jumat", jam: "08:00 - 12:10", sks: 3, dosen: "Dr. Kun N. P. P, S. T., M.Kom." },
        { periode: "2025-genap", kode: "C0320403", nama: "Metode Numerik (4C)", hari: "Kamis", jam: "08:00 - 10:00", sks: 2, dosen: "Nitami L. P, S. Kom. M. Kom." },
        { periode: "2024-genap", kode: "C0320404", nama: "Pemrograman Bergerak (3C)", hari: "Senin", jam: "14:20 - 19:30", sks: 3, dosen: "Arifin Noor A, S. ST, M. T." },
        { periode: "2024-genap", kode: "C0320405", nama: "Pemrograman Web (3C)", hari: "Rabu", jam: "08:00 - 12:10", sks: 3, dosen: "Agus S. B. N, S. T., M. Kom." },
        { periode: "2025-ganjil", kode: "C0320406", nama: "Perancangan P.L Berbasis Objek (5C)", hari: "Senin", jam: "09:40 - 12:10", sks: 2, dosen: "Abdul Kadir, Phd" }
    ];

    let currentFilteredKelas = []; // Wadah data yang sudah difilter per periode

    // 2. DOM ELEMENTS
    const overlay = document.getElementById("krsModalOverlay");
    const modalValidated = document.getElementById("modalValidated");
    const modalSelect = document.getElementById("modalSelectClass");
    const modalConfirm = document.getElementById("modalConfirm");
    
    const btnPilihKelas = document.getElementById("btnPilihKelas");
    const btnsCloseModal = document.querySelectorAll(".close-krs-modal");
    const btnOpenConfirm = document.getElementById("btnOpenConfirm");
    const btnCancelConfirm = document.getElementById("btnCancelConfirm");
    const btnSubmitKRS = document.getElementById("btnSubmitKRS");

    const tableSelectBody = document.getElementById("table-select-body");
    const tableValidatedBody = document.getElementById("table-validated-body");
    const tableMainBody = document.getElementById("krs-table-main");

    const selectTotalSksEl = document.getElementById("select-total-sks");
    const validatedTotalSksEl = document.getElementById("validated-total-sks");
    const mainTotalSksEl = document.getElementById("krs-det-totalsks-main");
    const badgeStatusMain = document.getElementById("badgeStatusMain");

    // 3. FUNGSI RENDER UI
    function renderTableSelect() {
        if (!tableSelectBody) return;
        tableSelectBody.innerHTML = "";
        
        if(currentFilteredKelas.length === 0){
            tableSelectBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-slate-400">Tidak ada penawaran kelas untuk periode ini.</td></tr>`;
            if(selectTotalSksEl) selectTotalSksEl.innerText = `Total 0 SKS`;
            return;
        }

        currentFilteredKelas.forEach((mk, index) => {
            const isChecked = index < 2 ? "checked" : ""; // Simulasi dummy checkbox terpilih
            const tr = document.createElement("tr");
            tr.className = "border-b border-slate-100 hover:bg-slate-50 transition-colors";
            tr.innerHTML = `
                <td class="py-3.5 px-5 font-normal text-slate-700">${mk.kode} - ${namaPendek(mk.nama)}</td>
                <td class="py-3.5 px-5 text-center font-normal text-slate-700">${mk.hari}, ${mk.jam}</td>
                <td class="py-3.5 px-5 text-center font-normal text-slate-700">${mk.sks} SKS</td>
                <td class="py-3.5 px-5 text-center">
                    <input type="checkbox" class="custom-checkbox mk-checkbox mx-auto" data-sks="${mk.sks}" ${isChecked}>
                </td>
            `;
            tableSelectBody.appendChild(tr);
        });
        calculateSKS();
    }

    function renderTableValidated() {
        if (!tableValidatedBody) return;
        tableValidatedBody.innerHTML = "";
        let totalSKS = 0;
        currentFilteredKelas.forEach((mk) => {
            totalSKS += mk.sks;
            const tr = document.createElement("tr");
            tr.className = "border-b border-slate-100";
            tr.innerHTML = `
                <td class="py-3.5 px-5 font-normal text-slate-700">${mk.kode} - ${namaPendek(mk.nama)}</td>
                <td class="py-3.5 px-5 text-center font-normal text-slate-700">${mk.hari}, ${mk.jam}</td>
                <td class="py-3.5 px-5 text-center font-normal text-slate-700">${mk.sks} SKS</td>
            `;
            tableValidatedBody.appendChild(tr);
        });
        if(validatedTotalSksEl) validatedTotalSksEl.innerText = `Total ${totalSKS} SKS`;
    }

    function renderTableMain() {
        if (!tableMainBody) return;
        
        // Kondisi jika belum mengisi KRS
        if (statusKRS === "belum") {
            badgeStatusMain.className = "bg-[#F1F5F9] text-[#64748B] px-2.5 py-0.5 rounded text-[11px] font-semibold w-fit border border-[#e2e8f0]";
            badgeStatusMain.innerText = "Belum Mengisi";
            tableMainBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400">Belum ada kelas yang dipilih untuk periode ini.</td></tr>`;
            if(mainTotalSksEl) mainTotalSksEl.innerText = "Total 0 SKS";
            return;
        }

        // Kondisi jika data kosong namun statusnya sudah diubah (contohnya pindah periode)
        if(currentFilteredKelas.length === 0){
             tableMainBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400">Tidak ada data kelas.</td></tr>`;
             if(mainTotalSksEl) mainTotalSksEl.innerText = "Total 0 SKS";
             return;
        }

        tableMainBody.innerHTML = "";
        let totalSKS = 0;
        
        currentFilteredKelas.forEach((mk) => {
            totalSKS += mk.sks;
            const tr = document.createElement("tr");
            tr.className = "border-b border-slate-50 hover:bg-slate-50 transition-colors";
            tr.innerHTML = `
                <td class="py-3.5 px-5 font-normal text-slate-800">${mk.kode}</td>
                <td class="py-3.5 px-5 font-normal text-slate-800">${namaPendek(mk.nama)}</td>
                <td class="py-3.5 px-5 text-center font-normal text-slate-800">${mk.sks}</td>
                <td class="py-3.5 px-5 text-center font-normal text-slate-800">
                    <div class="flex flex-col leading-tight"><span>${mk.hari}</span><span class="text-xs text-slate-500">${mk.jam}</span></div>
                </td>
                <td class="py-3.5 px-5 font-normal text-slate-800">${mk.dosen}</td>
            `;
            tableMainBody.appendChild(tr);
        });
        
        if(mainTotalSksEl) mainTotalSksEl.innerText = `Total ${totalSKS} SKS`;
    }

    // Fungsi utilitas SKS & Nama
    function calculateSKS() {
        const checkboxes = document.querySelectorAll(".mk-checkbox");
        let total = 0;
        checkboxes.forEach(cb => {
            if (cb.checked) total += parseInt(cb.getAttribute("data-sks"));
            cb.removeEventListener("change", handleCheckboxChange);
            cb.addEventListener("change", handleCheckboxChange);
        });
        if(selectTotalSksEl) selectTotalSksEl.innerText = `Total ${total} SKS`;
    }
    function handleCheckboxChange() { calculateSKS(); }
    function namaPendek(nama) { return nama.replace(/\s*\(.*?\)\s*/g, ''); }

    // 4. MENGHUBUNGKAN DENGAN GLOBAL FILTER SORT
    if (typeof GlobalFilterSort !== 'undefined') {
        GlobalFilterSort.init({
            data: daftarKelasAwal,
            filters: [
                { id: 'periode-select-krs', key: 'periode' } 
            ],
            onRender: function(processedData) {
                currentFilteredKelas = processedData; // Timpa array dummy saat periode diganti
                renderTableMain();
                renderTableSelect();
                renderTableValidated();
            }
        });
    } else {
        currentFilteredKelas = daftarKelasAwal;
        renderTableMain();
    }

    // 5. EVENT LISTENERS MODAL
    function closeAllModals() {
        overlay.classList.add("hidden"); overlay.classList.remove("flex");
        modalValidated.classList.add("hidden"); modalSelect.classList.add("hidden");
        modalConfirm.classList.add("hidden");
    }

    if (btnPilihKelas) {
        btnPilihKelas.addEventListener("click", () => {
            overlay.classList.remove("hidden"); overlay.classList.add("flex");
            if (statusKRS === "disetujui" || statusKRS === "menunggu") {
                renderTableValidated(); modalValidated.classList.remove("hidden");
            } else {
                renderTableSelect(); modalSelect.classList.remove("hidden");
            }
        });
    }

    btnsCloseModal.forEach(btn => btn.addEventListener("click", closeAllModals));

    if (btnOpenConfirm) {
        btnOpenConfirm.addEventListener("click", () => {
            modalSelect.classList.add("hidden"); modalConfirm.classList.remove("hidden");
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    if (btnCancelConfirm) {
        btnCancelConfirm.addEventListener("click", () => {
            modalConfirm.classList.add("hidden"); modalSelect.classList.remove("hidden");
        });
    }

    // 6. SIMULASI PENGAJUAN KRS
    if (btnSubmitKRS) {
        btnSubmitKRS.addEventListener("click", () => {
            // [BE-NOTE]: Tempatkan aksi Axios API POST di sini.

            statusKRS = "menunggu"; 
            badgeStatusMain.className = "bg-[#FEF9C3] text-[#CA8A04] px-2.5 py-0.5 rounded text-[11px] font-semibold w-fit border border-[#fef08a]";
            badgeStatusMain.innerText = "Menunggu Validasi";
            
            renderTableMain();
            closeAllModals();
            alert("KRS berhasil disimpan dan sedang diajukan ke Dosen Pembimbing.");
        });
    }

    // 7. INITIAL CHECK STATUS
    if (statusKRS === "disetujui") {
        badgeStatusMain.className = "bg-[#DCFCE7] text-[#22C55E] px-2.5 py-0.5 rounded text-[11px] font-semibold w-fit border border-[#bbf7d0]";
        badgeStatusMain.innerText = "Disetujui";
        renderTableMain();
    } else if (statusKRS === "menunggu") {
        badgeStatusMain.className = "bg-[#FEF9C3] text-[#CA8A04] px-2.5 py-0.5 rounded text-[11px] font-semibold w-fit border border-[#fef08a]";
        badgeStatusMain.innerText = "Menunggu Validasi";
        renderTableMain();
    }
});