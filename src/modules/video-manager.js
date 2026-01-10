// ===== VİDEO YÖNETİMİ =====
import { elements } from './elements.js';
import { state } from './state.js';
import { CSS } from './constants.js';
import { showLoading, showError, formatDuration, formatNumber, sanitizeFilename, getUserFriendlyError } from './ui-helpers.js';
import { isValidUrl, updateQualityOptions } from './download-manager.js';
import { renderPlaylistSelection } from './playlist-manager.js';

// ===== URL İŞLEME =====

// URL değiştiğinde video bilgisini al
export async function handleUrlChange(url) {
    if (!url || !isValidUrl(url)) {
        hideVideoPreview();
        return;
    }

    showLoading(true);
    hideVideoPreview();

    try {
        const info = await window.electronAPI.getVideoInfo(url);
        state.videoInfo = info;
        displayVideoInfo(info);
    } catch (err) {
        showError(getUserFriendlyError(err) || 'Video bilgisi alınamadı');
    }

    showLoading(false);
}

// Video önizlemesini gizle
function hideVideoPreview() {
    elements.previewOptionsRow.classList.add(CSS.HIDDEN);
    elements.btnDownload.disabled = true;
    elements.progressSection.classList.add(CSS.HIDDEN);
    elements.errorMessage.classList.add(CSS.HIDDEN);
    elements.successMessage.classList.add(CSS.HIDDEN);
    elements.playlistSection.classList.add(CSS.HIDDEN);
    elements.playlistSelection.classList.add(CSS.HIDDEN);
    elements.playlistOptionsGroup.classList.add(CSS.HIDDEN);
}

// ===== VİDEO BİLGİSİ GÖSTER =====

// Video bilgisini göster
export function displayVideoInfo(info) {
    state.isPlaylist = info.isPlaylist || false;

    // Thumbnail yükleme hatası için fallback
    elements.videoThumbnail.onerror = () => {
        elements.videoThumbnail.style.display = 'none';
        elements.videoThumbnail.parentElement.classList.add(CSS.THUMBNAIL_FALLBACK);
    };
    elements.videoThumbnail.onload = () => {
        elements.videoThumbnail.style.display = 'block';
        elements.videoThumbnail.parentElement.classList.remove(CSS.THUMBNAIL_FALLBACK);
    };

    if (info.isPlaylist) {
        // Playlist görüntüleme
        elements.videoThumbnail.src = info.thumbnail || '';
        elements.videoDuration.textContent = `${info.videoCount} video`;
        elements.videoTitle.textContent = info.title || 'Playlist';
        elements.videoChannel.textContent = info.channel || 'Bilinmeyen Kanal';
        elements.videoViews.textContent = `${info.videoCount} video`;
        elements.videoLikes.textContent = '';
        state.playlistName = sanitizeFilename(info.title);
        state.playlistVideos = info.videos || [];

        // Tüm videoları seç
        state.selectedVideos = new Set(state.playlistVideos.map((_, i) => i));
        state.cancelledVideos = new Set();

        // Playlist seçeneklerini göster
        elements.playlistOptionsGroup.classList.remove(CSS.HIDDEN);

        // Playlist video seçim listesini oluştur
        renderPlaylistSelection();
        elements.playlistSelection.classList.remove(CSS.HIDDEN);
    } else {
        // Tekli video görüntüleme
        elements.videoThumbnail.src = info.thumbnail || '';
        elements.videoDuration.textContent = formatDuration(info.duration);
        elements.videoTitle.textContent = info.title || 'Bilinmeyen Video';
        elements.videoChannel.textContent = info.channel || 'Bilinmeyen Kanal';

        // Görüntülenme ve beğeni sayısı varsa göster, yoksa gizle
        const viewsStat = elements.videoViews.closest('.stat');
        const likesStat = elements.videoLikes.closest('.stat');

        if (info.views && info.views > 0) {
            elements.videoViews.textContent = formatNumber(info.views) + ' görüntüleme';
            if (viewsStat) viewsStat.style.display = '';
        } else {
            if (viewsStat) viewsStat.style.display = 'none';
        }

        if (info.likes && info.likes > 0) {
            elements.videoLikes.textContent = formatNumber(info.likes) + ' beğeni';
            if (likesStat) likesStat.style.display = '';
        } else {
            if (likesStat) likesStat.style.display = 'none';
        }

        state.playlistName = '';
        state.playlistVideos = [];
        state.selectedVideos = new Set();

        // Playlist seçeneklerini gizle
        elements.playlistOptionsGroup.classList.add(CSS.HIDDEN);
        elements.playlistSelection.classList.add(CSS.HIDDEN);
    }

    updateQualityOptions(info.formats);

    // Yan yana kapsayıcıyı göster
    elements.previewOptionsRow.classList.remove(CSS.HIDDEN);
    elements.btnDownload.disabled = false;
}
