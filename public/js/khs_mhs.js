/**
 * =========================================================================================
 * SCRIPT LOGIKA KHS MAHASISWA - POLIBAN
 * =========================================================================================
 * [BE-NOTE]: 
 * - Logika ini menggunakan global_filter_sort.js untuk simulasi filter Frontend.
 * - Saat integrasi Backend, Anda cukup mengambil <select id="periode-select"> 
 * lalu pasangkan event form submit atau Axios API untuk memanggil data KHS asli dari DB.
 * - Kalkulasi SKS & IPS di sini HANYA DUMMY. Tim BE wajib menghitung total SKS dan IPS
 * di dalam Controller PHP lalu di-passing ke Blade.
 * =========================================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const tableBody = document.getElementById('khs-table-body');
    const elSks = document.getElementById('total-sks');
    const elIps = document.getElementById('total-ips');

    // 1. DATA DUMMY KHS
    const dummyDataKHS = [
        { periode: "2025-genap", kode: "C0320401", matakuliah: "Administrasi Database", sks: 3, nilai: 4.00, huruf: "A" },
        { periode: "2025-genap", kode: "C0320402", matakuliah: "Keamanan Jaringan", sks: 3, nilai: 4.00, huruf: "A" },
        { periode: "2025-genap", kode: "C0320403", matakuliah: "Metode Numerik", sks: 2, nilai: 3.50, huruf: "AB" },
        { periode: "2024-ganjil", kode: "C0320404", matakuliah: "Pemrograman Web", sks: 3, nilai: 3.00, huruf: "B" },
        { periode: "2024-ganjil", kode: "C0320405", matakuliah: "Perancangan Berbasis Objek", sks: 3, nilai: 4.00, huruf: "A" }
    ];

    // 2. FUNGSI RENDER TABEL & KALKULASI SKS/IPS
    function renderTableKHS(data) {
        if (!tableBody) return;
        tableBody.innerHTML = "";
        
        let totalSks = 0;
        let totalNilaiSks = 0;

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-500">Data KHS tidak ditemukan untuk periode ini.</td></tr>`;
            elSks.innerText = "0";
            elIps.innerText = "0.00";
            return;
        }

        data.forEach(item => {
            totalSks += item.sks;
            totalNilaiSks += (item.sks * item.nilai);

            const tr = document.createElement("tr");
            tr.className = "border-b border-slate-50 hover:bg-slate-50 transition";
            tr.innerHTML = `
                <td class="py-3.5 px-5 font-normal text-slate-800">${item.kode}</td>
                <td class="py-3.5 px-5 font-normal text-slate-800">${item.matakuliah}</td>
                <td class="py-3.5 px-5 text-center font-normal text-slate-800">${item.sks}</td>
                <td class="py-3.5 px-5 text-center font-normal text-slate-800">${item.nilai.toFixed(2)}</td>
                <td class="py-3.5 px-5 text-center font-normal text-slate-800">${item.huruf}</td>
            `;
            tableBody.appendChild(tr);
        });

        // Kalkulasi IPS Dinamis Simulasi
        const ips = totalSks > 0 ? (totalNilaiSks / totalSks).toFixed(2) : "0.00";
        
        // Update DOM
        if (elSks) elSks.innerText = totalSks;
        if (elIps) elIps.innerText = ips;
    }

    // 3. INIT GLOBAL FILTER SORT
    if (typeof GlobalFilterSort !== 'undefined') {
        GlobalFilterSort.init({
            data: dummyDataKHS,
            filters: [
                { id: 'periode-select', key: 'periode' } // Hubungkan select periode
            ],
            onRender: function(processedData) {
                renderTableKHS(processedData);
            }
        });
    } else {
        renderTableKHS(dummyDataKHS);
    }
});