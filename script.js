const lagu = document.getElementById("myTrack");
const glow = document.getElementById("glow");

let audioContext;
let analyzer;
let source;
let dataArray;

function setupVisualizer() {
    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyzer = audioContext.createAnalyser();
    
    // Mengambil sumber suara dari elemen audio
    source = audioContext.createMediaElementSource(lagu);

    // MENGHUBUNGKAN KABEL:
    // 1. Ke Analyzer untuk baca bass
    source.connect(analyzer);
    // 2. Ke Destination agar suara terdengar di speaker
    source.connect(audioContext.destination);

    // Pengaturan sensitivitas (semakin kecil angkanya, semakin responsif)
    analyzer.fftSize = 64; 
    analyzer.smoothingTimeConstant = 0.8;

    const bufferLength = analyzer.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    animateGlow();
}

function animateGlow() {
    requestAnimationFrame(animateGlow);
    analyzer.getByteFrequencyData(dataArray);

    // Ambil Bass di indeks awal (biasanya 0-4)
    // Kita ambil rata-rata sedikit agar lebih stabil tapi tetap peka
    let bass = dataArray[1] + dataArray[2] + dataArray[3];
    bass = bass / 3; 

    // KALIBRASI DISINI:
    // Semakin kecil pembagi (misal 150), semakin besar getarannya
    let scale = 0.9 + (bass / 150); 
    
    // Semakin kecil pembagi di opacity, semakin terang lampunya
    let brightness = 0.2 + (bass / 180);

    glow.style.transform = `scale(${scale})`;
    glow.style.opacity = brightness;
    
    // Membuat warna RGB berputar lebih cepat mengikuti dentuman
    glow.style.background = `hue-rotate(${bass * 1.5}deg)`;
}
lagu.ontimeupdate = function() {
    const curDisplay = document.getElementById("currentTime");
    const durDisplay = document.getElementById("durationTime");
    const progressInput = document.querySelector(".progress-bar"); // Pakai selector class sesuai HTML kamu

    // 1. Jalankan Angka Waktu (Menit:Detik)
    let curMins = Math.floor(lagu.currentTime / 60);
    let curSecs = Math.floor(lagu.currentTime % 60);
    if (curSecs < 10) curSecs = "0" + curSecs;
    curDisplay.innerText = `${curMins}:${curSecs}`;

    // 2. Jalankan Progress Bar (Garis Putih)
    if (lagu.duration) {
        let percentage = (lagu.currentTime / lagu.duration) * 100;
        progressInput.value = percentage; // Ini akan menggerakkan bulatan slider kamu

        // Hitung total durasi
        let durMins = Math.floor(lagu.duration / 60);
        let durSecs = Math.floor(lagu.duration % 60);
        if (durSecs < 10) durSecs = "0" + durSecs;
        durDisplay.innerText = `${durMins}:${durSecs}`;
    }
};
function togglePlay() {
    // Kita ambil tombolnya pakai Selector karena di HTML kamu pakainya Class
    const tombol = document.querySelector(".btn-play");
    
    if (lagu.paused) {
        if (!audioContext) {
            setupVisualizer();
        }
        audioContext.resume();
        lagu.play();
        // Ganti teks atau ikon tombol saat diputar
        tombol.innerText = "II"; 
    } else {
        lagu.pause();
        tombol.innerText = "▶";
    }
}