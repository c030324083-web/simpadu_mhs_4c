// Mengambil role dari atribut body (admin / mhs)
const role = document.body.getAttribute("data-role");

// Inisialisasi ikon Lucide
if (window.lucide) lucide.createIcons();

/* ================= TAB NAVIGATION ================= */
function switchTab(tabName) {
    const btnProfil = document.getElementById('btnTabProfil');
    const btnKeamanan = document.getElementById('btnTabKeamanan');
    
    const contentProfil = document.getElementById('tabProfilContent');
    const contentKeamanan = document.getElementById('tabKeamananContent');

    const iconProfil = document.getElementById('iconProfil');
    const iconKeamanan = document.getElementById('iconKeamanan');

    const activeClasses = ['bg-blue-600', 'text-white'];
    const inactiveClasses = ['bg-transparent', 'hover:bg-gray-50', 'text-gray-600'];

    contentProfil.classList.add('hidden');
    contentKeamanan.classList.add('hidden');

    btnProfil.classList.remove(...activeClasses);
    btnProfil.classList.add(...inactiveClasses);
    iconProfil.className = "w-4 h-4 text-gray-500"; 
    
    btnKeamanan.classList.remove(...activeClasses);
    btnKeamanan.classList.add(...inactiveClasses);
    iconKeamanan.className = "w-4 h-4 text-gray-500"; 

    if (tabName === 'profil') {
        btnProfil.classList.remove(...inactiveClasses);
        btnProfil.classList.add(...activeClasses);
        iconProfil.className = "w-4 h-4 text-white"; 
        contentProfil.classList.remove('hidden');
        contentProfil.classList.add('block');
    } else if (tabName === 'keamanan') {
        btnKeamanan.classList.remove(...inactiveClasses);
        btnKeamanan.classList.add(...activeClasses);
        iconKeamanan.className = "w-4 h-4 text-white"; 
        contentKeamanan.classList.remove('hidden');
        contentKeamanan.classList.add('block');
    }
    
    lucide.createIcons();
}

/* ================= TOAST NOTIFICATION ================= */
function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toastNotification');
    const tMessage = document.getElementById('toastMessage');
    const tIcon = document.getElementById('toastIcon');

    tMessage.textContent = message;
    
    if(isSuccess) {
        tIcon.setAttribute('data-lucide', 'check-circle');
        tIcon.className = "w-4 h-4 text-emerald-400";
    } else {
        tIcon.setAttribute('data-lucide', 'alert-circle');
        tIcon.className = "w-4 h-4 text-rose-400";
    }
    lucide.createIcons();

    toast.classList.remove('translate-y-20', 'opacity-0');
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2500);
}

/* ================= UPLOAD FOTO PROFIL ================= */
function triggerUpload() { 
    document.getElementById('fileInput').click(); 
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('avatarImg');
            const text = document.getElementById('avatarText');
            img.src = e.target.result;
            img.classList.remove('hidden');
            text.classList.add('hidden');
            
            showToast("Foto profil berhasil dipilih!");
        }
        reader.readAsDataURL(file);
    }
}

function deleteImage() {
    const img = document.getElementById('avatarImg');
    const text = document.getElementById('avatarText');
    if (!img.classList.contains('hidden')) {
        img.src = '';
        img.classList.add('hidden');
        text.classList.remove('hidden');
        document.getElementById('fileInput').value = '';
        
        showToast("Foto profil dikembalikan default.");
    } else {
        showToast("Tidak ada foto aktif saat ini", false);
    }
}

/* ================= FORM PROFIL ================= */
function saveProfile() {
    const nama = document.getElementById('profNama').value.trim();
    const username = document.getElementById('profUser').value.trim();
    const email = document.getElementById('profEmail').value.trim();
    const telp = document.getElementById('profTelp').value.trim();

    // Validasi kosong
    if(!nama || !username || !email || !telp) {
        showToast("Lengkapi isian data profil Anda!", false);
        return;
    }

    showToast("Profil berhasil diperbarui!");
    
    // Opsional: Kosongkan form kembali setelah save agar placeholder abu-abu muncul lagi
    resetProfileForm();
}

function resetProfileForm() {
    // Kosongkan value input agar teks petunjuk abu-abu (placeholder) kembali muncul
    document.getElementById('profNama').value = '';
    document.getElementById('profUser').value = '';
    document.getElementById('profEmail').value = '';
    document.getElementById('profTelp').value = '';
    
    showToast("Form dibatalkan dan dikosongkan.");
}

/* ================= FORM KEAMANAN ================= */
function updatePassword() {
    const lama = document.getElementById('passLama').value;
    const baru = document.getElementById('passBaru').value;
    const konf = document.getElementById('passKonf').value;

    if(!lama || !baru || !konf) {
        showToast("Semua input password wajib diisi!", false);
        return;
    }
    if(baru.length < 8) {
        showToast("Password minimal berisi 8 karakter!", false);
        return;
    }
    if(baru !== konf) {
        showToast("Konfirmasi password baru tidak cocok!", false);
        return;
    }
    
    showToast("Password Anda telah berhasil diperbarui!");
    clearPasswordForm();
}

function clearPasswordForm() {
    document.getElementById('passLama').value = '';
    document.getElementById('passBaru').value = '';
    document.getElementById('passKonf').value = '';
}

function handle2FAToggle(checkbox) {
    if(checkbox.checked) {
        showToast("Autentikasi Dua Faktor (2FA) Aktif!");
    } else {
        showToast("2FA Berhasil Dinonaktifkan.");
    }
}