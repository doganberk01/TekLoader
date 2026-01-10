// ===== DOM ELEMANLARI =====
// Lazy-loading ile DOM referansları

let _elements = null;

export function getElements() {
    if (_elements) return _elements;

    _elements = {
        // URL Bölümü
        urlSection: document.querySelector('.url-section'),
        urlInput: document.getElementById('url-input'),
        btnPaste: document.getElementById('btn-paste'),

        // Video önizleme + seçenekler kapsayıcısı
        previewOptionsRow: document.getElementById('preview-options-row'),

        // Video önizleme
        videoPreview: document.getElementById('video-preview'),
        videoThumbnail: document.getElementById('video-thumbnail'),
        videoDuration: document.getElementById('video-duration'),
        videoTitle: document.getElementById('video-title'),
        videoChannel: document.getElementById('video-channel'),
        videoViews: document.getElementById('video-views'),
        videoLikes: document.getElementById('video-likes'),

        // İndirme seçenekleri
        downloadOptions: document.getElementById('download-options'),
        btnVideo: document.getElementById('btn-video'),
        btnAudio: document.getElementById('btn-audio'),
        qualityGroup: document.getElementById('quality-group'),
        qualitySelect: document.getElementById('quality-select'),

        playlistOptionsGroup: document.getElementById('playlist-options'),
        useNumbersCheckbox: document.getElementById('use-numbers'),

        // Playlist video seçimi
        playlistSelection: document.getElementById('playlist-selection'),
        selectedCount: document.getElementById('selected-count'),
        selectionTotal: document.getElementById('selection-total'),
        btnSelectAll: document.getElementById('btn-select-all'),
        btnDeselectAll: document.getElementById('btn-deselect-all'),
        playlistSelectionList: document.getElementById('playlist-selection-list'),

        // İndir butonu
        btnDownload: document.getElementById('btn-download'),

        // Playlist bölümü (indirme sırasında)
        playlistSection: document.getElementById('playlist-section'),
        playlistThumb: document.getElementById('playlist-thumb'),
        playlistTitleDisplay: document.getElementById('playlist-title-display'),
        playlistChannelDisplay: document.getElementById('playlist-channel-display'),
        playlistCountDisplay: document.getElementById('playlist-count-display'),
        completedCount: document.getElementById('completed-count'),
        totalCount: document.getElementById('total-count'),
        playlistVideos: document.getElementById('playlist-videos'),

        // İlerleme
        progressSection: document.getElementById('progress-section'),
        progressStatus: document.getElementById('progress-status'),
        progressFilename: document.getElementById('progress-filename'),
        progressPercent: document.getElementById('progress-percent'),
        progressBar: document.getElementById('progress-bar'),
        progressSpeed: document.getElementById('progress-speed'),
        progressEta: document.getElementById('progress-eta'),
        btnCancel: document.getElementById('btn-cancel'),

        // Durum göstergeleri
        loading: document.getElementById('loading'),
        errorMessage: document.getElementById('error-message'),
        errorText: document.getElementById('error-text'),
        successMessage: document.getElementById('success-message'),
        btnOpenFolder: document.getElementById('btn-open-folder'),

        // Alt Bilgi
        folderPath: document.getElementById('folder-path'),
        btnChangeFolder: document.getElementById('btn-change-folder'),
        btnSettings: document.getElementById('btn-settings'),

        // Ayarlar Modal
        settingsModal: document.getElementById('settings-modal'),
        btnCloseModal: document.getElementById('btn-close-modal'),
        settingsTabs: document.querySelectorAll('.settings-tab'),
        settingsPanels: document.querySelectorAll('.settings-panel'),

        // Ayarlar Kontrolleri
        themeButtons: document.querySelectorAll('.theme-btn'),
        languageButtons: document.querySelectorAll('.lang-btn'),
        notificationsToggle: document.getElementById('notifications-toggle'),
        historyToggle: document.getElementById('history-toggle'),
        btnClearHistory: document.getElementById('btn-clear-history'),
        historyList: document.getElementById('history-list'),

        // İndirme Motoru Güncelleme
        engineVersion: document.getElementById('engine-version'),
        btnUpdateEngine: document.getElementById('btn-update-engine'),
        updateStatus: document.getElementById('update-status'),
        updateStatusText: document.getElementById('update-status-text'),

        // Pencere kontrolleri
        btnMinimize: document.getElementById('btn-minimize'),
        btnMaximize: document.getElementById('btn-maximize'),
        btnClose: document.getElementById('btn-close'),

        // Sağ Tuş Menüsü
        contextMenu: document.getElementById('context-menu'),
        contextPaste: document.getElementById('context-paste'),

        // Mod ve Arama
        modeUrl: document.getElementById('mode-url'),
        modeSearch: document.getElementById('mode-search'),
        btnSearchTrigger: document.getElementById('btn-search-trigger'),
        searchResults: document.getElementById('search-results'),

        // Özel Onay Modalı
        confirmModal: document.getElementById('confirm-modal'),
        confirmTitle: document.getElementById('confirm-title'),
        confirmMessage: document.getElementById('confirm-message'),
        confirmOk: document.getElementById('confirm-ok'),
        confirmCancel: document.getElementById('confirm-cancel')
    };

    return _elements;
}

// Kısa erişim için
export const elements = new Proxy({}, {
    get(target, prop) {
        return getElements()[prop];
    }
});
