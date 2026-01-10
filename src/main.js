// ===== TEKLOADER - ANA GİRİŞ NOKTASI =====
// Tüm modülleri yükler ve uygulamayı başlatır

import { state } from './modules/state.js';
import { elements } from './modules/elements.js';
import { CSS } from './modules/constants.js';
import { setupEventListeners } from './modules/event-handlers.js';
import { handleProgress } from './modules/download-manager.js';
import { applyTheme, loadEngineVersion } from './modules/settings-manager.js';
import { translations } from './modules/translations.js';

// ===== DİL DESTEĞİ =====
// Aktif dil ve çeviriler (global scope)
window.currentLanguage = 'tr';
window.translations = translations;

// ===== DİL UYGULAMA FONKSİYONU =====
window.applyLanguage = function () {
    const lang = window.translations?.[window.currentLanguage];
    if (!lang) return;

    // Mod butonları
    const modeUrlText = document.querySelector('#mode-url span:last-child');
    const modeSearchText = document.querySelector('#mode-search span:last-child');
    if (modeUrlText) modeUrlText.textContent = lang.urlMode;
    if (modeSearchText) modeSearchText.textContent = lang.searchMode;

    // URL input placeholder
    const urlInput = document.getElementById('url-input');
    if (urlInput) {
        urlInput.placeholder = state.mode === 'url' ? lang.urlPlaceholder : lang.searchPlaceholder;
    }

    // Format etiketi
    const formatLabel = document.querySelector('.format-group .option-label');
    if (formatLabel) formatLabel.textContent = lang.format;

    // Kalite etiketi
    const qualityLabel = document.querySelector('.quality-group .option-label');
    if (qualityLabel) qualityLabel.textContent = lang.quality;

    // Kalite seçenekleri - En İyi
    const bestOption = document.querySelector('#quality-select option[value="best"]');
    if (bestOption) bestOption.textContent = lang.bestQuality;

    // Numaralı dosya adı
    const numberedLabel = document.querySelector('#playlist-options');
    if (numberedLabel && numberedLabel.childNodes[2]) {
        numberedLabel.childNodes[2].textContent = ' ' + lang.numberedFilename;
    }

    // Footer butonları
    const changeFolderText = document.querySelector('#btn-change-folder span:last-child');
    const downloadText = document.querySelector('#btn-download span:last-child');
    const settingsText = document.querySelector('#btn-settings span:last-child');
    if (changeFolderText) changeFolderText.textContent = lang.changeFolder;
    if (downloadText) downloadText.textContent = lang.download;
    if (settingsText) settingsText.textContent = lang.settings;

    // Ayarlar modal
    const modalTitle = document.querySelector('.modal-header h2');
    if (modalTitle) modalTitle.innerHTML = '<span class="material-symbols-outlined">settings</span> ' + lang.settingsTitle;

    // Ayarlar sekmeleri
    const tabs = document.querySelectorAll('.settings-tab');
    if (tabs[0]) tabs[0].innerHTML = '<span class="material-symbols-outlined">tune</span> ' + lang.general;
    if (tabs[1]) tabs[1].innerHTML = '<span class="material-symbols-outlined">history</span> ' + lang.history;
    if (tabs[2]) tabs[2].innerHTML = '<span class="material-symbols-outlined">info</span> ' + lang.about;

    // Tema etiketi ve butonları
    const themeLabel = document.querySelector('.settings-group .settings-label');
    if (themeLabel) themeLabel.innerHTML = '<span class="material-symbols-outlined">palette</span> ' + lang.theme;

    const themeButtons = document.querySelectorAll('.theme-btn');
    if (themeButtons[0]) themeButtons[0].innerHTML = '<span class="material-symbols-outlined">dark_mode</span> ' + lang.dark;
    if (themeButtons[1]) themeButtons[1].innerHTML = '<span class="material-symbols-outlined">light_mode</span> ' + lang.light;

    // Dil etiketi
    const langLabel = document.querySelectorAll('.settings-group .settings-label')[1];
    if (langLabel) langLabel.innerHTML = '<span class="material-symbols-outlined">language</span> ' + lang.language;

    // Bildirimler
    const notifLabel = document.querySelectorAll('.settings-group .settings-label')[2];
    if (notifLabel) notifLabel.innerHTML = '<span class="material-symbols-outlined">notifications</span> ' + lang.notifications;

    const notifToggleText = document.querySelector('#notifications-toggle + .toggle-slider + .toggle-text');
    if (notifToggleText) notifToggleText.textContent = lang.notifyOnComplete;

    // Geçmiş kaydet
    const historyLabel = document.querySelectorAll('.settings-group .settings-label')[3];
    if (historyLabel) historyLabel.innerHTML = '<span class="material-symbols-outlined">history</span> ' + lang.downloadHistory;

    const historyToggleText = document.querySelector('#history-toggle + .toggle-slider + .toggle-text');
    if (historyToggleText) historyToggleText.textContent = lang.saveHistory;

    // Geçmişi temizle butonu
    const clearHistoryBtn = document.querySelector('#btn-clear-history');
    if (clearHistoryBtn) clearHistoryBtn.innerHTML = '<span class="material-symbols-outlined">delete</span> ' + lang.clearHistory;

    // Hakkında
    const versionText = document.querySelector('.about-content .version');
    if (versionText) versionText.textContent = lang.version + ' 1.0.0';

    const descText = document.querySelector('.about-content .description');
    if (descText) descText.textContent = lang.description;

    const features = document.querySelectorAll('.about-content .features p');
    if (features[0]) features[0].textContent = '✓ ' + lang.features.platforms;
    if (features[1]) features[1].textContent = '✓ ' + lang.features.mp4mp3;
    if (features[2]) features[2].textContent = '✓ ' + lang.features.playlist;
    if (features[3]) features[3].textContent = '✓ ' + lang.features.highQuality;

    const devText = document.querySelector('.about-content .developer');
    if (devText) devText.innerHTML = lang.developer + ': <strong>D.Berk</strong>';

    const copyText = document.querySelector('.about-content .copyright');
    if (copyText) copyText.textContent = lang.copyright;

    // İndirme motoru
    const engineLabel = document.querySelector('.engine-label');
    if (engineLabel) engineLabel.textContent = lang.downloadEngine + ':';

    const updateBtn = document.querySelector('#btn-update-engine');
    if (updateBtn) updateBtn.innerHTML = '<span class="material-symbols-outlined">update</span> ' + lang.checkForUpdates;

    // Onay modalı İptal butonu
    const cancelBtn = document.querySelector('#confirm-cancel');
    if (cancelBtn) cancelBtn.textContent = lang.cancel;

    // Başarı mesajı
    const successMsg = document.querySelector('#success-message span:not(.material-symbols-outlined)');
    if (successMsg) successMsg.textContent = lang.downloadComplete;

    const openFolderBtn = document.querySelector('#btn-open-folder');
    if (openFolderBtn) openFolderBtn.innerHTML = '<span class="material-symbols-outlined">folder_open</span> ' + lang.openFolder;

    // Yükleme mesajı
    const loadingText = document.querySelector('#loading span');
    if (loadingText) loadingText.textContent = lang.loadingVideoInfo;

    // Playlist butonları
    const selectAllBtn = document.querySelector('#btn-select-all');
    if (selectAllBtn) selectAllBtn.innerHTML = '<span class="material-symbols-outlined">select_all</span> ' + lang.selectAll;

    const deselectAllBtn = document.querySelector('#btn-deselect-all');
    if (deselectAllBtn) deselectAllBtn.innerHTML = '<span class="material-symbols-outlined">deselect</span> ' + lang.deselectAll;
};

// ===== BAŞLATMA =====
async function init() {
    // İndirme klasörünü al
    state.downloadPath = await window.electronAPI.getDownloadsPath();
    elements.folderPath.textContent = state.downloadPath;

    // Event listener'ları kur
    setupEventListeners();

    // İlerleme callback'ini kaydet
    window.electronAPI.onDownloadProgress(handleProgress);

    // Ayarları yükle
    const settings = await window.electronAPI.getSettings();

    // Temayı uygula (kaydetmeden)
    applyTheme(settings.theme || 'dark', false);

    // Dil ayarını yükle
    if (settings.language) {
        window.currentLanguage = settings.language;
        // Dil butonunu aktif yap
        elements.languageButtons.forEach(btn => {
            btn.classList.toggle(CSS.ACTIVE, btn.dataset.lang === settings.language);
        });
        window.applyLanguage();
    }

    // İndirme motoru versiyonunu yükle
    loadEngineVersion();

    console.log('TekLoader modüler yapı başlatıldı ✓');
}

// DOM hazır olduğunda başlat
document.addEventListener('DOMContentLoaded', init);
