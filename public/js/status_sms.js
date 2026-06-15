/**
 * SIMPADU - Status Semester (KHS)
 * File: status_sms.js
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Render otomatis Icon Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // =========================================================================
    // CATATAN UNTUK TIM BACKEND (BE):
    // 1. Ganti blok DUMMY DATA ini dengan pemanggilan API (fetch / axios).
    // 2. Format JSON response disarankan mirip seperti bentuk dummy ini.
    // 3. Panggil fungsi renderProfile() dan renderTableKHS() setelah fetch berhasil.
    // =========================================================================

    // --- DUMMY DATA: PROFILE MAHASISWA ---
    const dummyProfile = {
        nama: "Andi Pratama",
        nim: "A020325112",
        prodi: "D3 Teknik Pertambangan",
        kelas: "TP-2C",
        tahun_akademik: "2025/2026",
        status: "Aktif"
    };

    // --- DUMMY DATA: KHS SEMESTER ---
    // (Hanya diset 1 data sesuai request, dan saat data di database ada 20 baris, 
    // tabel akan otomatis memunculkan scroll bar berkat max-h-[400px])
    const dummySemesterData = [
        {
            no: 1,
            periode: "2025 Ganjil",
            smt: 1,
            status: "Aktif",
            sks: 22,
            ips: 3.93,
            sks_tempuh: 22,
            sks_total: 22,
            sks_lulus: 22,
            ipk_total: 3.93,
            ipk_lulus: 3.93,
            ket: ""
        }
    ];

    // Jalankan fungsi render UI
    renderProfile(dummyProfile);
    renderTableKHS(dummySemesterData);
});


/**
 * Fungsi untuk me-render data Profile Mahasiswa (Header Card Atas)
 */
function renderProfile(data) {
    document.getElementById("head-nama").textContent = data.nama;
    document.getElementById("head-nim").textContent = "NIM " + data.nim;
    document.getElementById("head-prodi").textContent = data.prodi;
    document.getElementById("head-kelas").textContent = data.kelas;
    document.getElementById("head-tahun").textContent = data.tahun_akademik;
    
    const statusEl = document.getElementById("head-status");
    statusEl.textContent = data.status;
    
    // BE Opsional: Ubah warna badge berdasarkan status (misal Aktif hijau, Cuti/DO merah)
    if (data.status.toLowerCase() !== 'aktif') {
        statusEl.className = "bg-red-100 text-red-600 px-4 py-0.5 rounded-full text-xs font-semibold tracking-wide";
    }
}


/**
 * Fungsi untuk me-render loop data tabel KHS
 */
function renderTableKHS(dataArray) {
    const tbody = document.getElementById("tbody-status-semester");
    
    // Kosongkan tulisan "Memuat data..." 
    tbody.innerHTML = "";

    // Jika data kosong di database
    if (dataArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" class="py-8 text-center text-slate-500">Tidak ada data semester yang ditemukan.</td></tr>`;
        return;
    }

    // Looping response JSON dan buat baris <tr> beserta class border yang persis 100% sama dengan desain UI
    dataArray.forEach(item => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50 transition-colors text-sm text-slate-700";

        // Template Literals untuk Injeksi Data
        tr.innerHTML = `
            <td class="py-4 px-3 border-solid border-r border-b border-[#E8EBF2]">${item.no}</td>
            <td class="py-4 px-3 border-solid border-r border-b border-[#E8EBF2]">${item.periode}</td>
            <td class="py-4 px-3 border-solid border-r border-b border-[#E8EBF2]">${item.smt}</td>
            <td class="py-4 px-3 border-solid border-r border-b border-[#E8EBF2]">${item.status}</td>
            <td class="py-4 px-3 border-solid border-r border-b border-[#E8EBF2]">${item.sks}</td>
            <td class="py-4 px-3 border-solid border-r border-b border-[#E8EBF2]">${item.ips.toFixed(2)}</td>
            <td class="py-4 px-3 border-solid border-r border-b border-[#E8EBF2]">${item.sks_tempuh}</td>
            <td class="py-4 px-3 border-solid border-r border-b border-[#E8EBF2]">${item.sks_total}</td>
            <td class="py-4 px-3 border-solid border-r border-b border-[#E8EBF2]">${item.sks_lulus}</td>
            <td class="py-4 px-3 border-solid border-r border-b border-[#E8EBF2]">${item.ipk_total.toFixed(2)}</td>
            <td class="py-4 px-3 border-solid border-r border-b border-[#E8EBF2]">${item.ipk_lulus.toFixed(2)}</td>
            <td class="py-4 px-3 border-solid border-b border-[#E8EBF2]">${item.ket}</td>
        `;

        tbody.appendChild(tr);
    });
}