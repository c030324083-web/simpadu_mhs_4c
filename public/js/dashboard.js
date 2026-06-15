/**
 * =========================================================================================
 * SCRIPT DASHBOARD ADMIN SIMPADU (INTEGRATED WITH LARAVEL BACKEND)
 * =========================================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Deteksi Role (Admin / Mahasiswa)
    const role = document.body.getAttribute('data-role');
    const token = localStorage.getItem('token'); // Ambil token auth dari storage login

    // Jika user adalah admin dan token tersedia, load data asli dari backend
    if (role === 'admin' && token) {
        loadUnifiedAdminDashboard(token);
    }
});

/**
 * =========================================================================================
 * INTEGRASI SINGLE ENDPOINT - ADMIN DASHBOARD CONTROLLER
 * =========================================================================================
 */
async function loadUnifiedAdminDashboard(token) {
    const container = document.getElementById('container-jadwal');
    
    try {
        // Panggil endpoint API unified dashboard admin yang telah dibuat di backend Laravel
        const response = await fetch('/api/web/dashboard/admin', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok || result.status !== 'success') {
            throw new Error(result.message || 'Gagal memuat data dashboard.');
        }

        const payload = result.data;

        // --------------------------------------------------------
        // 1. BINDING DATA STATISTIK UTAMA (INTERNAL & KELOMPOK 4)
        // --------------------------------------------------------
        if (document.getElementById('data-total-mahasiswa')) {
            document.getElementById('data-total-mahasiswa').textContent = payload.total_mahasiswa.toLocaleString('id-ID');
            // Nilai persentase perkembangan tren (opsional, bisa di-hardcode atau dilempar dari backend)
            updateCardPercentage('blue', 4.2); 
        }

        if (document.getElementById('data-mahasiswa-aktif')) {
            document.getElementById('data-mahasiswa-aktif').textContent = payload.mahasiswa_aktif.toLocaleString('id-ID');
            updateCardPercentage('green', -1.5);
        }

        if (document.getElementById('data-tagihan-ukt')) {
            // Menampilkan nominal total rupiah tagihan yang belum lunas (Kelompok 4)
            // Jika format di HTML Anda membutuhkan nominal rupiah, gunakan format mata uang:
            const formatRupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(payload.total_tagihan_ukt);
            
            // Atau jika hanya menampilkan total jumlah orang/tagihan sesuai layout awal, gunakan toLocaleString:
            document.getElementById('data-tagihan-ukt').textContent = payload.total_tagihan_ukt > 100000 
                ? formatRupiah 
                : payload.total_tagihan_ukt.toLocaleString('id-ID');

            updateCardPercentage('orange', 12.4);
        }

        // --------------------------------------------------------
        // 2. RENDERING DATA JADWAL PERKULIAHAN HARI INI (KELOMPOK 1)
        // --------------------------------------------------------
        if (!container) return;
        container.innerHTML = '';

        const listJadwal = payload.jadwal_perkuliahan || [];

        if (listJadwal.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-6 text-slate-400 text-xs font-medium">
                     📅 Tidak ada jadwal perkuliahan untuk hari ${result.meta.hari_ini || 'ini'}.
                </div>`;
            return;
        }

        // Array pembantu untuk variasi warna box perkuliahan secara berurutan
        const daftarWarna = ['blue', 'emerald', 'purple'];

        listJadwal.forEach((jadwal, index) => {
            // Tentukan index warna agar berputar (blue -> emerald -> purple)
            const varianWarna = daftarWarna[index % daftarWarna.length];
            
            let colorHex = varianWarna === 'emerald' ? '#10b981' : (varianWarna === 'purple' ? '#a855f7' : '#1e56df');
            let colorBg = varianWarna === 'emerald' ? '#ecfdf5' : (varianWarna === 'purple' ? '#faf5ff' : '#eff6ff');
            let colorText = varianWarna === 'emerald' ? '#047857' : (varianWarna === 'purple' ? '#7e22ce' : '#1d4ed8');

            // Ekstraksi data safety mapping dari API Kelompok 1
            const namaMatkul = jadwal.kurikulum_mk?.mata_kuliah?.nama_mk || jadwal.mata_kuliah?.nama_mk || 'Mata Kuliah';
            const namaKelas = jadwal.kelas?.kelas_nama || jadwal.kelas?.nama_kelas || 'Kelas';
            const jamMulai = (jadwal.waktu_mulai ?? '08:00:00').substring(0, 5);
            const jamSelesai = (jadwal.waktu_selesai ?? '10:00:00').substring(0, 5);
            const namaRuang = jadwal.ruang?.nama_ruang || 'Ruangan';
            
            // Gunakan hari dari meta data server
            const teksTanggal = result.meta.hari_ini; 

            const jadwalCard = `
                <div class="schedule bg-[#fafafa] border border-slate-100 rounded-xl p-4 flex flex-col justify-between min-h-[110px] relative overflow-hidden transition-shadow hover:shadow-sm">
                    <div class="absolute top-0 left-0 w-1 h-full" style="background-color: ${colorHex};"></div>
                    <div>
                        <div class="flex justify-between items-start gap-2 mb-2">
                            <h4 class="text-xs font-bold text-slate-800 m-0 leading-tight pr-4">${namaMatkul}</h4>
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded shrink-0" style="background-color: ${colorBg}; color: ${colorText};">${namaKelas}</span>
                        </div>
                        <div class="flex flex-col gap-1 text-[11px] text-slate-400 font-medium">
                            <span class="flex items-center gap-1.5"><i data-lucide="clock" class="w-3.5 h-3.5 text-slate-300"></i> ${jamMulai} - ${jamSelesai} WIB</span>
                            <span class="flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-300"></i> ${namaRuang}</span>
                        </div>
                    </div>
                    <div class="date text-[10px] font-bold text-slate-500 mt-3 border-t border-slate-200/60 pt-2 flex items-center gap-1">
                        <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i> ${teksTanggal}
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', jadwalCard);
        });

        // Inisialisasi ulang icon Lucide setelah HTML dimasukkan secara dinamis
        if (typeof lucide !== 'undefined') lucide.createIcons();

    } catch (error) {
        console.error('Error memuat data dashboard terpadu:', error);
        if (container) {
            container.innerHTML = '<p class="text-xs text-red-500 text-center py-4">Gagal mensinkronisasikan jadwal kuliah hari ini dengan server pusat.</p>';
        }
    }
}

/**
 * =========================================================================================
 * FUNGSI BANTU UTK UPDATE PERSENTASE CARD (TETAP DIPERTAHANKAN)
 * =========================================================================================
 */
function updateCardPercentage(colorClass, value) {
    const numericValue = parseFloat(value) || 0;
    const isPositive = numericValue >= 0;
    const arrow = isPositive ? '↑' : '↓';
    
    let textColor = '';
    let bgColor = '';
    
    if (isPositive) {
        if (colorClass === 'blue') {
            textColor = 'text-blue-600';
            bgColor = 'bg-blue-50';
        } else if (colorClass === 'green') {
            textColor = 'text-emerald-600';
            bgColor = 'bg-emerald-50';
        } else if (colorClass === 'orange') {
            textColor = 'text-orange-600';
            bgColor = 'bg-orange-50';
        }
    } else {
        textColor = 'text-red-600';
        bgColor = 'bg-red-50';
    }
    
    const cardIcon = document.querySelector(`.card-icon.${colorClass}`);
    if (cardIcon) {
        const span = cardIcon.closest('.card').querySelector('.card-bottom span');
        if (span) {
            span.className = `up ${colorClass}-text flex items-center text-[11px] font-bold ${textColor} ${bgColor} px-2 py-0.5 rounded transition-all duration-300`;
            span.textContent = `${arrow} ${Math.abs(numericValue)}%`;
        }
    }
}