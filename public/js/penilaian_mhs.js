/**
 * =========================================================================================
 * SIMPADU - Front-End UI Interactions
 * File: js/penilaian_mhs.js
 * =========================================================================================
 * [BE-NOTE]: 
 * Data "dummyDataPenilaian" ini adalah Single Source of Truth untuk halaman 
 * list (daftar matakuliah) maupun halaman detail.
 * Saat integrasi, API Backend Anda harus mengembalikan JSON dengan struktur
 * yang mirip agar fungsi openDetail(id) bisa berjalan dengan baik mengisi DOM HTML.
 * =========================================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. SATU DATA DUMMY GLOBAL (Untuk Halaman List & Detail)
    let dummyDataPenilaian = [
        {
            id: "C0320401",
            nama: "Administrasi Database",
            dosen: "Rahimi Fitri, S.Kom, M.Kom",
            periode: "2025 Genap",
            
            // Properti untuk halaman detail Rincian Nilai
            rincian: {
                tugas: { bobot: "20%", nilai: 80, akhir: 16 },
                aktivitas: { bobot: "20%", nilai: 85, akhir: 85 }, // Berdasarkan UI
                uts: { bobot: "20%", nilai: 75, akhir: 15 },
                uas: { bobot: "40%", nilai: 82, akhir: 32.8 },
                proyek: { nama: "Sistem Administrasi SQL", nilai: 88 }
            },
            total_nilai: 85.5,
            grade: "A"
        },
        {
            id: "C0320403",
            nama: "Metode Numerik",
            dosen: "Nitami Lestari Putri, S. Kom. M. Kom.",
            periode: "2025 Genap",
            
            // Sesuai dengan data UI gambar yang Anda lampirkan
            rincian: {
                tugas: { bobot: "20%", nilai: 70, akhir: 21 },
                aktivitas: { bobot: "20%", nilai: 75, akhir: 75 },
                uts: { bobot: "20%", nilai: 68, akhir: 20.4 },
                uas: { bobot: "40%", nilai: 75, akhir: 30 },
                proyek: { nama: "Sistem Informasi Akademik", nilai: 74 }
            },
            total_nilai: 71.2,
            grade: "B"
        },
        {
            id: "C0320408",
            nama: "Sistem Operasi",
            dosen: "Rizki Ramadhan, S.Kom., M.T.",
            periode: "2024 Ganjil", // Data beda periode agar fitur filter bekerja
            
            rincian: {
                tugas: { bobot: "20%", nilai: 60, akhir: 12 },
                aktivitas: { bobot: "20%", nilai: 65, akhir: 65 },
                uts: { bobot: "20%", nilai: 60, akhir: 12 },
                uas: { bobot: "40%", nilai: 65, akhir: 26 },
                proyek: { nama: "Simulasi Shell", nilai: 65 }
            },
            total_nilai: 62.0,
            grade: "C"
        }
    ];

    const tbody = document.getElementById("tableBodyPenilaian");

    // 2. FUNGSI RENDER TABEL (Halaman Depan)
    function renderTableList(data) {
        if (!tbody) return;
        tbody.innerHTML = ""; 

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 20px;" class="text-slate-500">Tidak ada matakuliah di periode ini.</td></tr>`;
            return;
        }

        data.forEach((mk) => {
            const tr = document.createElement("tr");
            tr.className = "clickable-row";
            // Panggil openDetail() dari JS, lalu navigate()
            tr.onclick = () => openDetail(mk.id);
            
            tr.innerHTML = `
                <td class="font-medium p-4">${mk.id}</td>
                <td class="p-4">${mk.nama}</td>
                <td class="p-4">${mk.dosen}</td>
            `;
            tbody.appendChild(tr);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // 3. INIT GLOBAL FILTER & SORT (Menghubungkan JS Global dengan HTML)
    if (typeof GlobalFilterSort !== 'undefined') {
        GlobalFilterSort.init({
            data: dummyDataPenilaian,
            
            // Hubungkan filter ke id="filterPeriode" di HTML, dengan key='periode' di dummyData
            filters: [
                { id: 'filterPeriode', key: 'periode' }
            ],
            
            // Hubungkan sorting ke id="sortSelect" di HTML
            sortId: 'sortSelect', 
            
            onRender: function(processedData) {
                renderTableList(processedData);
            }
        });
    } else {
        renderTableList(dummyDataPenilaian);
    }

    // =========================================================================
    // 4. FUNGSI BUKA DETAIL PENILAIAN (Mengambil dari 1 Data Dummy yang sama)
    // =========================================================================
    window.openDetail = function(idMk) {
        // Cari data yang sesuai di array
        const mkData = dummyDataPenilaian.find(item => item.id === idMk);
        
        if (mkData) {
            // A. Update Bagian Header Detail
            document.getElementById('detailNamaMk').innerText = mkData.nama;
            document.getElementById('detailIdMk').innerText = mkData.id;
            document.getElementById('detailDosen').innerText = mkData.dosen;
            
            // B. Update Tabel Rincian Nilai
            document.getElementById('valTugasBobot').innerText = mkData.rincian.tugas.bobot;
            document.getElementById('valTugasNilai').innerText = mkData.rincian.tugas.nilai;
            document.getElementById('valTugasAkhir').innerText = mkData.rincian.tugas.akhir;

            document.getElementById('valAktBobot').innerText = mkData.rincian.aktivitas.bobot;
            document.getElementById('valAktNilai').innerText = mkData.rincian.aktivitas.nilai;
            document.getElementById('valAktAkhir').innerText = mkData.rincian.aktivitas.akhir;

            document.getElementById('valUtsBobot').innerText = mkData.rincian.uts.bobot;
            document.getElementById('valUtsNilai').innerText = mkData.rincian.uts.nilai;
            document.getElementById('valUtsAkhir').innerText = mkData.rincian.uts.akhir;

            document.getElementById('valUasBobot').innerText = mkData.rincian.uas.bobot;
            document.getElementById('valUasNilai').innerText = mkData.rincian.uas.nilai;
            document.getElementById('valUasAkhir').innerText = mkData.rincian.uas.akhir;

            // C. Update Hasil Proyek
            document.getElementById('valProyekNama').innerText = mkData.rincian.proyek.nama;
            document.getElementById('valProyekNilai').innerText = mkData.rincian.proyek.nilai;

            // D. Update Nilai Akhir & Grade
            document.getElementById('detailTotalNilai').innerText = mkData.total_nilai;
            document.getElementById('detailGrade').innerText = mkData.grade;
            
            // Atur warna label grade (opsional, menyesuaikan grade)
            const gradeBadge = document.getElementById('detailGrade');
            if(mkData.grade === 'A') {
                gradeBadge.className = "bg-[#D1FAE5] text-[#059669] font-bold text-lg px-8 py-0.5 rounded-full leading-none border border-[#A7F3D0]";
            } else if (mkData.grade === 'B') {
                gradeBadge.className = "bg-[#DBEAFE] text-blue-500 font-bold text-lg px-8 py-0.5 rounded-full leading-none border border-blue-100";
            } else {
                gradeBadge.className = "bg-[#FEF2F2] text-red-500 font-bold text-lg px-8 py-0.5 rounded-full leading-none border border-red-100";
            }
        }
        
        // Pindah ke View Detail menggunakan fungsi dari HTML
        if (typeof window.navigate === 'function') {
            window.navigate('detail');
        }
    };
});