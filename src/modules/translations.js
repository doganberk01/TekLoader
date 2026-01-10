// ===== ÇEVİRİ SİSTEMİ =====
// Çoklu dil desteği - Modüler yapı

export const translations = {
    tr: {
        // Genel
        appTitle: 'TekLoader',

        // Mod butonları
        urlMode: 'URL',
        searchMode: 'YouTube Ara',

        // URL giriş
        urlPlaceholder: 'Video URL yapıştır...',
        searchPlaceholder: 'YouTube\'da ara...',

        // Format ve kalite
        format: 'Format',
        quality: 'Kalite',
        bestQuality: 'En İyi',
        numberedFilename: 'Numaralı dosya adı',

        // Video bilgisi
        views: 'görüntüleme',
        likes: 'beğeni',
        videos: 'video',

        // Playlist
        videosSelected: 'video seçili',
        selectAll: 'Tümünü Seç',
        deselectAll: 'Tümünü Kaldır',
        completed: 'tamamlandı',

        // İndirme durumu
        downloading: 'İndiriliyor...',
        merging: 'Birleştiriliyor...',
        extractingAudio: 'Ses çıkarılıyor...',
        downloadComplete: 'İndirme tamamlandı!',
        downloadCancelled: 'İndirme iptal edildi',
        downloadFailed: 'İndirme başarısız',

        // Footer
        changeFolder: 'Klasör Değiştir',
        download: 'İndir',
        settings: 'Ayarlar',
        openFolder: 'Klasörü Aç',

        // Ayarlar
        settingsTitle: 'Ayarlar',
        general: 'Genel',
        history: 'Geçmiş',
        about: 'Hakkında',

        // Tema
        theme: 'Tema',
        dark: 'Koyu',
        light: 'Açık',

        // Dil
        language: 'Dil',

        // Bildirimler
        notifications: 'Bildirimler',
        notifyOnComplete: 'İndirme tamamlandığında bildir',

        // Geçmiş
        downloadHistory: 'İndirme Geçmişi',
        saveHistory: 'Geçmişi kaydet',
        records: 'kayıt',
        clearHistory: 'Geçmişi Temizle',
        noHistory: 'Henüz indirme geçmişi yok',

        // Hakkında
        version: 'Versiyon',
        description: 'Çoklu platform video ve müzik indirme uygulaması',
        features: {
            platforms: 'YouTube, TikTok, Instagram, Facebook, Twitter/X',
            mp4mp3: 'MP4 ve MP3 formatında indirme',
            playlist: 'Playlist desteği',
            highQuality: 'Yüksek kalite seçenekleri (8K, 4K, 2K, 1080p)'
        },
        developer: 'Geliştirici',
        copyright: '© 2026 Tüm hakları saklıdır.',

        // İndirme motoru
        downloadEngine: 'İndirme Motoru',
        checkForUpdates: 'Güncellemeyi Kontrol Et',
        checking: 'Kontrol ediliyor...',
        upToDate: 'Güncelsiniz! ✓',
        updateComplete: 'Güncelleme tamamlandı! ✓',
        updateFailed: 'Güncelleme başarısız',

        // Onay modalı
        confirm: 'Onay',
        cancel: 'İptal',
        clearHistoryTitle: 'Geçmişi Temizle',
        clearHistoryMessage: 'Tüm indirme geçmişi silinecek. Bu işlem geri alınamaz.',
        yesClear: 'Evet, Temizle',

        // Bildirimler
        notifDownloadComplete: 'İndirme Tamamlandı',
        notifPlaylistComplete: 'Playlist İndirme Tamamlandı',
        notifDownloaded: 'başarıyla indirildi.',
        notifVideosDownloaded: 'video indirildi.',

        // Hatalar
        pasteError: 'Pano erişimi reddedildi',
        videoInfoError: 'Video bilgisi alınamadı',
        playlistError: 'Playlist videoları alınamadı',
        selectVideo: 'Lütfen en az bir video seçin',
        loadingVideoInfo: 'Video bilgisi alınıyor...'
    },

    en: {
        // Genel
        appTitle: 'TekLoader',

        // Mod butonları
        urlMode: 'URL',
        searchMode: 'YouTube Search',

        // URL giriş
        urlPlaceholder: 'Paste video URL...',
        searchPlaceholder: 'Search on YouTube...',

        // Format ve kalite
        format: 'Format',
        quality: 'Quality',
        bestQuality: 'Best',
        numberedFilename: 'Numbered filename',

        // Video bilgisi
        views: 'views',
        likes: 'likes',
        videos: 'videos',

        // Playlist
        videosSelected: 'videos selected',
        selectAll: 'Select All',
        deselectAll: 'Deselect All',
        completed: 'completed',

        // İndirme durumu
        downloading: 'Downloading...',
        merging: 'Merging...',
        extractingAudio: 'Extracting audio...',
        downloadComplete: 'Download complete!',
        downloadCancelled: 'Download cancelled',
        downloadFailed: 'Download failed',

        // Footer
        changeFolder: 'Change Folder',
        download: 'Download',
        settings: 'Settings',
        openFolder: 'Open Folder',

        // Ayarlar
        settingsTitle: 'Settings',
        general: 'General',
        history: 'History',
        about: 'About',

        // Tema
        theme: 'Theme',
        dark: 'Dark',
        light: 'Light',

        // Dil
        language: 'Language',

        // Bildirimler
        notifications: 'Notifications',
        notifyOnComplete: 'Notify when download completes',

        // Geçmiş
        downloadHistory: 'Download History',
        saveHistory: 'Save history',
        records: 'records',
        clearHistory: 'Clear History',
        noHistory: 'No download history yet',

        // Hakkında
        version: 'Version',
        description: 'Multi-platform video and music downloader',
        features: {
            platforms: 'YouTube, TikTok, Instagram, Facebook, Twitter/X',
            mp4mp3: 'Download in MP4 and MP3 formats',
            playlist: 'Playlist support',
            highQuality: 'High quality options (8K, 4K, 2K, 1080p)'
        },
        developer: 'Developer',
        copyright: '© 2026 All rights reserved.',

        // İndirme motoru
        downloadEngine: 'Download Engine',
        checkForUpdates: 'Check for Updates',
        checking: 'Checking...',
        upToDate: 'Up to date! ✓',
        updateComplete: 'Update complete! ✓',
        updateFailed: 'Update failed',

        // Onay modalı
        confirm: 'Confirm',
        cancel: 'Cancel',
        clearHistoryTitle: 'Clear History',
        clearHistoryMessage: 'All download history will be deleted. This action cannot be undone.',
        yesClear: 'Yes, Clear',

        // Bildirimler
        notifDownloadComplete: 'Download Complete',
        notifPlaylistComplete: 'Playlist Download Complete',
        notifDownloaded: 'downloaded successfully.',
        notifVideosDownloaded: 'videos downloaded.',

        // Hatalar
        pasteError: 'Clipboard access denied',
        videoInfoError: 'Could not get video info',
        playlistError: 'Could not get playlist videos',
        selectVideo: 'Please select at least one video',
        loadingVideoInfo: 'Getting video info...'
    }
};

// Çeviri yardımcı fonksiyonu
export function t(key, lang = null) {
    const currentLang = lang || window.currentLanguage || 'tr';
    const keys = key.split('.');
    let value = translations[currentLang];
    for (const k of keys) {
        value = value?.[k];
    }
    return value || key;
}
