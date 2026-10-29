const { contextBridge, ipcRenderer } = require('electron');

// Güvenli API köprüsü
contextBridge.exposeInMainWorld('electronAPI', {
    // Pencere kontrolleri
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),

    // Klasör işlemleri
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),
    openFileLocation: (filePath) => ipcRenderer.send('open-file-location', filePath),

    // Video işlemleri (downloader.js'den çağrılacak)
    getVideoInfo: (url) => ipcRenderer.invoke('get-video-info', url),
    searchYouTube: (query) => ipcRenderer.invoke('search-youtube', query),
    downloadVideo: (options) => ipcRenderer.invoke('download-video', options),
    downloadSingleVideo: (options) => ipcRenderer.invoke('download-single-video', options),
    cancelDownload: () => ipcRenderer.send('cancel-download'),

    // İlerleme dinleyicisi
    onDownloadProgress: (callback) => {
        ipcRenderer.on('download-progress', (event, data) => callback(data));
    },

    // Ayarlar
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

    // Geçmiş
    getHistory: () => ipcRenderer.invoke('get-history'),
    clearHistory: () => ipcRenderer.invoke('clear-history'),
    addToHistory: (item) => ipcRenderer.invoke('add-to-history', item),

    // Bildirimler
    sendNotification: (title, body) => ipcRenderer.invoke('send-notification', { title, body }),

    // Uygulama ve İndirme Motoru Versiyonu
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getEngineVersion: () => ipcRenderer.invoke('get-engine-version'),
    updateEngine: () => ipcRenderer.invoke('update-engine')
});
