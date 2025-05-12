window.onload = function() {
    function ambilNamaKota(lat, lon) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {
          const kota = data.address.city || data.address.town || data.address.village || data.address.county || "Lokasi Tidak Dikenal";
          document.getElementById("kota").innerText = `Lokasi: ${kota}`;
        })
        .catch(() => {
          document.getElementById("kota").innerText = "Lokasi tidak ditemukan.";
        });
    }

  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          tampilkanJadwal(lat, lon);
          ambilNamaKota(lat, lon);
         },
        () => {
          document.getElementById("tanggal").innerHTML =
            "<span style='color:red'>Izin lokasi ditolak. Jadwal tidak dapat ditampilkan.</span>";
        }
      );
  }
}

function tampilkanJadwal(lat, lon) {
    fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`)
        .then(res => res.json())
        .then(data => {
        if (data.code === 200) {
            const waktu = data.data.timings;
            const date = data.data.date.readable;
            document.getElementById("tanggal").innerText = date;

            document.getElementById("sholat-times").innerHTML = `
             <div><strong>${waktu.Fajr}</strong><br>Subuh</div>
             <div><strong>${waktu.Dhuhr}</strong><br>Dzuhur</div>
             <div><strong>${waktu.Asr}</strong><br>Ashar</div>
             <div><strong>${waktu.Maghrib}</strong><br>Maghrib</div>
             <div><strong>${waktu.Isha}</strong><br>Isya</div>
             `;
        } else {
            document.getElementById("tanggal").innerHTML =
             "<span style='color:red'>Gagal memuat jadwal.</span>";
         }
      })
       .catch(() => {
        document.getElementById("tanggal").innerHTML =
          "<span style='color:red'>Tidak dapat terhubung ke server.</span>";
    });
}
