var e={kelas:[{id:`TI-4C`},{id:`MI-2A`}],matkul:{"TI-4C":[{id:`web`,nama:`Pemrograman Web`},{id:`num`,nama:`Metode Numerik`}]},mahasiswa:{web:[{id:`1`,nama:`Andi`,hadir:10,izin:1,alfa:1},{id:`2`,nama:`Budi`,hadir:12,izin:0,alfa:0}]}},t=new URLSearchParams(window.location.search),n=t.get(`kelas`),r=t.get(`matkul`),i=t.get(`mahasiswa`);n?n&&!r?o(n):n&&r&&!i?s(n,r):c(i):a();function a(){document.getElementById(`title`).innerText=`Presensi Kelas`;let t=`<div class="card"><table class="table">`;e.kelas.forEach(e=>{t+=`
        <tr onclick="go('?kelas=${e.id}')">
            <td>${e.id}</td>
        </tr>`}),t+=`</table></div>`,document.getElementById(`content`).innerHTML=t}function o(t){document.getElementById(`title`).innerText=`Matakuliah `+t;let n=`<span class="back" onclick="go('')">← Kembali</span>`;n+=`<div class="card"><table class="table">`,e.matkul[t].forEach(e=>{n+=`
        <tr onclick="go('?kelas=${t}&matkul=${e.id}')">
            <td>${e.nama}</td>
        </tr>`}),n+=`</table></div>`,document.getElementById(`content`).innerHTML=n}function s(t,n){document.getElementById(`title`).innerText=`Mahasiswa`;let r=`<span class="back" onclick="go('?kelas=${t}')">← Kembali</span>`;r+=`<div class="card"><table class="table">`,e.mahasiswa[n].forEach(e=>{let i=e.hadir+e.izin+e.alfa,a=e.hadir/i*100;r+=`
        <tr onclick="go('?kelas=${t}&matkul=${n}&mahasiswa=${e.id}')">
            <td>${e.nama}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar" style="width:${a}%"></div>
                </div>
            </td>
        </tr>`}),r+=`</table></div>`,document.getElementById(`content`).innerHTML=r}function c(t){document.getElementById(`title`).innerText=`Detail Presensi`;let n=e.mahasiswa.web.find(e=>e.id===t),r=`<span class="back" onclick="history.back()">← Kembali</span>`;r+=`
    <div class="card">
        <h3>${n.nama}</h3>
        <p>Hadir: <span class="badge hadir">${n.hadir}</span></p>
        <p>Izin: <span class="badge izin">${n.izin}</span></p>
        <p>Alfa: <span class="badge alfa">${n.alfa}</span></p>
    </div>`,document.getElementById(`content`).innerHTML=r}