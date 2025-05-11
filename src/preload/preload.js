// src/preload/preload.js
const { contextBridge, ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  compressFonts: (filePaths, sanitize) => ipcRenderer.invoke('compress-fonts', filePaths, sanitize),
  compressFontsToFolder: (filePaths, sanitize) => ipcRenderer.invoke('compress-fonts-to-folder', filePaths, sanitize),
  compressFontsAndZip: (filePaths, sanitize) => ipcRenderer.invoke('compress-fonts-and-zip', filePaths, sanitize),
  selectFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
  openExternal: (url) => shell.openExternal(url),
  openFontsFolder: (path) => ipcRenderer.send('open-folder', path),
  loadFont: (fontPath) => {
    const buffer = fs.readFileSync(fontPath);
    const uint8Array = new Uint8Array(buffer);
    return uint8Array;
  },
  getLocalFonts: () => {
    const fontDir = path.resolve(__dirname, '../renderer/fonts');
    const fonts = fs.readdirSync(fontDir);
    return fonts;
  }

});
