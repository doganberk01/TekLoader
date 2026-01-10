// ===== ARAMA YÖNETİMİ =====
import { elements } from './elements.js';
import { state } from './state.js';
import { CSS, MODE } from './constants.js';
import { formatDuration, formatNumber, hideAll } from './ui-helpers.js';
import { handleUrlChange } from './video-manager.js';

// ===== MOD DEĞİŞİMİ =====

// Modu değiştir (URL veya Arama)
export function switchMode(mode) {
    state.mode = mode;

    if (mode === MODE.URL) {
        elements.modeUrl.classList.add(CSS.ACTIVE);
        elements.modeSearch.classList.remove(CSS.ACTIVE);
        elements.urlInput.placeholder = 'YouTube URL yapıştır...';
        elements.btnSearchTrigger.classList.add(CSS.HIDDEN);
        elements.searchResults.classList.add(CSS.HIDDEN);
        elements.btnPaste.classList.remove(CSS.HIDDEN);

        // Mevcut indirme görünümünü koru veya göster
        if (state.videoInfo) {
            elements.previewOptionsRow.classList.remove(CSS.HIDDEN);
            if (state.isPlaylist) {
                elements.playlistOptionsGroup.classList.remove(CSS.HIDDEN);
                elements.playlistSelection.classList.remove(CSS.HIDDEN);
            }
        }
    } else {
        elements.modeUrl.classList.remove(CSS.ACTIVE);
        elements.modeSearch.classList.add(CSS.ACTIVE);
        elements.urlInput.placeholder = 'Video ara...';
        elements.btnSearchTrigger.classList.remove(CSS.HIDDEN);
        elements.searchResults.classList.remove(CSS.HIDDEN);
        elements.btnPaste.classList.add(CSS.HIDDEN);

        // Arama modunda indirme detaylarını gizle
        hideAll();
        elements.urlSection.classList.remove(CSS.HIDDEN);
    }
}

// ===== ARAMA İŞLEMLERİ =====

// YouTube arama yap
export async function performSearch() {
    const query = elements.urlInput.value.trim();
    if (!query) return;

    // UI hazırlığı
    elements.searchResults.innerHTML = '';
    elements.searchResults.classList.remove(CSS.HIDDEN);

    // Yükleniyor göstergesi ekle
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-spinner';
    loadingDiv.innerHTML = '<span class="material-symbols-outlined spin">sync</span> Aranıyor...';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '20px';
    loadingDiv.style.color = 'var(--text-muted)';
    elements.searchResults.appendChild(loadingDiv);

    try {
        const videos = await window.electronAPI.searchYouTube(query);
        renderSearchResults(videos);
    } catch (err) {
        elements.searchResults.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                <span class="material-symbols-outlined" style="font-size: 48px; display: block; margin-bottom: 10px;">error</span>
                <p>Arama başarısız: ${err.message}</p>
            </div>
        `;
    }
}

// Arama sonuçlarını render et
export function renderSearchResults(videos) {
    elements.searchResults.innerHTML = '';

    if (videos.length === 0) {
        elements.searchResults.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                <p>Sonuç bulunamadı.</p>
            </div>
        `;
        return;
    }

    videos.forEach(video => {
        const item = document.createElement('div');
        item.className = 'search-item';

        const durationText = video.duration ? formatDuration(video.duration) : '';

        item.innerHTML = `
            <div class="search-item-thumb">
                <img src="${video.thumbnail}" alt="" class="search-item-thumb">
                ${durationText ? `<span class="search-item-duration">${durationText}</span>` : ''}
            </div>
            <div class="search-item-info">
                <h3 class="search-item-title" title="${video.title}">${video.title}</h3>
                <div class="search-item-channel">
                    <span class="material-symbols-outlined" style="font-size: 14px;">person</span>
                    ${video.channel}
                </div>
                <div class="search-item-meta">
                    <span>${video.view_count ? formatNumber(video.view_count) + ' görüntüleme' : ''}</span>
                </div>
            </div>
            <button class="search-download-btn" title="İndir">
                <span class="material-symbols-outlined">download</span>
            </button>
        `;

        item.addEventListener('click', () => {
            // URL moduna geç ve videoyu yükle
            switchMode(MODE.URL);
            elements.urlInput.value = video.url;
            handleUrlChange(video.url);
        });

        elements.searchResults.appendChild(item);
    });
}
