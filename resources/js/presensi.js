// ================= DUMMY DATA =================

const data = {
    kelas: [
        { id: "TI-4C" },
        { id: "MI-2A" }
    ],

    matkul: {
        "TI-4C": [
            { id: "web", nama: "Pemrograman Web" },
            { id: "num", nama: "Metode Numerik" }
        ]
    },

    mahasiswa: {
        "web": [
            { id: "1", nama: "Andi", hadir: 10, izin: 1, alfa: 1 },
            { id: "2", nama: "Budi", hadir: 12, izin: 0, alfa: 0 }
        ]
    }
};

// ================= PARAM =================

const params = new URLSearchParams(window.location.search);

const kelas = params.get("kelas");
const matkul = params.get("matkul");
const mahasiswa = params.get("mahasiswa");

// ================= INIT =================

if (!kelas) {
    renderKelas();
}
else if (kelas && !matkul) {
    renderMatkul(kelas);
}
else if (kelas && matkul && !mahasiswa) {
    renderMahasiswa(kelas, matkul);
}
else {
    renderDetail(mahasiswa);
}

// ================= RENDER =================

function renderKelas() {
    document.getElementById("title").innerText = "Presensi Kelas";

    let html = `<div class="card"><table class="table">`;

    data.kelas.forEach(k => {
        html += `
        <tr onclick="go('?kelas=${k.id}')">
            <td>${k.id}</td>
        </tr>`;
    });

    html += `</table></div>`;

    document.getElementById("content").innerHTML = html;
}

function renderMatkul(kelas) {
    document.getElementById("title").innerText = "Matakuliah " + kelas;

    let html = `<span class="back" onclick="go('')">← Kembali</span>`;
    html += `<div class="card"><table class="table">`;

    data.matkul[kelas].forEach(m => {
        html += `
        <tr onclick="go('?kelas=${kelas}&matkul=${m.id}')">
            <td>${m.nama}</td>
        </tr>`;
    });

    html += `</table></div>`;

    document.getElementById("content").innerHTML = html;
}

function renderMahasiswa(kelas, matkul) {
    document.getElementById("title").innerText = "Mahasiswa";

    let html = `<span class="back" onclick="go('?kelas=${kelas}')">← Kembali</span>`;
    html += `<div class="card"><table class="table">`;

    data.mahasiswa[matkul].forEach(m => {

        const total = m.hadir + m.izin + m.alfa;
        const persen = (m.hadir / total) * 100;

        html += `
        <tr onclick="go('?kelas=${kelas}&matkul=${matkul}&mahasiswa=${m.id}')">
            <td>${m.nama}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar" style="width:${persen}%"></div>
                </div>
            </td>
        </tr>`;
    });

    html += `</table></div>`;

    document.getElementById("content").innerHTML = html;
}

function renderDetail(id) {
    document.getElementById("title").innerText = "Detail Presensi";

    let m = data.mahasiswa["web"].find(x => x.id === id);

    let html = `<span class="back" onclick="history.back()">← Kembali</span>`;
    html += `
    <div class="card">
        <h3>${m.nama}</h3>
        <p>Hadir: <span class="badge hadir">${m.hadir}</span></p>
        <p>Izin: <span class="badge izin">${m.izin}</span></p>
        <p>Alfa: <span class="badge alfa">${m.alfa}</span></p>
    </div>`;

    document.getElementById("content").innerHTML = html;
}

// ================= NAV =================

function go(param) {
    window.location.href = "presensi_detail.html" + param;
}