function updateJam() {
    const now = new Date();
    const jam = now.getHours().toString().padStart(2, '0');
    const menit = now.getMinutes().toString().padStart(2, '0');
    const detik = now.getSeconds().toString().padStart(2, '0');
    document.getElementById("jam-digital").innerText = `${jam}:${menit}:${detik}`;
}

setInterval(updateJam, 1000);

function kirimPesanTelegram(pesan) {
    fetch(`https://script.google.com/macros/s/AKfycbzF9PEMsGd-RBRfo3ym6Zbaii5-lckSXGmAoepevRu6xFApFtzR3GQwtyTo2TmKHYi-Zg/exec?pesan=${encodeURIComponent(pesan)}`);
}

window.onload = function() {
    document.getElementById("kota").style.display = "none";
    document.getElementById("error-message").style.display = "none";
    document.getElementById("tanggal").style.display = "none";
    document.getElementById("jam-digital").style.display = "none";
    
    function ambilNamaKota(lat, lon) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
            .then(res => res.json())
            .then(data => {
                const kota = data.address.city || data.address.town || data.address.village || data.address.county || "Lokasi Tidak Dikenal";
                document.getElementById("kota").innerText = `${kota}`;
            })
            .catch(() => {
                kirimPesanTelegram("Gagal ambil nama kota dari koordinat (reverse geocoding).");
                document.getElementById("loading").style.display = "none";
                document.getElementById("error-message").innerText =
                    "<span style='color:red'>Gagal memuat jadwal.</span>";"Lokasi tidak ditemukan.";
                document.getElementById("error-message").style.display = "block";
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
                kirimPesanTelegram("Gagal ambil lokasi: Izin ditolak oleh user.");
                document.getElementById("loading").style.display = "none";
                document.getElementById("error-message").innerHTML =
                    "<span style='color:red'>Izin lokasi ditolak. Jadwal tidak dapat ditampilkan.</span>";
                document.getElementById("error-message").style.display = "block";
            }
        );
    }
    updateJam();
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
              "Monday": "Senin",
              "Tuesday": "Selasa",
              "Wednesday": "Rabu",
              "Thursday": "Kamis",
              "Friday": "Jumat",
              "Saturday": "Sabtu",
              "Sunday": "Minggu"
            };

            const bulanMap = {
              "Jan": "Januari", "Feb": "Februari", "Mar": "Maret", "Apr": "April",
              "May": "Mei", "Jun": "Juni", "Jul": "Juli", "Aug": "Agustus",
              "Sep": "September", "Oct": "Oktober", "Nov": "November", "Dec": "Desember"
            };

            const [tgl, blnEn, thn] = readableDate.split(" ");
            const tanggalIndo = `${hariMap[weekdayEn]}, ${tgl} ${bulanMap[blnEn]} ${thn}`;
            kirimPesanTelegram(`Pengunjung membuka halaman. Lokasi: ${kota}\nTanggal: ${tanggalIndo}`);
            document.getElementById("jadwal").style.transform = "translateX(-5%)";
            document.getElementById("loading").style.display = "none";
            document.getElementById("kota").style.display = "block";
            document.getElementById("tanggal").innerText = tanggalIndo;
            document.getElementById("tanggal").style.display = "block";
            document.getElementById("jam-digital").style.display = "block";
            document.getElementById("sholat-times").innerHTML = `
                <div><strong>${waktu.Fajr}</strong><br>Subuh</div>
                <div><strong>${waktu.Dhuhr}</strong><br>Dzuhur</div>
                <div><strong>${waktu.Asr}</strong><br>Ashar</div>
                <div><strong>${waktu.Maghrib}</strong><br>Maghrib</div>
                <div><strong>${waktu.Isha}</strong><br>Isya</div>
                `;
        } else {
            kirimPesanTelegram("Gagal memuat jadwal.");
            document.getElementById("loading").style.display = "none";
            document.getElementById("error-message").innerHTML =
                "<span style='color:red'>Gagal memuat jadwal.</span>";
            document.getElementById("error-message").style.display = "block";
        }
        })
        .catch(() => {
            kirimPesanTelegram("Gagal ambil jadwal sholat: API tidak merespons.");
            document.getElementById("loading").style.display = "none";
            document.getElementById("error-message").innerHTML =
                "<span style='color:red'>Tidak dapat terhubung ke server.</span>";
            document.getElementById("error-message").style.display = "block";
        });
}
