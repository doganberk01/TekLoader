// ===== AYARLAR YÖNETİMİ =====
import { elements } from './elements.js';
import { CSS } from './constants.js';
import { showConfirmModal, formatDate } from './ui-helpers.js';

// Global değişkenler (translations.js ve main.js'den gelir):
// - window.currentLanguage
// - window.translations  
// - window.applyLanguage

// ===== TEMA YÖNETİMİ =====

// Temayı uygula
export function applyTheme(theme, save = false) {
    // Butonları güncelle
    elements.themeButtons.forEach(btn => {
        btn.classList.toggle(CSS.ACTIVE, btn.dataset.theme === theme);
    });

    // Temayı uygula
    document.body.classList.remove(CSS.LIGHT_THEME);

    if (theme === 'light') {
        document.body.classList.add(CSS.LIGHT_THEME);
    } else if (theme === 'system') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.body.classList.add(CSS.LIGHT_THEME);
        }
    }

    if (save) {
        saveCurrentSettings();
    }
}

// Tema değiştir
export function setTheme(theme) {
    applyTheme(theme, true);
}

// ===== DİL YÖNETİMİ =====

// Dil değiştir
export function setLanguage(lang) {
    // Butonları güncelle
    elements.languageButtons.forEach(btn => {
        btn.classList.toggle(CSS.ACTIVE, btn.dataset.lang === lang);
    });

    // Dili uygula
    window.currentLanguage = lang;
    window.applyLanguage();

    // Kaydet
    saveCurrentSettings();
}

// ===== AYARLAR MODAL =====

// Ayarlar modalını göster
export async function showSettingsModal() {
    if (!elements.settingsModal) return;

    // Ayarları yükle
    const settings = await window.electronAPI.getSettings();
    applySettingsToUI(settings);

    // Geçmişi yükle
    const history = await window.electronAPI.getHistory();
    renderHistory(history);

    elements.settingsModal.classList.remove(CSS.HIDDEN);
}

// Ayarlar modalını gizle
export function hideSettingsModal() {
    if (elements.settingsModal) {
        elements.settingsModal.classList.add(CSS.HIDDEN);
    }
}

// Ayarlar sekmesi değiştir
export function switchSettingsTab(tabName) {
    // Tab butonlarını güncelle
    elements.settingsTabs.forEach(tab => {
        tab.classList.toggle(CSS.ACTIVE, tab.dataset.tab === tabName);
    });

    // Panelleri güncelle
    elements.settingsPanels.forEach(panel => {
        panel.classList.toggle(CSS.ACTIVE, panel.id === `panel-${tabName}`);
    });
}

// Ayarları UI'a uygula
export function applySettingsToUI(settings) {
    // Tema
    elements.themeButtons.forEach(btn => {
        btn.classList.toggle(CSS.ACTIVE, btn.dataset.theme === settings.theme);
    });

    // Dil
    elements.languageButtons.forEach(btn => {
        btn.classList.toggle(CSS.ACTIVE, btn.dataset.lang === settings.language);
    });

    // Bildirimler
    elements.notificationsToggle.checked = settings.notifications;

    // Geçmiş
    elements.historyToggle.checked = settings.saveHistory;
}

// Mevcut ayarları kaydet
export async function saveCurrentSettings() {
    const settings = {
        theme: document.querySelector('.theme-btn.active')?.dataset.theme || 'dark',
        language: document.querySelector('.lang-btn.active')?.dataset.lang || 'tr',
        notifications: elements.notificationsToggle.checked,
        saveHistory: elements.historyToggle.checked
    };

    await window.electronAPI.saveSettings(settings);
}

// ===== GEÇMİŞ YÖNETİMİ =====

// Geçmişi render et
export function renderHistory(history) {
    const countEl = document.querySelector('.history-count');
    countEl.textContent = `${history.length} kayıt`;

    if (history.length === 0) {
        elements.historyList.innerHTML = `
            <div class="history-empty">
                <span class="material-symbols-outlined">history</span>
                <p>Henüz indirme geçmişi yok</p>
            </div>
        `;
        return;
    }

    elements.historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <img src="${item.thumbnail || ''}" alt="" class="history-item-thumb">
            <div class="history-item-info">
                <div class="history-item-title" title="${item.title}">${item.title}</div>
                <div class="history-item-date">${formatDate(item.date)}</div>
            </div>
        </div>
    `).join('');
}

// Geçmişi temizle
export async function clearHistory() {
    const confirmed = await showConfirmModal(
        'Geçmişi Temizle',
        'Tüm indirme geçmişi silinecek. Bu işlem geri alınamaz.',
        'Evet, Temizle'
    );
    if (confirmed) {
        await window.electronAPI.clearHistory();
        renderHistory([]);
    }
}

// Geçmişe ekle (ayarlara bağlı)
export async function addToHistoryIfEnabled(item) {
    const settings = await window.electronAPI.getSettings();
    if (!settings.saveHistory) return;

    await window.electronAPI.addToHistory({
        ...item,
        date: new Date().toISOString()
    });
}

// ===== İNDİRME MOTORU =====

// Motor versiyonunu yükle
export async function loadEngineVersion() {
    try {
        const version = await window.electronAPI.getEngineVersion();
        elements.engineVersion.textContent = version;
    } catch (err) {
        elements.engineVersion.textContent = 'Bilinmiyor';
    }
}

// Motoru güncelle
export async function updateEngine() {
    elements.btnUpdateEngine.classList.add(CSS.HIDDEN);
    elements.updateStatus.classList.remove(CSS.HIDDEN);
    elements.updateStatus.querySelector('.material-symbols-outlined').classList.add(CSS.SPINNING);
    elements.updateStatusText.textContent = 'Kontrol ediliyor...';

    try {
        const result = await window.electronAPI.updateEngine();

        // Spinning'i kaldır
        elements.updateStatus.querySelector('.material-symbols-outlined').classList.remove(CSS.SPINNING);

        if (result.success) {
            elements.updateStatusText.textContent = result.message;
            elements.updateStatus.classList.add('success');
            if (result.updated) {
                await loadEngineVersion();
            }
        } else {
            elements.updateStatusText.textContent = result.message;
            elements.updateStatus.classList.add(CSS.ERROR);
        }
    } catch (err) {
        elements.updateStatus.querySelector('.material-symbols-outlined').classList.remove(CSS.SPINNING);
        elements.updateStatusText.textContent = 'Kontrol başarısız';
        elements.updateStatus.classList.add(CSS.ERROR);
    }

    // 3 saniye sonra butonu geri göster
    setTimeout(() => {
        elements.updateStatus.classList.add(CSS.HIDDEN);
        elements.updateStatus.classList.remove('success', CSS.ERROR);
        elements.btnUpdateEngine.classList.remove(CSS.HIDDEN);
    }, 3000);
}
