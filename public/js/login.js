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
        // Menembak router proxy login di backend Laravel lokal Anda
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
        if (response.ok && data.success === true) {
            successMsg.innerHTML = "Login berhasil, mengalihkan...";

            const payload = data.data; 
            const tokenValue = payload.access_token;
            const refreshTokenValue = payload.refresh_token;
            const nameValue = payload.user ? payload.user.name : "User Simpadu";
            
            // Ekstraksi role dari array user.roles (ambil indeks pertama)
            let roleValue = ""; 
            if (payload.user && payload.user.roles && payload.user.roles.length > 0) {
                roleValue = payload.user.roles[0]; // Menghasilkan 'admin_mahasiswa' atau 'mahasiswa'
            }

            /* Simpan Auth State ke Klien Browser */
            localStorage.setItem("token", tokenValue);
            localStorage.setItem("role", roleValue);
            localStorage.setItem("name", nameValue); 
            if (refreshTokenValue) {
                localStorage.setItem("refresh_token", refreshTokenValue);
            }

            /* ROLE REDIRECT SAAT SUBMIT FORM */
            setTimeout(() => {
                if (roleValue === "admin_mahasiswa") {
                    window.location.href = "../pages/dashboard_admin.html";
                } else if (roleValue === "mahasiswa") {
                    window.location.href = "../../pages/Mahasiswa/dashboard_mhs.html";
                } else {
                    window.location.href = "dashboard.html";
                }
            }, 1000);
        } 
        /* HANDLER JIKA KREDENSIAL SALAH */
        else {
            errorMsg.innerHTML = data.message || "Email atau password salah, silakan periksa kembali.";
        }
    } 
    catch (error) {
        console.error("Login Error:", error);
        errorMsg.innerHTML = "Server tidak dapat dihubungi atau timeout. Coba lagi nanti.";
    } 
    finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = "Masuk ke Sistem";
    }
});


/* ================= REFRESH TOKEN LOGIC ================= */
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
        if (response.ok && data.success === true && data.data.access_token) {
            const newToken = data.data.access_token;
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
async function jalankanLogoutSistem() {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
        bersihkanStorageDanRedirect();
        return;
    }

    try {
        await fetch("/api/auth/logout", {
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
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("refresh_token");
    
    alert("Anda telah keluar dari sistem.");
    window.location.href = "/index.html"; 
}


/* ================= CHECK TOKEN (PROTEKSI HALAMAN LOGIN) ================= */
// Bagian ini otomatis berjalan saat halaman login terbuka untuk memeriksa apakah user sudah login atau belum
const currentSavedToken = localStorage.getItem("token");
const currentSavedRole = localStorage.getItem("role");

if (currentSavedToken && currentSavedRole) {
    console.log("User sudah login, mendeteksi role untuk mengalihkan...");
    
    // PERBAIKAN: Kondisi if-else disamakan persis dengan data string role asli dari API
    if (currentSavedRole === "admin_mahasiswa") {
        window.location.href = "../pages/dashboard_admin.html";
    } else if (currentSavedRole === "mahasiswa") {
        window.location.href = "../../pages/Mahasiswa/dashboard_mhs.html";
    }
}