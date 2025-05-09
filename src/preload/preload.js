// src/preload/preload.js
const { contextBridge, ipcRenderer, shell } = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('electronAPI', {
  compressFonts: (filePaths) => ipcRenderer.invoke('compress-fonts', filePaths),
  compressFontsToFolder: (filePaths) => ipcRenderer.invoke('compress-fonts-to-folder', filePaths),
  compressFontsAndZip: (filePaths, sanitize) => ipcRenderer.invoke('compress-fonts-and-zip', filePaths, sanitize),
  selectFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
  openExternal: (url) => shell.openExternal(url),
  loadFont: (fontPath) => {
    const buffer = fs.readFileSync(fontPath);
    const uint8Array = new Uint8Array(buffer);
    return uint8Array;
  },
  getLocalFonts: () => fs.readdirSync('public/fonts')
});
