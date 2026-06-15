/**
 * =========================================================================================
 * SCRIPT LOGOUT GLOBAL
 * =========================================================================================
 * [BE-NOTE]: 
 * Jika aplikasi di-convert sepenuhnya ke arsitektur Blade Laravel, fitur fetch() di 
 * bawah ini bisa dihapus dan modal logout cukup di-include via Blade. JS di file ini 
 * nantinya hanya akan fokus pada toggle buka/tutup class CSS modalnya saja.
 * =========================================================================================
 */

document.addEventListener("DOMContentLoaded", function () {
    const modalContainer = document.createElement("div");
    document.body.appendChild(modalContainer);

    const role = document.body.getAttribute("data-role");
    
    // [BE-NOTE]: Pastikan penyesuaian path ini valid atau gunakan absolute URL saat diintegrasikan.
    const modalPath = (role === "admin") ? "../pages/logout.html" : "../../pages/logout.html";

    fetch(modalPath)
        .then(res => {
            if (!res.ok) throw new Error("Gagal memuat komponen: " + res.statusText);
            return res.text();
        })
        .then(data => {
            modalContainer.innerHTML = data;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            initLogoutComponent();
        })
        .catch(err => console.error(err));
});

function initLogoutComponent() {
    const modal = document.getElementById('logoutModal');
    const modalCard = document.getElementById('modalCard');
    const btnBatal = document.getElementById('btnBatalLogout');
    const btnYaKeluar = document.getElementById('btnYaKeluar');
    const logoutDesc = document.getElementById('logoutDesc');

    // ==========================================
    // 1. LOGIKA TEKS DINAMIS
    // ==========================================
    const role = document.body.getAttribute("data-role");
    
    if (role === "admin" && logoutDesc) {
        logoutDesc.innerHTML = `
            <div class="mb-1.5">Anda akan keluar dari sistem akademik Poliban.</div>
            <div class="text-[13.5px] text-gray-600">Pastikan semua pekerjaan telah disimpan.</div>
        `;
    } else if (logoutDesc) {
        logoutDesc.innerHTML = `
            <div>Anda akan keluar dari sistem akademik Poliban.</div>
        `;
    }

    // ==========================================
    // 2. LOGIKA MENYALAKAN MENU SIDEBAR
    // ==========================================
    let originalPage = ""; 
    
    function toggleSidebarMenu(isLogoutActive) {
        if (isLogoutActive) {
            originalPage = document.body.getAttribute("data-page");
            document.body.setAttribute("data-page", "keluar");
            
            const currentLi = document.querySelector(`li[data-menu="${originalPage}"]`);
            const keluarLi = document.querySelector(`li[data-menu="keluar"]`);
            if (currentLi) currentLi.classList.remove('active');
            if (keluarLi) keluarLi.classList.add('active');
        } else {
            if (originalPage) {
                document.body.setAttribute("data-page", originalPage);
                const currentLi = document.querySelector(`li[data-menu="${originalPage}"]`);
                const keluarLi = document.querySelector(`li[data-menu="keluar"]`);
                if (keluarLi) keluarLi.classList.remove('active');
                if (currentLi) currentLi.classList.add('active');
            }
        }
    }

    // ==========================================
    // 3. FUNGSI BUKA / TUTUP MODAL
    // ==========================================
    window.openLogoutModal = function() {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalCard.classList.remove('scale-95');
            modalCard.classList.add('scale-100');
        }, 10);
        
        toggleSidebarMenu(true);
    }

    window.closeLogoutModal = function() {
        modal.classList.add('opacity-0');
        modalCard.classList.remove('scale-100');
        modalCard.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
        
        toggleSidebarMenu(false);
    }

    // ==========================================
    // 4. EVENT LISTENERS
    // ==========================================
    if (btnBatal) btnBatal.addEventListener('click', closeLogoutModal);
    if (modal) {
        modal.addEventListener('click', (e) => { 
            if (e.target === modal) closeLogoutModal(); 
        });
    }

    if (btnYaKeluar) {
        btnYaKeluar.addEventListener('click', () => {
            // [BE-NOTE]: Ini adalah logika Front-End Dummy. 
            // Untuk Backend, ganti logika ini dengan submit form POST ke route logout,
            // atau jalankan AJAX POST request untuk men-destroy session.
            // Contoh AJAX: fetch('/logout', { method: 'POST', headers: {'X-CSRF-TOKEN': token} }).then(() => window.location.href='/login');
            
            localStorage.clear();
            const loginPath = (role === "admin") ? "../pages/login.html" : "../../pages/login.html";
            window.location.href = loginPath; 
        });
    }

    // Pencegat klik tombol keluar
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, li');
        if (!target) return;

        if (target.id === 'btn-logout' || target.getAttribute('data-menu') === 'keluar') {
            e.preventDefault();
            openLogoutModal();
        }
    });
}