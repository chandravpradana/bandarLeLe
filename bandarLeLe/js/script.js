// Fungsi toggle tema
const themeSwitch = document.getElementById('themeSwitch');
const themeLabel = document.getElementById('theme-label');

themeSwitch.addEventListener('change', function() {
    document.body.classList.toggle('light-theme');
    if(document.body.classList.contains('light-theme')) {
        themeLabel.textContent = 'Mode Terang';
    } else {
        themeLabel.textContent = 'Mode Gelap';
    }
    
    // Simpan preferensi tema
    localStorage.setItem('theme', this.checked ? 'light' : 'dark');
});

// Cek preferensi tema yang disimpan
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
    themeSwitch.checked = true;
    themeLabel.textContent = 'Mode Terang';
}

// Fungsi untuk pelaporan pakan
document.querySelector('.feed-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const kolam = document.getElementById('kolam').value;
    const tanggal = document.getElementById('tanggal').value;
    const waktu = document.getElementById('waktu').value;
    const jenisPakan = document.getElementById('jenis-pakan').value;
    const jumlah = document.getElementById('jumlah').value;
    const pelaksana = document.getElementById('pelaksana').value;

    const kolamText = document.querySelector('#kolam option:checked').textContent;
    const jenisPakanText = document.querySelector('#jenis-pakan option:checked').textContent;
    const pelaksanaText = document.querySelector('#pelaksana option:checked').textContent;

    // 1. Tambah ke Riwayat Tabel
    const tableBody = document.querySelector('.history-table tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${tanggal}</td>
        <td>${waktu}</td>
        <td>${kolamText}</td>
        <td>${jenisPakanText}</td>
        <td>${jumlah}</td>
        <td>${pelaksanaText}</td>
        <td><span class="status status-selesai">Terkirim</span></td>
    `;
    tableBody.insertBefore(newRow, tableBody.firstChild);

    // 2. Kirim ke Telegram
    const botToken = '8190460652:AAHu2L_0O_jzTJmxBo4mkQTSERPZYAmghjI';
    const chatId = '-1002637747100';
    const message = `
📋 *LAPORAN PAKAN TERKIRIM* 

📅 Tanggal: ${tanggal}
⏰ Waktu: ${waktu}
🏞️ Kolam: ${kolamText}
🍽️ Jenis Pakan: ${jenisPakanText}
⚖️ Jumlah: ${jumlah} gram
👤 Pelaksana: ${pelaksanaText}

✅ Laporan berhasil disimpan!
`;

    // Kirim pesan ke Telegram menggunakan bot
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Pesan Telegram terkirim:', data);
    })
    .catch(error => {
        console.error('Error mengirim ke Telegram:', error);
        
        // Tampilkan notifikasi error jika pengiriman gagal
        const errorNotification = document.createElement('div');
        errorNotification.innerHTML = `
            <div style="position:fixed; top:20px; right:20px; padding:15px 25px; background:#f44336; color:white; border-radius:8px; box-shadow:0 5px 15px rgba(0,0,0,0.2); z-index:2000; animation:slideIn 0.5s ease, fadeOut 0.5s ease 2.5s forwards;">
                <i class="fas fa-exclamation-triangle"></i> Gagal mengirim ke Telegram!
            </div>
        `;
        document.body.appendChild(errorNotification);
        setTimeout(() => { errorNotification.remove(); }, 3000);
    });

    // 3. Kirim ke Google Sheets
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzdmaPANNCtJRYIZzK0Mk49YSqQWD257saYJ8E537TQnPNPQl-ECjsE6SObpI3I1i6gAA/exec';
    fetch(scriptURL, { 
        method: 'POST', 
        body: new FormData(this)
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        console.log('Data berhasil dikirim ke Google Sheets');
    })
    .catch(error => {
        console.error('Error mengirim ke Google Sheets:', error);
        const errorNotification = document.createElement('div');
        errorNotification.innerHTML = `
            <div style="position:fixed; top:70px; right:20px; padding:15px 25px; background:#f44336; color:white; border-radius:8px; box-shadow:0 5px 15px rgba(0,0,0,0.2); z-index:2000; animation:slideIn 0.5s ease, fadeOut 0.5s ease 2.5s forwards;">
                <i class="fas fa-exclamation-triangle"></i> Gagal mengirim ke Google Sheets!
            </div>
        `;
        document.body.appendChild(errorNotification);
        setTimeout(() => { errorNotification.remove(); }, 3000);
    });

    // 4. Notifikasi di layar
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="position:fixed; top:20px; right:20px; padding:15px 25px; background:var(--accent-color); color:#111; border-radius:8px; box-shadow:0 5px 15px rgba(0,0,0,0.2); z-index:2000; animation:slideIn 0.5s ease, fadeOut 0.5s ease 2.5s forwards;">
            <i class="fas fa-check-circle"></i> Laporan pakan untuk ${kolamText} berhasil dikirim!
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => { notification.remove(); }, 3000);

    // Reset form
    this.reset();
    setDefaultDateTime();
    
    // Update statistik
    updateStats();
});

// Set tanggal dan waktu default
function setDefaultDateTime() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    document.getElementById('tanggal').value = dateStr;
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    document.getElementById('waktu').value = timeStr;
}

// Set tanggal dan waktu saat halaman dimuat
setDefaultDateTime();

// Efek scroll navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Fungsi untuk mengupdate statistik
function updateStats() {
    const reportCount = document.querySelectorAll('.history-table tbody tr').length;
    document.querySelector('.stat-card:nth-child(2) h3').textContent = reportCount;
    
    // Hitung total pakan (dalam gram)
    const tableRows = document.querySelectorAll('.history-table tbody tr');
    let totalFeed = 0;
    
    tableRows.forEach(row => {
        const feedAmount = parseInt(row.cells[4].textContent);
        if (!isNaN(feedAmount)) {
            totalFeed += feedAmount;
        }
    });
    
    // Konversi ke kg dengan 1 desimal
    const totalKg = (totalFeed / 1000).toFixed(1);
    document.querySelector('.stat-card:nth-child(3) h3').textContent = `${totalKg} Kg`;
}

// Inisialisasi statistik saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
});