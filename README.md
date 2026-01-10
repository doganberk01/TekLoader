# 🎬 TekLoader – Video Downloader Application

A modern **desktop application** for downloading videos and audio from **YouTube** and other platforms.  
It uses **yt-dlp** and **FFmpeg** for high-quality downloads.  
Built with **Electron** for a native desktop experience.

[![Download](https://img.shields.io/badge/Download-Windows-blue?style=for-the-badge&logo=windows)](https://github.com/doganberk01/TekLoader/releases/latest)
[![Release](https://img.shields.io/github/v/release/doganberk01/TekLoader?style=for-the-badge)](https://github.com/doganberk01/TekLoader/releases)

---

## 📝 Overview

TekLoader is a desktop application with a user-friendly interface for downloading YouTube videos and playlists.  
Supports MP4 (video) and MP3 (audio) formats with quality options up to 4K.  
Features multi-language support (Turkish/English) and theme customization.

---

## 🗂️ Project Structure

A brief overview of the main files and folders in this project.

| **Folder / File** | **Description** |
|---------------------|-------------|
| 🏠 `main.js`         | Electron main process |
| 🔗 `preload.js`      | IPC bridge between main and renderer |
| 🎨 `src/`            | Frontend (HTML, CSS, JavaScript modules) |
| ⚙️ `src/modules/`    | Modular JavaScript files (11 modules) |
| 📦 `assets/bin/`     | yt-dlp and FFmpeg binaries (not included) |
| 🖼️ `assets/icons/`   | Application icons |

---

## ⚙️ Technologies Used

| **Layer** | **Technology** | **Purpose** |
|-----------|------------|---------|
| 🖥️ **Framework** | Electron | Cross-platform desktop application |
| 🎬 **Download Engine** | yt-dlp | Video/audio downloading |
| 🎞️ **Media Processing** | FFmpeg | Format conversion and merging |
| 🎨 **UI** | HTML, CSS, JavaScript | Modern responsive interface |
| 📦 **Packaging** | electron-builder (NSIS) | Windows installer creation |

---

## ✨ Key Features

| **Feature** | **Description** |
|---------|-------------|
| 🎥 Video Download | Download videos in MP4 format (360p to 4K) |
| 🎵 Audio Download | Extract audio in high-quality MP3 format |
| 📋 Playlist Support | Download entire playlists at once |
| 🌙 Theme Options | Light, Dark, and System theme support |
| 🌍 Multi-Language | Turkish and English interface |
| � Download History | View and re-download from history |
| 🔄 Auto-Update | Update yt-dlp engine with one click |
| 🔔 Notifications | Windows notifications on download complete |

---

## �️ Setup & Usage

To run the project locally on your computer:

### 1️⃣ Clone the repository
```bash
git clone https://github.com/doganberk01/TekLoader.git
```

### 2️⃣ Enter the project directory
```bash
cd TekLoader
```

### 3️⃣ Install dependencies
```bash
npm install
```

### 4️⃣ Download yt-dlp and FFmpeg
- Download [yt-dlp.exe](https://github.com/yt-dlp/yt-dlp/releases) from GitHub
- Download [FFmpeg](https://ffmpeg.org/download.html) from official site
- Place both `yt-dlp.exe` and `ffmpeg.exe` in `assets/bin/` folder

### 5️⃣ Run the application
```bash
npm start
```

### 6️⃣ Build installer (Optional)
```bash
npx electron-builder --win --x64
```

---

## 📝 Notes

* **First run:** Windows Defender/SmartScreen may scan unsigned applications, causing a slight delay on first launch.
* **yt-dlp Updates:** Use the "Update Engine" button in Settings to keep yt-dlp up to date.
* **Supported Platforms:** YouTube, YouTube Music, and other platforms supported by yt-dlp.
* **FFmpeg:** Required for merging video and audio streams. Place `ffmpeg.exe` in `assets/bin/` folder.

---

## 👨‍💻 Author

**Doğan Berk**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/doganberk01)  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/doğan-berk-07a72b201)

---
