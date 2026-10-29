// ===== ARAYÜZ YARDIMCI FONKSİYONLAR =====
import { elements } from './elements.js';
import { state } from './state.js';
import { CSS } from './constants.js';

// ===== FORMAT FONKSİYONLARI =====

// Süre formatla (saniye -> dakika:saniye)
export function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Sayı formatla (1000 -> 1K, 1000000 -> 1M)
export function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Tarih formatla
export function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Dosya adını temizle
export function sanitizeFilename(name) {
    if (!name) return 'video';
    return name.replace(/[<>:"/\\|?*]/g, '').substring(0, 100);
}

// ===== HATA MESAJLARI =====

// Kullanıcı dostu hata mesajı
export function getUserFriendlyError(error) {
    let errorStr = error?.message || error?.toString() || '';

    // IPC hatalarını en başta temizle ('download-video' içindeki 'download' kelimesinin yanıltmaması için)
    if (errorStr.includes('Error invoking remote method')) {
        const match = errorStr.match(/Error:\s*(.+)$/s);
        if (match) {
            errorStr = match[1].trim();
        }
    }

    // İptal durumu
    if (errorStr.includes('iptal edildi') || errorStr.includes('cancelled')) {
        return 'İndirme iptal edildi';
    }

    // 403 Forbidden (eski yt-dlp sürümü veya YouTube engeli)
    if (errorStr.includes('403') || errorStr.includes('Forbidden')) {
        return 'İndirme reddedildi (403). Lütfen Ayarlar > Hakkında bölümünden İndirme Motorunu güncelleyin.';
    }

    // Ağ hataları
    if (errorStr.includes('ENOTFOUND') || errorStr.includes('network') || errorStr.includes('timeout')) {
        return 'İnternet bağlantısı hatası';
    }

    // Video bulunamadı
    if (errorStr.includes('not found') || errorStr.includes('unavailable') || errorStr.includes('private')) {
        return 'Video bulunamadı veya erişilemiyor';
    }

    // Yaş kısıtlaması
    if (errorStr.includes('age') || errorStr.includes('sign in')) {
        return 'Video yaş kısıtlamalı veya giriş gerektiriyor';
    }

    // Format hatası
    if (errorStr.includes('format') || errorStr.includes('no video')) {
        return 'İstenilen kalite bulunamadı';
    }

    // Disk hatası
    if (errorStr.includes('ENOSPC') || errorStr.includes('disk')) {
        return 'Disk alanı yetersiz';
    }

    // Genel indirme hatası
    if (errorStr.includes('download') || errorStr.includes('Download') || errorStr.includes('İndirme başarısız')) {
        return 'İndirme başarısız oldu';
    }

    // Varsayılan
    return 'Bir hata oluştu';
}

// ===== ARAYÜZ DURUM FONKSİYONLARI =====

// Yükleniyor göster/gizle
export function showLoading(show) {
    elements.loading.classList.toggle(CSS.HIDDEN, !show);
}

// Hata mesajı göster
export function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove(CSS.HIDDEN);
    elements.progressSection.classList.add(CSS.HIDDEN);
    elements.btnDownload.classList.remove(CSS.HIDDEN);
    elements.urlSection.classList.remove(CSS.HIDDEN);
    elements.previewOptionsRow.classList.remove(CSS.HIDDEN);
    if (state.isPlaylist) {
        elements.playlistSelection.classList.remove(CSS.HIDDEN);
    }
}

// Başarı mesajı göster
export function showSuccess() {
    elements.progressSection.classList.add(CSS.HIDDEN);
    elements.successMessage.classList.remove(CSS.HIDDEN);
    elements.btnDownload.classList.remove(CSS.HIDDEN);
    elements.urlSection.classList.remove(CSS.HIDDEN);
    elements.previewOptionsRow.classList.remove(CSS.HIDDEN);
}

// Playlist başarı mesajı göster
export function showPlaylistSuccess() {
    elements.progressSection.classList.add(CSS.HIDDEN);
    elements.successMessage.classList.remove(CSS.HIDDEN);
    elements.urlSection.classList.remove(CSS.HIDDEN);
}

// Tüm Arayüz elemanlarını gizle
export function hideAll() {
    elements.previewOptionsRow.classList.add(CSS.HIDDEN);
    elements.btnDownload.disabled = true;
    elements.progressSection.classList.add(CSS.HIDDEN);
    elements.errorMessage.classList.add(CSS.HIDDEN);
    elements.successMessage.classList.add(CSS.HIDDEN);
    elements.playlistSection.classList.add(CSS.HIDDEN);
    elements.playlistSelection.classList.add(CSS.HIDDEN);
    elements.playlistOptionsGroup.classList.add(CSS.HIDDEN);
    elements.urlSection.classList.remove(CSS.HIDDEN);
}

// ===== SAĞ TUŞ MENÜSÜ =====

// Sağ tuş menüsünü göster
export function showContextMenu(x, y) {
    const menu = elements.contextMenu;
    menu.classList.remove(CSS.HIDDEN);

    // Ekran sınırları kontrolü
    const menuRect = menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let posX = x;
    let posY = y;

    if (x + menuRect.width > windowWidth) {
        posX = windowWidth - menuRect.width - 10;
    }
    if (y + menuRect.height > windowHeight) {
        posY = windowHeight - menuRect.height - 10;
    }

    menu.style.left = posX + 'px';
    menu.style.top = posY + 'px';
}

// Sağ tuş menüsünü gizle
export function hideContextMenu() {
    elements.contextMenu.classList.add(CSS.HIDDEN);
}

// ===== ONAY MODALI =====

// Özel onay modalı göster
export function showConfirmModal(title, message, okText = 'Evet, Sil') {
    return new Promise((resolve) => {
        elements.confirmTitle.textContent = title;
        elements.confirmMessage.textContent = message;
        elements.confirmOk.textContent = okText;
        elements.confirmModal.classList.remove(CSS.HIDDEN);

        const handleOk = () => {
            elements.confirmModal.classList.add(CSS.HIDDEN);
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            elements.confirmModal.classList.add(CSS.HIDDEN);
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            elements.confirmOk.removeEventListener('click', handleOk);
            elements.confirmCancel.removeEventListener('click', handleCancel);
        };

        elements.confirmOk.addEventListener('click', handleOk);
        elements.confirmCancel.addEventListener('click', handleCancel);
    });
}
