/**
 * =========================================================================================
 * SCRIPT DASHBOARD ADMIN - SIMPADU (INTEGRATED)
 * =========================================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const role = document.body.getAttribute('data-role');
    const token = localStorage.getItem('token'); 

    // Sinkronkan pengecekan role sesuai response server terbaru ('admin_mahasiswa')
    if ((role === 'admin_mahasiswa' || role === 'admin') && token) {
        loadUnifiedAdminDashboard(token);
    } else {
        console.error("Akses ditolak atau token tidak ditemukan.");
    }
});

async function loadUnifiedAdminDashboard(token) {
    const container = document.getElementById('container-jadwal');
    
    try {
        // PERBAIKAN: Sesuaikan endpoint URL dengan rute Laravel Anda (tambahkan prefix /api jika di dalam routes/api.php)
        const response = await fetch('/api/web/admin/dashboard', {
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

        // 1. BINDING DATA STATISTIK UTAMA ADMIN
        if (document.getElementById('data-total-mahasiswa')) {
            document.getElementById('data-total-mahasiswa').textContent = payload.total_mahasiswa.toLocaleString('id-ID');
            updateCardPercentage('blue', 4.2); 
        }

        if (document.getElementById('data-mahasiswa-aktif')) {
            document.getElementById('data-mahasiswa-aktif').textContent = payload.mahasiswa_aktif.toLocaleString('id-ID');
            updateCardPercentage('green', -1.5);
        }

        if (document.getElementById('data-tagihan-ukt')) {
            // Memformat total nominal uang rupiah dari Kelompok 4
            const formatRupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(payload.total_tagihan_ukt);
            document.getElementById('data-tagihan-ukt').textContent = formatRupiah;
            updateCardPercentage('orange', 12.4);
        }

        // 2. RENDERING DATA JADWAL PERKULIAHAN HARI INI (KELOMPOK 1)
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

        const daftarWarna = ['blue', 'emerald', 'purple'];

        listJadwal.forEach((jadwal, index) => {
            const varianWarna = daftarWarna[index % daftarWarna.length];
            let colorHex = varianWarna === 'emerald' ? '#10b981' : (varianWarna === 'purple' ? '#a855f7' : '#1e56df');
            let colorBg = varianWarna === 'emerald' ? '#ecfdf5' : (varianWarna === 'purple' ? '#faf5ff' : '#eff6ff');
            let colorText = varianWarna === 'emerald' ? '#047857' : (varianWarna === 'purple' ? '#7e22ce' : '#1d4ed8');

            // Pemetaan nama field sesuai data master Kelompok 1
            const namaMatkul = jadwal.kurikulum_mk?.mata_kuliah?.nama_mk || jadwal.mata_kuliah?.nama_mk || 'Mata Kuliah';
            const namaKelas = jadwal.kelas?.kelas_nama || jadwal.kelas?.nama_kelas || 'Kelas';
            const jamMulai = (jadwal.waktu_mulai ?? '08:00:00').substring(0, 5);
            const jamSelesai = (jadwal.waktu_selesai ?? '10:00:00').substring(0, 5);
            const namaRuang = jadwal.ruang?.nama_ruang || 'Ruangan';
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

        if (typeof lucide !== 'undefined') lucide.createIcons();

    } catch (error) {
        console.error('Error memuat data dashboard admin:', error);
        if (container) {
            container.innerHTML = '<p class="text-xs text-red-500 text-center py-4">Gagal sinkronisasi data dengan server lokal.</p>';
        }
    }
}

function updateCardPercentage(colorClass, value) {
    const numericValue = parseFloat(value) || 0;
    const isPositive = numericValue >= 0;
    const arrow = isPositive ? '↑' : '↓';
    let textColor = isPositive ? (colorClass === 'blue' ? 'text-blue-600' : (colorClass === 'green' ? 'text-emerald-600' : 'text-orange-600')) : 'text-red-600';
    let bgColor = isPositive ? (colorClass === 'blue' ? 'bg-blue-50' : (colorClass === 'green' ? 'bg-emerald-50' : 'bg-orange-50')) : 'bg-red-50';
    
    const cardIcon = document.querySelector(`.card-icon.${colorClass}`);
    if (cardIcon) {
        const span = cardIcon.closest('.card').querySelector('.card-bottom span');
        if (span) {
            span.className = `up ${colorClass}-text flex items-center text-[11px] font-bold ${textColor} ${bgColor} px-2 py-0.5 rounded transition-all duration-300`;
            span.textContent = `${arrow} ${Math.abs(numericValue)}%`;
        }
    }
}