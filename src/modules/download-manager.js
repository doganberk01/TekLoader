// ===== İNDİRME YÖNETİMİ =====
import { elements } from './elements.js';
import { state } from './state.js';
import { CSS, FORMAT, VIDEO_STATUS, QUALITY_MAP } from './constants.js';
import { showError, showSuccess, showPlaylistSuccess, sanitizeFilename, getUserFriendlyError } from './ui-helpers.js';
import { addToHistoryIfEnabled } from './settings-manager.js';
import { renderPlaylistVideoList, updateVideoItemStatus, updateCompletedCount } from './playlist-manager.js';

// ===== URL DOĞRULAMA =====

// URL'nin geçerli olup olmadığını kontrol et
export function isValidUrl(url) {
    // YouTube
    if (url.includes('youtube.com/watch') ||
        url.includes('youtu.be/') ||
        url.includes('youtube.com/shorts/') ||
        url.includes('youtube.com/playlist')) {
        return true;
    }
    // TikTok
    if (url.includes('tiktok.com/') || url.includes('vm.tiktok.com/')) {
        return true;
    }
    // Instagram
    if (url.includes('instagram.com/p/') ||
        url.includes('instagram.com/reel/') ||
        url.includes('instagram.com/stories/')) {
        return true;
    }
    // Facebook
    if (url.includes('facebook.com/watch') ||
        url.includes('facebook.com/reel/') ||
        url.includes('facebook.com/') && url.includes('/videos/') ||
        url.includes('fb.watch/')) {
        return true;
    }
    // Twitter/X
    if (url.includes('twitter.com/') && url.includes('/status/') ||
        url.includes('x.com/') && url.includes('/status/')) {
        return true;
    }
    return false;
}

// ===== KALİTE SEÇENEKLERİ =====

// Kalite seçeneklerini güncelle
export function updateQualityOptions(formats) {
    const availableHeights = new Set();

    if (formats && formats.length > 0) {
        formats.forEach(f => {
            if (f.height && f.vcodec !== 'none') {
                availableHeights.add(f.height);
            }
        });
    }

    const maxHeight = availableHeights.size > 0 ? Math.max(...availableHeights) : 0;
    const qualitySelect = elements.qualitySelect;
    const options = qualitySelect.querySelectorAll('option');

    options.forEach(option => {
        const value = option.value;

        if (value === 'best') {
            option.style.display = '';
            return;
        }

        const height = QUALITY_MAP[value];
        if (height) {
            if (maxHeight === 0 || height <= maxHeight) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        }
    });

    // Seçili değer gizlenmişse "En İyi" seç
    const selectedOption = qualitySelect.options[qualitySelect.selectedIndex];
    if (selectedOption && selectedOption.style.display === 'none') {
        qualitySelect.value = 'best';
        state.quality = 'best';
    }
}

// Format değiştir
export function setFormat(format) {
    state.format = format;
    elements.btnVideo.classList.toggle(CSS.ACTIVE, format === FORMAT.VIDEO);
    elements.btnAudio.classList.toggle(CSS.ACTIVE, format === FORMAT.AUDIO);
    elements.qualityGroup.style.display = format === FORMAT.AUDIO ? 'none' : 'flex';
}

// ===== İNDİRME İŞLEMLERİ =====

// İndirmeyi başlat
export async function startDownload() {
    if (!state.videoInfo) return;

    elements.urlSection.classList.add(CSS.HIDDEN);
    elements.previewOptionsRow.classList.add(CSS.HIDDEN);
    elements.playlistSelection.classList.add(CSS.HIDDEN);
    elements.btnDownload.classList.add(CSS.HIDDEN);
    elements.successMessage.classList.add(CSS.HIDDEN);
    elements.errorMessage.classList.add(CSS.HIDDEN);

    state.currentVideoIndex = -1;
    state.completedVideos = 0;
    state.isDownloading = true;
    state.cancelledVideos = new Set();

    if (state.isPlaylist) {
        await downloadSelectedVideos();
    } else {
        elements.progressSection.classList.remove(CSS.HIDDEN);

        const filename = sanitizeFilename(state.videoInfo.title) +
            (state.format === FORMAT.VIDEO ? '.mp4' : '.mp3');

        elements.progressFilename.textContent = filename;
        elements.progressPercent.textContent = '0%';
        elements.progressBar.style.width = '0%';

        try {
            const result = await window.electronAPI.downloadVideo({
                url: elements.urlInput.value,
                format: state.format,
                quality: state.quality,
                outputPath: state.downloadPath,
                filename: filename,
                isPlaylist: false,
                playlistName: ''
            });

            state.lastDownloadedFile = result.filePath;
            state.isDownloading = false;

            await addToHistoryIfEnabled({
                title: state.videoInfo.title,
                thumbnail: state.videoInfo.thumbnail,
                url: elements.urlInput.value,
                format: state.format,
                quality: state.quality
            });

            await window.electronAPI.sendNotification(
                'İndirme Tamamlandı',
                `${state.videoInfo.title} başarıyla indirildi.`
            );

            showSuccess();
        } catch (err) {
            state.isDownloading = false;
            showError(getUserFriendlyError(err));
        }
    }
}

// Seçili videoları indir
export async function downloadSelectedVideos() {
    const selectedIndices = Array.from(state.selectedVideos).sort((a, b) => a - b);

    if (selectedIndices.length === 0) {
        showError('Lütfen en az bir video seçin');
        return;
    }

    renderPlaylistVideoList();
    elements.playlistSection.classList.remove(CSS.HIDDEN);
    elements.progressSection.classList.remove(CSS.HIDDEN);

    elements.progressFilename.textContent = state.playlistName;
    elements.progressPercent.textContent = '0%';
    elements.progressBar.style.width = '0%';
    elements.progressStatus.textContent = 'Hazırlanıyor...';

    const useNumbers = elements.useNumbersCheckbox.checked;
    const ext = state.format === FORMAT.VIDEO ? '.mp4' : '.mp3';
    let completedCount = 0;

    for (let i = 0; i < selectedIndices.length; i++) {
        const originalIndex = selectedIndices[i];

        if (state.cancelledVideos.has(originalIndex)) {
            continue;
        }

        const video = state.playlistVideos[originalIndex];
        state.currentVideoIndex = originalIndex;
        updateVideoItemStatus(originalIndex, VIDEO_STATUS.DOWNLOADING);

        let filename;
        if (useNumbers) {
            const paddedIndex = String(i + 1).padStart(2, '0');
            filename = `${paddedIndex} - ${sanitizeFilename(video.title)}${ext}`;
        } else {
            filename = `${sanitizeFilename(video.title)}${ext}`;
        }

        elements.progressFilename.textContent = filename;
        elements.progressStatus.textContent = `İndiriliyor (${i + 1}/${selectedIndices.length})`;

        try {
            const videoUrl = video.url || `https://www.youtube.com/watch?v=${video.id}`;

            await window.electronAPI.downloadSingleVideo({
                url: videoUrl,
                format: state.format,
                quality: state.quality,
                outputPath: state.downloadPath + '/' + state.playlistName,
                filename: filename,
                videoIndex: originalIndex
            });

            updateVideoItemStatus(originalIndex, VIDEO_STATUS.COMPLETED);
            completedCount++;
            updateCompletedCount(completedCount);

            await addToHistoryIfEnabled({
                title: video.title,
                thumbnail: video.thumbnail || state.videoInfo.thumbnail,
                url: videoUrl,
                format: state.format,
                quality: state.quality
            });
        } catch (err) {
            if (err.message === 'İndirme iptal edildi') {
                updateVideoItemStatus(originalIndex, VIDEO_STATUS.CANCELLED);
                state.cancelledVideos.add(originalIndex);
            } else {
                updateVideoItemStatus(originalIndex, VIDEO_STATUS.ERROR);
            }
        }

        if (!state.isDownloading) {
            break;
        }
    }

    state.isDownloading = false;
    state.currentVideoIndex = -1;
    state.lastDownloadedFile = state.downloadPath + '\\' + state.playlistName;

    await window.electronAPI.sendNotification(
        'Playlist İndirme Tamamlandı',
        `${state.videoInfo.title} - ${completedCount} video indirildi.`
    );

    showPlaylistSuccess();
}

// İndirmeyi iptal et
export function cancelCurrentDownload() {
    window.electronAPI.cancelDownload();
    state.isDownloading = false;

    if (state.isPlaylist && state.currentVideoIndex >= 0) {
        updateVideoItemStatus(state.currentVideoIndex, VIDEO_STATUS.CANCELLED);
        state.cancelledVideos.add(state.currentVideoIndex);
    }
}

// ===== İLERLEME GÜNCELLEME =====

// İlerleme callback'ini işle
export function handleProgress(data) {
    if (data.percent !== undefined) {
        const percent = Math.round(data.percent);
        elements.progressPercent.textContent = percent + '%';
        elements.progressBar.style.width = percent + '%';
    }

    if (data.speed) {
        elements.progressSpeed.textContent = data.speed;
    }

    if (data.eta) {
        elements.progressEta.textContent = data.eta + ' kaldı';
    }

    if (data.status) {
        if (!state.isPlaylist) {
            elements.progressStatus.textContent = data.status;
        }
    }
}
