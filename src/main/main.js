// src/main/main.js
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { compress } = require('woff2-encoder');
const archiver = require('archiver');
const os = require('os');

const { FontHandler } = require('./FontHandler');

function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 700,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load renderer output from dev server or file
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

/**
 * Gets all files recursively from a folder
 * @returns {Promise<string[]>} - An array of file paths
 */
async function get_all_files_recursively() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) return [];

  const folderPath = result.filePaths[0];
  const allFiles = [];

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        allFiles.push(filePath);
      }
    }
  }

  walkDir(folderPath);
  return allFiles;
}

/**
 * Opens a file dialog and returns the selected file paths
 * @returns {Promise<string[]>} - An array of file paths
 */
async function open_files() {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Fonts', extensions: ['ttf', 'otf'] }]
  });
  return result.filePaths;
}

app.whenReady().then(() => {
  const fontHandler = new FontHandler();
  createWindow();

  ipcMain.handle('dialog:openFiles', open_files);


  ipcMain.handle('dialog:select-folder', get_all_files_recursively);

  /**
   * Handles compression
   * saving them in the same directory
   * making sure the file name is unique
   * this is the default behavior
   */
  ipcMain.handle('compress-fonts', fontHandler.compress_fonts_to_same_origin.bind(fontHandler));

  ipcMain.handle('compress-fonts-and-zip', fontHandler.compress_and_zip.bind(fontHandler));

  ipcMain.handle('compress-fonts-to-folder', fontHandler.compress_fonts_to_folder.bind(fontHandler));

});
