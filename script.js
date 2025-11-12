// Elemen
const form = document.getElementById("formTransaksi");
const tabelBody = document.querySelector("#tabelData tbody");
const filterTanggal = document.getElementById("filterTanggal");
const laporanGabunganBtn = document.getElementById("laporanGabungan");

let dataTransaksi = JSON.parse(localStorage.getItem("transaksi")) || [];
let editIndex = null;

// Render tabel utama
function renderTabel(data = dataTransaksi) {
  tabelBody.innerHTML = "";
  data.forEach((item, index) => {
    const row = `
      <tr>
        <td>${item.tanggal}</td>
        <td>${item.kategori}</td>
        <td>${item.keterangan}</td>
        <td>Rp ${item.jumlah.toLocaleString()}</td>
        <td>
          <button onclick="editData(${index})">Edit</button>
          <button onclick="hapusData(${index})">Hapus</button>
        </td>
      </tr>
    `;
    tabelBody.innerHTML += row;
  });
  renderLaporanBulanan(); // Update laporan tiap kali render
}

// Simpan ke localStorage
function simpanStorage() {
  localStorage.setItem("transaksi", JSON.stringify(dataTransaksi));
}

// Tambah/Edit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const tanggal = document.getElementById("tanggal").value;
  const kategori = document.getElementById("kategori").value;
  const keterangan = document.getElementById("keterangan").value;
  const jumlah = parseInt(document.getElementById("jumlah").value);

  if (!tanggal || !kategori || !jumlah) {
    alert("Semua field wajib diisi!");
    return;
  }

  const dataBaru = { tanggal, kategori, keterangan, jumlah };

  if (editIndex !== null) {
    dataTransaksi[editIndex] = dataBaru;
    editIndex = null;
  } else {
    dataTransaksi.push(dataBaru);
  }

  simpanStorage();
  renderTabel();
  form.reset();
});

// Edit data
function editData(index) {
  const item = dataTransaksi[index];
  document.getElementById("tanggal").value = item.tanggal;
  document.getElementById("kategori").value = item.kategori;
  document.getElementById("keterangan").value = item.keterangan;
  document.getElementById("jumlah").value = item.jumlah;
  editIndex = index;
}

// Hapus data
function hapusData(index) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    dataTransaksi.splice(index, 1);
    simpanStorage();
    renderTabel();
  }
}

// Filter tanggal
filterTanggal.addEventListener("input", () => {
  const tanggal = filterTanggal.value;
  if (tanggal) {
    const hasil = dataTransaksi.filter((t) => t.tanggal === tanggal);
    renderTabel(hasil);
  } else {
    renderTabel();
  }
});

// Laporan gabungan
laporanGabunganBtn.addEventListener("click", () => {
  let totalSPP = 0,
      totalHonorer = 0,
      totalIjazah = 0,
      totalATK = 0,
      totalLain = 0;

  dataTransaksi.forEach((t) => {
    switch (t.kategori) {
      case "SPP": totalSPP += t.jumlah; break;
      case "Honorer Guru": totalHonorer += t.jumlah; break;
      case "Pembayaran Ijazah": totalIjazah += t.jumlah; break;
      case "ATK/Perlengkapan": totalATK += t.jumlah; break;
      case "Pembayaran Lain-lain": totalLain += t.jumlah; break;
    }
  });

  const totalSemua = totalSPP + totalHonorer + totalIjazah + totalATK + totalLain;

  const laporanHTML = `
    <h2>Laporan Keuangan Gabungan</h2>
    <p><b>Total SPP:</b> Rp ${totalSPP.toLocaleString()}</p>
    <p><b>Total Honorer Guru:</b> Rp ${totalHonorer.toLocaleString()}</p>
    <p><b>Total Pembayaran Ijazah:</b> Rp ${totalIjazah.toLocaleString()}</p>
    <p><b>Total ATK & Perlengkapan:</b> Rp ${totalATK.toLocaleString()}</p>
    <p><b>Total Pembayaran Lain-lain:</b> Rp ${totalLain.toLocaleString()}</p>
    <hr>
    <h3>Total Keseluruhan: Rp ${totalSemua.toLocaleString()}</h3>
    <button onclick="window.print()">Cetak Laporan PDF</button>
  `;

  const laporanWindow = window.open("", "_blank");
  laporanWindow.document.write(`<html><head><title>Laporan</title></head><body>${laporanHTML}</body></html>`);
  laporanWindow.document.close();
});

// ========== LAPORAN BULANAN ==========
function hitungLaporanBulanan() {
  const hasil = {};
  dataTransaksi.forEach((t) => {
    const bulan = new Date(t.tanggal).toLocaleString("id-ID", { month: "long", year: "numeric" });
    if (!hasil[bulan]) hasil[bulan] = 0;
    hasil[bulan] += t.jumlah;
  });
  return hasil;
}

function renderLaporanBulanan() {
  const dataBulan = hitungLaporanBulanan();
  const container = document.getElementById("tabelBulan");
  container.innerHTML = "";

  if (Object.keys(dataBulan).length === 0) {
    container.innerHTML = "<p>Belum ada data transaksi.</p>";
    return;
  }

  let tabelHTML = `
    <table>
      <thead><tr><th>Bulan</th><th>Total Transaksi (Rp)</th></tr></thead><tbody>
  `;

  for (const [bulan, total] of Object.entries(dataBulan)) {
    tabelHTML += `<tr><td>${bulan}</td><td>Rp ${total.toLocaleString()}</td></tr>`;
  }

  tabelHTML += `</tbody></table>`;
  container.innerHTML = tabelHTML;

  const ctx = document.getElementById("chartBulan");
  if (window.chartInstance) window.chartInstance.destroy();

  window.chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(dataBulan),
      datasets: [{
        label: "Total Transaksi per Bulan (Rp)",
        data: Object.values(dataBulan),
        backgroundColor: "#42a5f5",
        borderColor: "#1e88e5",
        borderWidth: 1,
      }],
    },
    options: { scales: { y: { beginAtZero: true } } },
  });
}

// Jalankan awal
renderTabel();
