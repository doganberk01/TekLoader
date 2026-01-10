// ===== PLAYLIST YÖNETİMİ =====
import { elements } from './elements.js';
import { state } from './state.js';
import { CSS, VIDEO_STATUS } from './constants.js';
import { formatDuration } from './ui-helpers.js';

// ===== PLAYLIST VİDEO SEÇİMİ =====

// Playlist seçim listesini render et
export function renderPlaylistSelection() {
    elements.playlistSelectionList.innerHTML = '';
    elements.selectionTotal.textContent = state.playlistVideos.length;

    state.playlistVideos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'selection-item selected';
        item.id = `selection-item-${index}`;
        item.innerHTML = `
            <input type="checkbox" id="select-video-${index}" checked>
            <span class="selection-item-index">${index + 1}</span>
            <span class="selection-item-title" title="${video.title}">${video.title || 'Video ' + (index + 1)}</span>
            <span class="selection-item-duration">${formatDuration(video.duration)}</span>
        `;

        const checkbox = item.querySelector('input');
        checkbox.addEventListener('change', () => toggleVideoSelection(index));
        item.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                toggleVideoSelection(index);
            }
        });

        elements.playlistSelectionList.appendChild(item);
    });

    updateSelectedCount();
}

// Video seçimini değiştir
export function toggleVideoSelection(index) {
    if (state.selectedVideos.has(index)) {
        state.selectedVideos.delete(index);
        document.getElementById(`selection-item-${index}`).classList.remove(CSS.SELECTED);
    } else {
        state.selectedVideos.add(index);
        document.getElementById(`selection-item-${index}`).classList.add(CSS.SELECTED);
    }
    updateSelectedCount();
}

// Tüm videoları seç
export function selectAllVideos() {
    state.playlistVideos.forEach((_, index) => {
        state.selectedVideos.add(index);
        const checkbox = document.getElementById(`select-video-${index}`);
        if (checkbox) checkbox.checked = true;
        const item = document.getElementById(`selection-item-${index}`);
        if (item) item.classList.add(CSS.SELECTED);
    });
    updateSelectedCount();
}

// Tüm seçimleri kaldır
export function deselectAllVideos() {
    state.selectedVideos.clear();
    state.playlistVideos.forEach((_, index) => {
        const checkbox = document.getElementById(`select-video-${index}`);
        if (checkbox) checkbox.checked = false;
        const item = document.getElementById(`selection-item-${index}`);
        if (item) item.classList.remove(CSS.SELECTED);
    });
    updateSelectedCount();
}

// Seçili video sayısını güncelle
export function updateSelectedCount() {
    elements.selectedCount.textContent = state.selectedVideos.size;
}

// ===== PLAYLIST VİDEO LİSTESİ (İNDİRME SIRASINDA) =====

// Playlist video listesini render et
export function renderPlaylistVideoList() {
    const selectedIndices = Array.from(state.selectedVideos).sort((a, b) => a - b);

    // Playlist header bilgilerini doldur
    elements.playlistThumb.src = state.videoInfo.thumbnail || '';
    elements.playlistTitleDisplay.textContent = state.videoInfo.title || 'Playlist';
    elements.playlistChannelDisplay.textContent = state.videoInfo.channel || '';
    elements.playlistCountDisplay.textContent = `${selectedIndices.length} video seçili`;
    elements.completedCount.textContent = '0';
    elements.totalCount.textContent = selectedIndices.length;

    // Video listesini oluştur
    elements.playlistVideos.innerHTML = '';
    selectedIndices.forEach((originalIndex, displayIndex) => {
        const video = state.playlistVideos[originalIndex];
        const item = document.createElement('div');
        item.className = 'playlist-video-item';
        item.id = `video-item-${originalIndex}`;
        item.dataset.originalIndex = originalIndex;
        item.innerHTML = `
            <span class="video-item-index">${displayIndex + 1}</span>
            <span class="video-item-title" title="${video.title}">${video.title || 'Video ' + (originalIndex + 1)}</span>
            <span class="video-item-status" id="video-status-${originalIndex}">
                <span class="material-symbols-outlined">schedule</span>
                Bekliyor
            </span>
            <button class="video-item-cancel" id="video-cancel-${originalIndex}" title="İptal Et">
                <span class="material-symbols-outlined">close</span>
            </button>
        `;

        // İptal butonu event listener
        const cancelBtn = item.querySelector('.video-item-cancel');
        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cancelVideoFromQueue(originalIndex);
        });

        elements.playlistVideos.appendChild(item);
    });
}

// Video durumunu güncelle
export function updateVideoItemStatus(index, status) {
    const item = document.getElementById(`video-item-${index}`);
    const statusEl = document.getElementById(`video-status-${index}`);
    if (!item || !statusEl) return;

    item.classList.remove(CSS.DOWNLOADING, CSS.COMPLETED, CSS.ERROR, CSS.CANCELLED);

    switch (status) {
        case VIDEO_STATUS.DOWNLOADING:
            item.classList.add(CSS.DOWNLOADING);
            statusEl.innerHTML = `
                <div class="video-item-spinner"></div>
                İndiriliyor...
            `;
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            break;
        case VIDEO_STATUS.COMPLETED:
            item.classList.add(CSS.COMPLETED);
            statusEl.innerHTML = `
                <span class="material-symbols-outlined">check_circle</span>
                Tamamlandı
            `;
            // İptal butonunu gizle
            const cancelBtn = document.getElementById(`video-cancel-${index}`);
            if (cancelBtn) cancelBtn.style.display = 'none';
            break;
        case VIDEO_STATUS.ERROR:
            item.classList.add(CSS.ERROR);
            statusEl.innerHTML = `
                <span class="material-symbols-outlined">error</span>
                Hata
            `;
            break;
        case VIDEO_STATUS.CANCELLED:
            item.classList.add(CSS.CANCELLED);
            statusEl.innerHTML = `
                <span class="material-symbols-outlined">block</span>
                İptal Edildi
            `;
            break;
        default:
            statusEl.innerHTML = `
                <span class="material-symbols-outlined">schedule</span>
                Bekliyor
            `;
    }
}

// Tamamlanan video sayısını güncelle
export function updateCompletedCount(count) {
    state.completedVideos = count;
    elements.completedCount.textContent = count;
}

// Videoyu kuyruktan iptal et
export function cancelVideoFromQueue(index) {
    // Eğer bu video şu an indiriliyorsa, mevcut indirmeyi iptal et
    if (state.currentVideoIndex === index) {
        window.electronAPI.cancelDownload();
        state.isDownloading = false;
        updateVideoItemStatus(index, VIDEO_STATUS.CANCELLED);
        state.cancelledVideos.add(index);
        return;
    }

    // Bekleyen listeden çıkar
    state.cancelledVideos.add(index);
    updateVideoItemStatus(index, VIDEO_STATUS.CANCELLED);
}
