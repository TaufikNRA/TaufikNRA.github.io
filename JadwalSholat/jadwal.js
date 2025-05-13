let kota = "";

function updateJam() {
  const now = new Date();
  const jam = now.getHours().toString().padStart(2, '0');
  const menit = now.getMinutes().toString().padStart(2, '0');
  const detik = now.getSeconds().toString().padStart(2, '0');
  document.getElementById("jam-digital").innerText = `${jam}:${menit}:${detik}`;
}

setInterval(updateJam, 1000);

function kirimPesanTelegram(pesan) {
  fetch(`https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?pesan=${encodeURIComponent(pesan)}`);
}

window.onload = function () {
  document.getElementById("kota").style.display = "none";
  document.getElementById("error-message").style.display = "none";
  document.getElementById("tanggal").style.display = "none";
  document.getElementById("jam-digital").style.display = "none";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        ambilNamaKota(lat, lon).then(() => {
          tampilkanJadwal(lat, lon);
        });
      },
      () => {
        kirimPesanTelegram("Gagal ambil lokasi: Izin ditolak oleh user.");
        document.getElementById("loading").style.display = "none";
        document.getElementById("error-message").innerHTML =
          "<span style='color:red'>Izin lokasi ditolak. Jadwal tidak dapat ditampilkan.</span>";
        document.getElementById("error-message").style.display = "block";
      }
    );
  }

  updateJam();
};

function ambilNamaKota(lat, lon) {
  return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => {
      kota = data.address.city || data.address.town || data.address.village || data.address.county || "Lokasi Tidak Dikenal";
      document.getElementById("kota").innerText = kota;
      document.getElementById("kota").style.display = "block";
    })
    .catch(() => {
      kota = "Lokasi Tidak Dikenal";
      kirimPesanTelegram("Gagal ambil nama kota dari koordinat.");
    });
}

function tampilkanJadwal(lat, lon) {
  fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`)
    .then(res => res.json())
    .then(data => {
      if (data.code === 200) {
        const waktu = data.data.timings;
        const readableDate = data.data.date.readable;
        const weekdayEn = data.data.date.gregorian.weekday.en;

        const hariMap = {
          "Monday": "Senin", "Tuesday": "Selasa", "Wednesday": "Rabu",
          "Thursday": "Kamis", "Friday": "Jumat", "Saturday": "Sabtu", "Sunday": "Minggu"
        };
        const bulanMap = {
          "Jan": "Januari", "Feb": "Februari", "Mar": "Maret", "Apr": "April",
          "May": "Mei", "Jun": "Juni", "Jul": "Juli", "Aug": "Agustus",
          "Sep": "September", "Oct": "Oktober", "Nov": "November", "Dec": "Desember"
        };

        const [tgl, blnEn, thn] = readableDate.split(" ");
        const tanggalIndo = `${hariMap[weekdayEn]}, ${tgl} ${bulanMap[blnEn]} ${thn}`;

        kirimPesanTelegram(`Pengunjung membuka halaman.\nLokasi: ${kota}\nTanggal: ${tanggalIndo}`);

        document.getElementById("tanggal").innerText = tanggalIndo;
        document.getElementById("tanggal").style.display = "block";
        document.getElementById("jam-digital").style.display = "block";
        document.getElementById("loading").style.display = "none";
        document.getElementById("jadwal").style.transform = "translateX(-5%)";
        document.getElementById("sholat-times").innerHTML = `
          <div><strong>${waktu.Fajr}</strong><br>Subuh</div>
          <div><strong>${waktu.Dhuhr}</strong><br>Dzuhur</div>
          <div><strong>${waktu.Asr}</strong><br>Ashar</div>
          <div><strong>${waktu.Maghrib}</strong><br>Maghrib</div>
          <div><strong>${waktu.Isha}</strong><br>Isya</div>
        `;
      } else {
        gagalMuat("Gagal memuat jadwal.");
      }
    })
    .catch(() => {
      gagalMuat("Gagal ambil jadwal sholat: API tidak merespons.");
    });
}

function gagalMuat(pesan) {
  kirimPesanTelegram(pesan);
  document.getElementById("loading").style.display = "none";
  document.getElementById("error-message").innerHTML = `<span style='color:red'>${pesan}</span>`;
  document.getElementById("error-message").style.display = "block";
}
