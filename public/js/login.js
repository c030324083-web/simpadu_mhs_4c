/**
 * =========================================================================================
 * SCRIPT LOGIN SIMPADU (INTEGRATED WITH LARAVEL BACKEND)
 * =========================================================================================
 */

/* ================= SHOW PASSWORD ================= */
document.addEventListener("DOMContentLoaded", function () {
    const eyeIcon = document.querySelector(".eye-icon");
    const passwordInput = document.querySelector("#password");

    if (eyeIcon && passwordInput) {
        eyeIcon.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                eyeIcon.classList.remove("fa-eye-slash");
                eyeIcon.classList.add("fa-eye");
            } else {
                passwordInput.type = "password";
                eyeIcon.classList.remove("fa-eye");
                eyeIcon.classList.add("fa-eye-slash");
            }
        });
    }
});

/* ================= LOGIN LOGIC ================= */
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset pesan notifikasi
    errorMsg.innerHTML = "";
    successMsg.innerHTML = "";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    /* VALIDASI FRONT-END */
    if (email === "" || password === "") {
        errorMsg.innerHTML = "Email dan password wajib diisi";
        return;
    }

    /* LOADING STATE */
    loginBtn.disabled = true;
    loginBtn.innerHTML = "Loading...";

    try {
        // [INTEGRASI BACKEND] Menembak router proxy login di backend Laravel lokal Anda
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        /* HANDLER JIKA SUCCESS (HTTP Status 200) */
        if (response.ok && (data.success || data.token)) {
            successMsg.innerHTML = "Login berhasil, mengalihkan...";

            // Menangani pembacaan data secara fleksibel tergantung format Kelompok 1
            // (Mendukung format langsung ataupun jika bersarang di dalam data.data)
            const tokenValue = data.token || (data.data && data.data.token);
            const roleValue = data.role || (data.data && data.data.role) || "admin"; 
            const nameValue = data.name || (data.data && data.data.name) || "User Simpadu";
            const refreshTokenValue = data.refresh_token || (data.data && data.data.refresh_token);

            /* Simpan Auth State ke Klien Browser */
            localStorage.setItem("token", tokenValue);
            localStorage.setItem("role", roleValue);
            localStorage.setItem("name", nameValue); 
            if (refreshTokenValue) {
                localStorage.setItem("refresh_token", refreshTokenValue);
            }

            /* ROLE REDIRECT */
            setTimeout(() => {
                if (roleValue === "admin" || roleValue === "dosen") {
                    window.location.href = "../pages/dashboard_admin.html";
                } else if (roleValue === "mhs" || roleValue === "mahasiswa") {
                    window.location.href = "../../pages/Mahasiswa/dashboard_mhs.html";
                } else {
                    window.location.href = "dashboard.html";
                }
            }, 1000);
        } 
        /* HANDLER JIKA KREDENSIAL SALAH (HTTP Status 401 / 422 / 400) */
        else {
            errorMsg.innerHTML = data.message || "Email atau password salah, silakan periksa kembali.";
        }
    } 
    /* HANDLER JIKA KONEKSI DOWN ATAU SERVER ERROR */
    catch (error) {
        console.error("Login Error:", error);
        errorMsg.innerHTML = "Server tidak dapat dihubungi atau timeout. Coba lagi nanti.";
    } 
    /* KEMBALIKAN TOMBOL KE STATE AWAL */
    finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = "Masuk ke Sistem";
    }
});


/* ================= REFRESH TOKEN LOGIC ================= */
/**
 * Fungsi pembantu (helper) untuk memperbarui token jika masa berlakunya habis.
 * Bisa Anda panggil di file JS halaman admin/mahasiswa lain sebelum melakukan fetch data master.
 */
async function perbaruiTokenSesi() {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;

    try {
        const response = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        const data = await response.json();
        if (response.ok && (data.token || (data.data && data.data.token))) {
            const newToken = data.token || data.data.token;
            localStorage.setItem("token", newToken);
            console.log("Sesi token berhasil diperbarui secara otomatis.");
            return true;
        }
    } catch (e) {
        console.error("Gagal melakukan refresh token:", e);
    }
    return false;
}


/* ================= LOGOUT LOGIC ================= */
/**
 * Fungsi global logout untuk menghapus riwayat auth di backend kelompok 1 sekaligus storage lokal.
 * Anda bisa menempelkan fungsi ini pada tombol "Keluar / Logout" di sidebar dashboard.
 */
async function jalankanLogoutSistem() {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
        bersihkanStorageDanRedirect();
        return;
    }

    try {
        // Tembak API logout Laravel lokal untuk meneruskan ke server pusat
        const response = await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${currentToken}`,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
    } catch (e) {
        console.error("Koneksi gagal saat logout, membersihkan storage lokal saja...", e);
    } finally {
        bersihkanStorageDanRedirect();
    }
}

function bersihkanStorageDanRedirect() {
    // Hapus semua data auth dari browser
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("refresh_token");
    
    alert("Anda telah keluar dari sistem.");
    // Alihkan kembali ke halaman login utama
    window.location.href = "/index.html"; // Sesuaikan dengan letak halaman login Anda
}


/* ================= CHECK TOKEN (PROTEKSI HALAMAN LOGIN) ================= */
const token = localStorage.getItem("token");
const roleSession = localStorage.getItem("role");

if (token && roleSession) {
    console.log("User sudah login, mengalihkan ke dashboard...");
    if (roleSession === "admin" || roleSession === "dosen") {
        window.location.href = "../pages/dashboard_admin.html";
    } else if (roleSession === "mhs" || roleSession === "mahasiswa") {
        window.location.href = "../../pages/Mahasiswa/dashboard_mhs.html";
    }
}