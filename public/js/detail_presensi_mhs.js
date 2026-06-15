/**
 * SIMPADU - Logika Halaman Detail Presensi Mahasiswa
 * Menangani looping kartu presensi dan interaksi modal
 */

// Data Dummy Mata Kuliah (Nanti direplace dengan hasil fetch API Kelompok 1)
const presensiData = [
    { id: 1, title: "Pemrograman Perangkat Bergerak (4C)", pertemuan: "Pertemuan Ke - 12", hadir: 12, totalSesi: 16, persentase: 75, kodeRuang: "H - 201", dosen: "Arifin Noor Asyikin, S.ST, M.T." },
    { id: 2, title: "Keamanan Jaringan (4C)", pertemuan: "Pertemuan Ke - 12", hadir: 12, totalSesi: 16, persentase: 75, kodeRuang: "Lab. Jaringan", dosen: "Dr. Kun Nursyaiful PP, S.T., M.Kom." },
    { id: 3, title: "Pemrograman Web (4C)", pertemuan: "Pertemuan Ke - 12", hadir: 12, totalSesi: 16, persentase: 75, kodeRuang: "Lab. Rekayasa 1", dosen: "Agus Setiyo B. N, S.T., M.Kom." },
    { id: 4, title: "Metode Numerik (4C)", pertemuan: "Pertemuan Ke - 12", hadir: 12, totalSesi: 16, persentase: 75, kodeRuang: "Lab. ARVR", dosen: "Nitami Lestari Putri, S.Kom. M.Kom." },
    { id: 5, title: "Administrasi Database (4C)", pertemuan: "Pertemuan Ke - 12", hadir: 12, totalSesi: 16, persentase: 75, kodeRuang: "UPT-TIK 103", dosen: "Rahimi Fitri, S.Kom, M.Kom" },
    { id: 6, title: "Kecerdasan Buatan (4C)", pertemuan: "Pertemuan Ke - 12", hadir: 12, totalSesi: 16, persentase: 75, kodeRuang: "H - 205", dosen: "Yeonie Indrasary" },
    { id: 7, title: "Perancangan Perangkat Lunak Berbasis Objek (4C)", pertemuan: "Pertemuan Ke - 12", hadir: 12, totalSesi: 16, persentase: 75, kodeRuang: "H - 203", dosen: "ABDUL KADIR, Ph.D" }
];

// Data Dummy Isi Sesi
const materiSesiList = [
    { no: 1, hariTanggal: "Senin, 9 Februari 2026", waktu: "09:40 - 12:10 WIB", materi: "Materi Perancangan Perangkat Lunak Berbasis Objek (PBO) dengan fokus pada pemahaman konsep dasar PBO" },
    { no: 2, hariTanggal: "Senin, 23 Februari 2026", waktu: "09:40 - 12:10 WIB", materi: "Realisasi pembelajaran pada materi Ketepatan Identifikasi dan Pengembangan Use Case Diagram" },
    { no: 3, hariTanggal: "Senin, 2 Maret 2026", waktu: "09:40 - 12:10 WIB", materi: "Praktekum 1 menyusun materi bab 1 sampai 2" }
];

document.addEventListener('DOMContentLoaded', () => {
    const courseGrid = document.getElementById('courseGrid');
    const modal = document.getElementById('detailModal');
    const modalCard = document.getElementById('modalCard');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    // Loop data & Render Kartu Menu Presensi Utama
    presensiData.forEach(course => {
        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl p-6 border border-solid border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[175px] shrink-0 w-[85vw] md:w-auto snap-start";
        card.onclick = () => openDetailModal(course);

        card.innerHTML = `
            <div>
                <h3 class="text-[15px] font-bold text-gray-800 m-0 leading-snug mb-2.5 hover:text-blue-600 transition-colors">${course.title}</h3>
                <div class="flex items-center gap-2 text-gray-400 text-xs mb-6 font-medium">
                    <i data-lucide="file-text" class="w-4 h-4 text-gray-300"></i>
                    <span>${course.pertemuan}</span>
                </div>
            </div>
            <div>
                <div class="flex justify-between items-center text-xs font-medium text-gray-400 mb-2">
                    <span>Kehadiran : ${course.hadir} dari ${course.totalSesi} sesi</span>
                    <span class="text-gray-400 font-medium">${course.persentase}%</span>
                </div>
                <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-blue-600 h-full rounded-full" style="width: ${course.persentase}%"></div>
                </div>
            </div>
        `;
        courseGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();

    // Fungsi Membuka Modal
    window.openDetailModal = function(course) {
        document.getElementById('modalCourseTitle').textContent = course.title;
        document.getElementById('modalPresensiCount').textContent = `Presensi ${course.hadir} / ${course.totalSesi}`;
        document.getElementById('modalPercentText').textContent = `${course.persentase}%`;
        document.getElementById('modalCircleProgress').setAttribute('stroke-dasharray', `${course.persentase}, 100`);

        const sessionContainer = document.getElementById('sessionListContainer');
        sessionContainer.innerHTML = ''; 

        materiSesiList.forEach(sesi => {
            const item = document.createElement('div');
            item.className = "flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-0 border-b border-solid border-gray-100 last:border-none";
            
            item.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-semibold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    ${sesi.no}
                </div>
                <div class="w-full sm:w-[155px] flex-shrink-0 space-y-0.5">
                    <h4 class="text-xs font-bold text-gray-800 m-0 leading-tight">${sesi.hariTanggal}</h4>
                    <p class="text-[11px] text-gray-400 m-0 font-medium">${sesi.waktu}</p>
                    <p class="text-[11px] text-gray-500 m-0"><span class="text-gray-400">Ruang :</span> ${course.kodeRuang}</p>
                    <p class="text-[11px] text-gray-400 m-0 truncate"><span class="text-gray-400">Dosen :</span> ${course.dosen}</p>
                </div>
                <div class="flex-1">
                    <p class="text-xs text-gray-600 m-0 leading-relaxed pr-2 font-normal">${sesi.materi}</p>
                </div>
                <div class="flex-shrink-0 self-center sm:ml-auto mt-2 sm:mt-0">
                    <span class="px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full tracking-wide">
                        Hadir
                    </span>
                </div>
            `;
            sessionContainer.appendChild(item);
        });

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalCard.classList.remove('scale-95');
            modalCard.classList.add('scale-100');
        }, 20);
    };

    // Fungsi Menutup Jendela Modal
    function closeModal() {
        modal.classList.add('opacity-0');
        modalCard.classList.remove('scale-100');
        modalCard.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});