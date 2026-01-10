// ===== UYGULAMA DURUMU =====
// Reaktif olmayan basit state objesi

export const state = {
    mode: 'url',              // 'url' veya 'search'
    videoInfo: null,          // Mevcut video bilgisi
    format: 'video',          // 'video' veya 'audio'
    quality: 'best',          // Seçili kalite
    downloadPath: '',         // İndirme klasörü
    lastDownloadedFile: '',   // Son indirilen dosya yolu
    isPlaylist: false,        // Playlist mi?
    playlistName: '',         // Playlist adı
    playlistVideos: [],       // Playlist videoları
    selectedVideos: new Set(),    // Seçili video indexleri
    currentVideoIndex: -1,    // Şu an indirilen video
    completedVideos: 0,       // Tamamlanan video sayısı
    isDownloading: false,     // İndirme devam ediyor mu?
    downloadQueue: [],        // İndirme kuyruğu
    cancelledVideos: new Set()    // İptal edilen videolar
};

// State'i sıfırla
export function resetState() {
    state.videoInfo = null;
    state.isPlaylist = false;
    state.playlistName = '';
    state.playlistVideos = [];
    state.selectedVideos = new Set();
    state.currentVideoIndex = -1;
    state.completedVideos = 0;
    state.isDownloading = false;
    state.downloadQueue = [];
    state.cancelledVideos = new Set();
}

// Playlist state'ini sıfırla
export function resetPlaylistState() {
    state.selectedVideos = new Set();
    state.cancelledVideos = new Set();
    state.currentVideoIndex = -1;
    state.completedVideos = 0;
}
