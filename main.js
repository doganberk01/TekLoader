const { app, BrowserWindow, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

// Pencere referansı
let mainWindow;

// ===== AYARLAR SİSTEMİ =====
// Varsayılan ayarlar
const defaultSettings = {
    theme: 'dark',            // Varsayılan koyu tema
    language: 'tr',           // Varsayılan dil (Türkçe)
    notifications: true,      // İndirme bildirimleri
    saveHistory: false,       // İndirme geçmişi kaydet (varsayılan kapalı)
    downloadPath: ''          // Varsayılan indirme yolu (boşsa Downloads)
};

// userData klasör yolu
function getUserDataPath() {
    return app.getPath('userData');
}

// Ayarları oku
function loadSettings() {
    const settingsPath = path.join(getUserDataPath(), 'settings.json');
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            return { ...defaultSettings, ...JSON.parse(data) };
        }
    } catch (err) {
        console.error('Ayarlar okunamadı:', err);
    }
    return { ...defaultSettings };
}

// Ayarları kaydet
function saveSettings(settings) {
    const settingsPath = path.join(getUserDataPath(), 'settings.json');
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Ayarlar kaydedilemedi:', err);
        return false;
    }
}

// Geçmişi oku
function loadHistory() {
    const historyPath = path.join(getUserDataPath(), 'history.json');
    try {
        if (fs.existsSync(historyPath)) {
            const data = fs.readFileSync(historyPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Geçmiş okunamadı:', err);
    }
    return [];
}

// Geçmişe ekle
function addToHistory(item) {
    const settings = loadSettings();
    if (!settings.saveHistory) return false;

    const historyPath = path.join(getUserDataPath(), 'history.json');
    try {
        const history = loadHistory();
        history.unshift({
            ...item,
            date: new Date().toISOString()
        });
        // Son 100 kayıt tut
        const trimmedHistory = history.slice(0, 100);
        fs.writeFileSync(historyPath, JSON.stringify(trimmedHistory, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Geçmişe eklenemedi:', err);
        return false;
    }
}

// Geçmişi temizle
function clearHistory() {
    const historyPath = path.join(getUserDataPath(), 'history.json');
    try {
        fs.writeFileSync(historyPath, '[]', 'utf8');
        return true;
    } catch (err) {
        console.error('Geçmiş temizlenemedi:', err);
        return false;
    }
}

// Bildirim gönder
function sendNotification(title, body) {
    const settings = loadSettings();
    if (!settings.notifications) return;

    if (Notification.isSupported()) {
        new Notification({ title, body }).show();
    }
}

// Uygulama hazır olduğunda
app.whenReady().then(() => {
    // Windows bildirimlerinde ve Görev Yöneticisinde uygulama adının görünmesi için
    app.setAppUserModelId('TekLoader');

    // Görev yöneticisinde doğru isim görünsün
    if (process.platform === 'win32') {
        app.setName('TekLoader');
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Tüm pencereler kapandığında uygulamayı kapat
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Ana pencereyi oluştur
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 700,
        minHeight: 500,
        title: 'TekLoader',
        frame: false, // Özel başlık çubuğu için
        backgroundColor: '#1D1616',
        show: false, // Hazır olana kadar gösterme (siyah ekran sorunu için)
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: path.join(__dirname, 'assets', 'icons', 'icon.ico')
    });

    // İçerik hazır olduğunda pencereyi göster
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

// ===== IPC HANDLERS =====

// Pencere kontrolleri
ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});
ipcMain.on('window-close', () => mainWindow.close());

// Klasör seçimi
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    return result.canceled ? null : result.filePaths[0];
});

// Varsayılan indirme klasörü
ipcMain.handle('get-downloads-path', () => {
    return app.getPath('downloads');
});

// Dosya konumunu aç
ipcMain.on('open-file-location', (event, filePath) => {
    shell.showItemInFolder(filePath);
});

// ===== AYARLAR IPC HANDLERS =====

// Ayarları getir
ipcMain.handle('get-settings', () => {
    return loadSettings();
});

// Ayarları kaydet
ipcMain.handle('save-settings', (event, settings) => {
    return saveSettings(settings);
});

// Geçmişi getir
ipcMain.handle('get-history', () => {
    return loadHistory();
});

// Geçmişi temizle
ipcMain.handle('clear-history', () => {
    return clearHistory();
});

// Geçmişe ekle
ipcMain.handle('add-to-history', (event, item) => {
    return addToHistory(item);
});

// Bildirim gönder
ipcMain.handle('send-notification', (event, { title, body }) => {
    sendNotification(title, body);
    return true;
});

// İndirme motoru versiyonu al
ipcMain.handle('get-engine-version', async () => {
    return new Promise((resolve) => {
        const ytdlp = getBinPath('yt-dlp.exe');
        const process = spawn(ytdlp, ['--version']);
        let output = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.on('close', () => {
            resolve(output.trim() || 'Bilinmiyor');
        });

        process.on('error', () => {
            resolve('Bilinmiyor');
        });
    });
});

// İndirme motorunu güncelle
ipcMain.handle('update-engine', async () => {
    return new Promise((resolve) => {
        const ytdlp = getBinPath('yt-dlp.exe');
        const process = spawn(ytdlp, ['-U']);
        let output = '';
        let error = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            error += data.toString();
        });

        process.on('close', (code) => {
            const fullOutput = output + error;

            if (code === 0) {
                // Zaten güncel mi kontrol et
                if (fullOutput.includes('is up to date') || fullOutput.includes('up-to-date') || fullOutput.includes('is up-to-date')) {
                    resolve({ success: true, updated: false, message: 'Güncelsiniz! ✓' });
                } else {
                    resolve({ success: true, updated: true, message: 'Güncelleme tamamlandı! ✓' });
                }
            } else {
                resolve({ success: false, message: 'Güncelleme başarısız' });
            }
        });

        process.on('error', (err) => {
            resolve({ success: false, message: err.message });
        });
    });
});

// yt-dlp ve ffmpeg yolları
ipcMain.handle('get-bin-paths', () => {
    return {
        ytdlp: getBinPath('yt-dlp.exe'),
        ffmpeg: getBinPath('ffmpeg.exe')
    };
});

// ===== YT-DLP İŞLEMLERİ =====
const { spawn } = require('child_process');

// Aktif indirme işlemi
let downloadProcess = null;

// Binary yolunu al
function getBinPath(name) {
    const isDev = !app.isPackaged;
    const basePath = isDev
        ? path.join(__dirname, 'assets', 'bin')
        : path.join(process.resourcesPath, 'bin');
    return path.join(basePath, name);
}

// URL'nin playlist olup olmadığını kontrol et
function isPlaylistUrl(url) {
    return url.includes('playlist?list=') || (url.includes('list=') && !url.includes('watch?v='));
}

// Video bilgisi al
ipcMain.handle('search-youtube', async (event, query) => {
    return new Promise((resolve, reject) => {
        const ytdlp = getBinPath('yt-dlp.exe');
        // 20 sonuç getir, JSON dökümü al, playlist olarak düzleştir (hızlı)
        const args = [
            '--dump-json',
            '--flat-playlist',
            '--no-warnings',
            '--ignore-errors',
            '--no-check-certificate',    // Performans: SSL kontrolünü atla
            '--socket-timeout', '10',    // Performans: 10 saniye bağlantı zaman aşımı
            `ytsearch20:${query}`
        ];

        const process = spawn(ytdlp, args);
        let output = '';
        let error = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            error += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0 || output.trim()) {
                try {
                    // Her satır bir video JSON nesnesi
                    const lines = output.trim().split('\n').filter(line => line.trim());
                    const videos = lines.map(line => {
                        try {
                            const v = JSON.parse(line);
                            return {
                                id: v.id,
                                title: v.title,
                                channel: v.uploader || v.channel || 'Bilinmeyen Kanal',
                                duration: v.duration,
                                view_count: v.view_count, // Bazı durumlarda gelmeyebilir
                                upload_date: v.upload_date,
                                thumbnail: v.thumbnails?.[0]?.url || v.thumbnail || '',
                                url: v.url || `https://www.youtube.com/watch?v=${v.id}`
                            };
                        } catch {
                            return null;
                        }
                    }).filter(v => v !== null);

                    resolve(videos);
                } catch (e) {
                    reject(new Error('Arama sonuçları ayrıştırılamadı: ' + e.message));
                }
            } else {
                reject(new Error(error || 'Arama yapılamadı'));
            }
        });
    });
});

ipcMain.handle('get-video-info', async (event, url) => {
    return new Promise((resolve, reject) => {
        const ytdlp = getBinPath('yt-dlp.exe');
        const isPlaylist = isPlaylistUrl(url);

        const args = [
            '--dump-json',
            '--no-warnings',
            '--ignore-errors',
            '--skip-download',           // Performans: indirme işlemini atla
            '--no-check-certificate',    // Performans: SSL kontrolünü atla
            '--socket-timeout', '10'     // Performans: 10 saniye bağlantı zaman aşımı
        ];

        // Playlist ise flat extraction kullan
        if (isPlaylist) {
            args.push('--flat-playlist');
        } else {
            args.push('--no-playlist');
        }

        args.push(url);

        const process = spawn(ytdlp, args);
        let output = '';
        let error = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            error += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0 || output.trim()) {
                try {
                    if (isPlaylist) {
                        // Playlist: Her satır bir video JSON'ı
                        const lines = output.trim().split('\n').filter(line => line.trim());
                        const videos = lines.map(line => {
                            try {
                                return JSON.parse(line);
                            } catch {
                                return null;
                            }
                        }).filter(v => v !== null);

                        if (videos.length === 0) {
                            reject(new Error('Playlist videoları alınamadı'));
                            return;
                        }

                        // İlk video bilgilerinden playlist bilgisi oluştur
                        const firstVideo = videos[0];
                        resolve({
                            isPlaylist: true,
                            title: firstVideo.playlist_title || 'Playlist',
                            channel: firstVideo.playlist_uploader || firstVideo.uploader || 'Bilinmeyen',
                            videoCount: videos.length,
                            videos: videos.map(v => ({
                                id: v.id || v.url,
                                title: v.title,
                                duration: v.duration,
                                url: v.url || `https://www.youtube.com/watch?v=${v.id}`
                            })),
                            thumbnail: firstVideo.thumbnails?.[0]?.url || firstVideo.thumbnail || ''
                        });
                    } else {
                        // Tekli video
                        const info = JSON.parse(output);
                        resolve({
                            isPlaylist: false,
                            title: info.title,
                            channel: info.uploader || info.channel,
                            duration: info.duration,
                            thumbnail: info.thumbnail,
                            views: info.view_count,
                            likes: info.like_count,
                            formats: info.formats
                        });
                    }
                } catch (e) {
                    reject(new Error('Video bilgisi ayrıştırılamadı: ' + e.message));
                }
            } else {
                reject(new Error(error || 'Video bilgisi alınamadı'));
            }
        });
    });
});

// Video indir (tekli veya playlist)
ipcMain.handle('download-video', async (event, options) => {
    return new Promise((resolve, reject) => {
        const ytdlp = getBinPath('yt-dlp.exe');
        const ffmpeg = getBinPath('ffmpeg.exe');

        // Playlist için output template farklı
        const isPlaylist = options.isPlaylist || false;
        const useNumbers = options.useNumbers !== false; // Varsayılan true
        let outputTemplate;

        if (isPlaylist) {
            // Playlist: klasör oluştur
            if (useNumbers) {
                outputTemplate = path.join(options.outputPath, options.playlistName || 'Playlist', '%(playlist_index)s - %(title)s.%(ext)s');
            } else {
                outputTemplate = path.join(options.outputPath, options.playlistName || 'Playlist', '%(title)s.%(ext)s');
            }
        } else {
            outputTemplate = path.join(options.outputPath, options.filename);
        }

        let args = [
            '-o', outputTemplate,
            '--ffmpeg-location', ffmpeg,
            '--newline',
            '--progress',
            '--no-warnings',
            '--ignore-errors',
            '--concurrent-fragments', '4'  // Performans: 4 paralel segment indirme
        ];

        // Seçili playlist öğeleri
        if (options.playlistItems) {
            args.push('--playlist-items', options.playlistItems);
        }

        // MP3 Metadata ve Altyazı
        if (options.format === 'audio') {
            args.push(
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '0',
                '--embed-thumbnail',
                '--add-metadata'
            );
        } else {
            if (options.quality === 'best') {
                args.push('-f', 'bestvideo+bestaudio/best');
            } else {
                args.push('-f', `bestvideo[height<=${options.quality}]+bestaudio/best[height<=${options.quality}]/best`);
            }
            args.push('--merge-output-format', 'mp4');
            // Ses codec'ini AAC'ye dönüştür (Windows uyumluluğu için)
            args.push('--postprocessor-args', 'ffmpeg:-c:a aac -b:a 192k');
        }

        args.push(options.url);

        downloadProcess = spawn(ytdlp, args);
        downloadCancelled = false;
        let currentVideo = '';

        downloadProcess.stdout.on('data', (data) => {
            const line = data.toString();

            const destMatch = line.match(/\[download\] Destination: (.+)/);
            if (destMatch) {
                currentVideo = path.basename(destMatch[1]);
            }

            const progress = parseProgress(line, isPlaylist, currentVideo);
            if (progress) {
                mainWindow.webContents.send('download-progress', progress);
            }
        });

        downloadProcess.stderr.on('data', (data) => {
            console.error('yt-dlp error:', data.toString());
        });

        downloadProcess.on('close', (code) => {
            downloadProcess = null;
            if (downloadCancelled) {
                reject(new Error('İndirme iptal edildi'));
            } else if (code === 0) {
                const resultPath = isPlaylist
                    ? path.join(options.outputPath, options.playlistName || 'Playlist')
                    : outputTemplate;
                resolve({ success: true, filePath: resultPath });
            } else {
                reject(new Error('İndirme başarısız oldu'));
            }
        });
    });
});

// Tek video indir (playlist'ten seçili)
ipcMain.handle('download-single-video', async (event, options) => {
    return new Promise((resolve, reject) => {
        const ytdlp = getBinPath('yt-dlp.exe');
        const ffmpeg = getBinPath('ffmpeg.exe');

        // Klasör yoksa oluştur
        if (!fs.existsSync(options.outputPath)) {
            fs.mkdirSync(options.outputPath, { recursive: true });
        }

        const outputTemplate = path.join(options.outputPath, options.filename);

        let args = [
            '-o', outputTemplate,
            '--ffmpeg-location', ffmpeg,
            '--newline',
            '--progress',
            '--no-warnings',
            '--no-playlist', // Tek video indir
            '--concurrent-fragments', '4'  // Performans: 4 paralel segment indirme
        ];

        if (options.format === 'audio') {
            args.push(
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '0',
                '--embed-thumbnail',
                '--add-metadata'
            );
        } else {
            if (options.quality === 'best') {
                args.push('-f', 'bestvideo+bestaudio/best');
            } else {
                args.push('-f', `bestvideo[height<=${options.quality}]+bestaudio/best[height<=${options.quality}]/best`);
            }
            args.push('--merge-output-format', 'mp4');
            // Ses codec'ini AAC'ye dönüştür (Windows uyumluluğu için)
            args.push('--postprocessor-args', 'ffmpeg:-c:a aac -b:a 192k');
        }

        args.push(options.url);

        downloadProcess = spawn(ytdlp, args);
        downloadCancelled = false;

        downloadProcess.stdout.on('data', (data) => {
            const line = data.toString();
            const progress = parseProgress(line, false, options.filename);
            if (progress) {
                progress.videoIndex = options.videoIndex;
                mainWindow.webContents.send('download-progress', progress);
            }
        });

        downloadProcess.stderr.on('data', (data) => {
            console.error('yt-dlp error:', data.toString());
        });

        downloadProcess.on('close', (code) => {
            downloadProcess = null;
            if (downloadCancelled) {
                reject(new Error('İndirme iptal edildi'));
            } else if (code === 0) {
                resolve({ success: true, filePath: outputTemplate, videoIndex: options.videoIndex });
            } else {
                reject(new Error('Video indirilemedi'));
            }
        });
    });
});

// İndirme iptal flag'i
let downloadCancelled = false;

// İndirmeyi iptal et
ipcMain.on('cancel-download', () => {
    downloadCancelled = true;
    if (downloadProcess) {
        // Windows'ta SIGTERM düzgün çalışmaz, taskkill kullan
        const pid = downloadProcess.pid;
        try {
            // Process tree'yi tamamen öldür (ffmpeg dahil)
            spawn('taskkill', ['/F', '/T', '/PID', pid.toString()]);
        } catch (e) {
            // Fallback: normal kill
            downloadProcess.kill();
        }
        downloadProcess = null;
    }
});

// İlerleme çıktısını ayrıştır
function parseProgress(line, isPlaylist = false, currentVideo = '') {
    // [download]  45.2% of 50.00MiB at 2.50MiB/s ETA 00:15
    const percentMatch = line.match(/(\d+\.?\d*)%/);
    const speedMatch = line.match(/at\s+([\d.]+\w+\/s)/);
    const etaMatch = line.match(/ETA\s+(\d+:\d+)/);

    // Playlist item bilgisi: [download] Downloading item 1 of 10
    const playlistItemMatch = line.match(/Downloading item (\d+) of (\d+)/);

    if (playlistItemMatch) {
        return {
            status: `Video ${playlistItemMatch[1]}/${playlistItemMatch[2]} indiriliyor...`,
            playlistCurrent: parseInt(playlistItemMatch[1]),
            playlistTotal: parseInt(playlistItemMatch[2])
        };
    }

    if (percentMatch) {
        let status = 'İndiriliyor...';
        if (isPlaylist && currentVideo) {
            status = `İndiriliyor: ${currentVideo.substring(0, 40)}...`;
        }
        return {
            percent: parseFloat(percentMatch[1]),
            speed: speedMatch ? speedMatch[1] : '',
            eta: etaMatch ? etaMatch[1] : '',
            status: status
        };
    }

    if (line.includes('[Merger]') || line.includes('Merging')) {
        return { status: 'Birleştiriliyor...', percent: 99 };
    }

    if (line.includes('[ExtractAudio]')) {
        return { status: 'Ses çıkarılıyor...', percent: 95 };
    }

    return null;
}
