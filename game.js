let secretNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

function checkGuess() {
    const guess = document.getElementById('guess').value;
    attempts++;

    if (guess == secretNumber) {
        document.getElementById('result').textContent = `Selamat! Kamu menebak dengan benar. Angka yang benar adalah ${secretNumber}.`;
        document.getElementById('attempts').textContent = `Percobaan: ${attempts}`;
    } else if (guess < secretNumber) {
        document.getElementById('result').textContent = 'Tebakanmu terlalu rendah!';
    } else if (guess > secretNumber) {
        document.getElementById('result').textContent = 'Tebakanmu terlalu tinggi!';
    }

    document.getElementById('attempts').textContent = `Percobaan: ${attempts}`;
}
