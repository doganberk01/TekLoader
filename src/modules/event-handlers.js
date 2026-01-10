// ===== OLAY DİNLEYİCİLERİ =====
import { elements } from './elements.js';
import { state } from './state.js';
import { MODE } from './constants.js';
import { showError, hideContextMenu, showContextMenu } from './ui-helpers.js';
import { handleUrlChange } from './video-manager.js';
import { startDownload, cancelCurrentDownload, setFormat } from './download-manager.js';
import { selectAllVideos, deselectAllVideos } from './playlist-manager.js';
import { switchMode, performSearch } from './search-manager.js';
import {
    showSettingsModal,
    hideSettingsModal,
    switchSettingsTab,
    setTheme,
    setLanguage,
    clearHistory,
    updateEngine
} from './settings-manager.js';

// ===== EVENT LİSTENER KURULUMU =====

export function setupEventListeners() {
    // Pencere kontrolleri
    elements.btnMinimize.addEventListener('click', () => window.electronAPI.minimize());
    elements.btnMaximize.addEventListener('click', () => window.electronAPI.maximize());
    elements.btnClose.addEventListener('click', () => window.electronAPI.close());

    // Yapıştır butonu
    elements.btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            elements.urlInput.value = text;
            handleUrlChange(text);
        } catch (err) {
            showError('Pano erişimi reddedildi');
        }
    });

    // URL input
    elements.urlInput.addEventListener('input', (e) => {
        if (state.mode === MODE.URL) {
            clearTimeout(window.urlTimeout);
            window.urlTimeout = setTimeout(() => handleUrlChange(e.target.value), 500);
        }
    });

    elements.urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (state.mode === MODE.SEARCH) {
                performSearch();
            } else {
                handleUrlChange(elements.urlInput.value);
            }
        }
    });

    // Sağ tık menüsü
    elements.urlInput.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY);
    });

    // Sağ tuş menüsü yapıştır
    elements.contextPaste.addEventListener('click', async () => {
        hideContextMenu();
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                elements.urlInput.value = text;
                elements.urlInput.focus();
                if (state.mode === MODE.URL) {
                    handleUrlChange(text);
                }
            }
        } catch (err) {
            // Pano boş veya erişim reddedildi
        }
    });

    // Context menu dışına tıklayınca kapat
    document.addEventListener('click', (e) => {
        if (!elements.contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });

    // ESC tuşu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideContextMenu();
            hideSettingsModal();
        }
    });

    // Mod değişimi
    elements.modeUrl.addEventListener('click', () => switchMode(MODE.URL));
    elements.modeSearch.addEventListener('click', () => switchMode(MODE.SEARCH));

    // Arama butonu
    elements.btnSearchTrigger.addEventListener('click', performSearch);

    // Format butonları
    elements.btnVideo.addEventListener('click', () => setFormat('video'));
    elements.btnAudio.addEventListener('click', () => setFormat('audio'));

    // Kalite seçimi
    elements.qualitySelect.addEventListener('change', (e) => {
        state.quality = e.target.value;
    });

    // İndir butonu
    elements.btnDownload.addEventListener('click', startDownload);

    // İptal butonu
    elements.btnCancel.addEventListener('click', cancelCurrentDownload);

    // Playlist seçim kontrolleri
    elements.btnSelectAll.addEventListener('click', selectAllVideos);
    elements.btnDeselectAll.addEventListener('click', deselectAllVideos);

    // Klasör değiştir
    elements.btnChangeFolder.addEventListener('click', async () => {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
            state.downloadPath = folder;
            elements.folderPath.textContent = folder;
        }
    });

    // Klasörü aç
    elements.btnOpenFolder.addEventListener('click', () => {
        if (state.lastDownloadedFile) {
            window.electronAPI.openFileLocation(state.lastDownloadedFile);
        }
    });

    // Ayarlar modal
    if (elements.btnSettings) {
        elements.btnSettings.addEventListener('click', showSettingsModal);
    }
    if (elements.btnCloseModal) {
        elements.btnCloseModal.addEventListener('click', hideSettingsModal);
    }
    if (elements.settingsModal) {
        elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) {
                hideSettingsModal();
            }
        });
    }

    // Tab geçişleri
    if (elements.settingsTabs) {
        elements.settingsTabs.forEach(tab => {
            tab.addEventListener('click', () => switchSettingsTab(tab.dataset.tab));
        });
    }

    // Tema butonları
    if (elements.themeButtons) {
        elements.themeButtons.forEach(btn => {
            btn.addEventListener('click', () => setTheme(btn.dataset.theme));
        });
    }

    // Bildirim toggle
    if (elements.notificationsToggle) {
        elements.notificationsToggle.addEventListener('change', () => {
            import('./settings-manager.js').then(m => m.saveCurrentSettings());
        });
    }

    // Geçmiş toggle
    if (elements.historyToggle) {
        elements.historyToggle.addEventListener('change', () => {
            import('./settings-manager.js').then(m => m.saveCurrentSettings());
        });
    }

    // Dil butonları
    if (elements.languageButtons) {
        elements.languageButtons.forEach(btn => {
            btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
        });
    }

    // Geçmişi temizle
    if (elements.btnClearHistory) {
        elements.btnClearHistory.addEventListener('click', clearHistory);
    }

    // Motor güncelle
    if (elements.btnUpdateEngine) {
        elements.btnUpdateEngine.addEventListener('click', updateEngine);
    }
}
