const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const distPath = path.join(__dirname, 'dist', 'win-unpacked');

// Düzenlenecek EXE dosyaları
const exeFiles = [
    'TekLoader.exe'
];

// Metadata ayarları
const options = {
    'product-version': '1.0.0',
    'file-version': '1.0.0',
    'version-string': {
        'ProductName': 'TekLoader',
        'FileDescription': 'TekLoader - Video İndirici',
        'CompanyName': 'D.Berk',
        'LegalCopyright': 'Copyright © 2026 D.Berk',
        'OriginalFilename': 'TekLoader.exe',
        'InternalName': 'TekLoader'
    },
    'icon': path.join(__dirname, 'assets', 'icons', 'icon.ico')
};

async function fixExeMetadata() {
    console.log('🔧 EXE metadata düzeltiliyor...\n');

    for (const exe of exeFiles) {
        const exePath = path.join(distPath, exe);

        if (fs.existsSync(exePath)) {
            try {
                console.log(`📝 ${exe} düzenleniyor...`);
                await rcedit(exePath, options);
                console.log(`✅ ${exe} başarıyla düzenlendi!`);
            } catch (err) {
                console.error(`❌ ${exe} düzenlenemedi:`, err.message);
            }
        } else {
            console.log(`⚠️ ${exe} bulunamadı, atlanıyor...`);
        }
    }

    console.log('\n✨ Metadata düzeltme tamamlandı!');
}

fixExeMetadata();
