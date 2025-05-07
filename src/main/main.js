// src/main/main.js
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { compress } = require('woff2-encoder');
const archiver = require('archiver');
const os = require('os');

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
  console.log(process.env.VITE_DEV_SERVER_URL);
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

async function compress_font(fontPath) {
  const fontBuffer = fs.readFileSync(fontPath);
  const compressedBuffer = await compress(fontBuffer);
  return compressedBuffer;
}

async function zip_files(convertedFiles) {
  const { filePath: zipPath } = await dialog.showSaveDialog({
    defaultPath: 'converted-fonts.zip',
    filters: [
      { name: 'ZIP Archive', extensions: ['zip'] }
    ]
  });

  if (!zipPath) return;

  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  convertedFiles.forEach(file => {
    archive.file(file, { name: path.basename(file) });
  });

  await archive.finalize();
  return zipPath;
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('dialog:openFiles', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Fonts', extensions: ['ttf'] }]
    });
    return result.filePaths;
  });


  ipcMain.handle('dialog:select-folder', async () => {
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
  });

  /**
   * Handles compression of TTF fonts to WOFF2 format, zipping them, and saving the result
   */
  ipcMain.handle('compress-fonts-and-zip', async (event, filePaths) => {
    const { filePath: outputDir } = await dialog.showSaveDialog({
      defaultPath: 'converted-fonts.zip',
      filters: [{ name: 'ZIP Archive', extensions: ['zip'] }]
    });

    const convertedFiles = await Promise.all(filePaths.map(async (filePath) => {
      const fontBuffer = fs.readFileSync(filePath);
      const compressedBuffer = await compress(fontBuffer);

      const newFileName = path.basename(filePath, path.extname(filePath)) + '.woff2';
      const newFilePath = path.join(outputDir, newFileName);
      fs.writeFileSync(newFilePath, compressedBuffer);

      return newFilePath;
    }));

    const zipPath = await zip_files(convertedFiles);

    return zipPath;
  });

  /**
   * Handles compression of TTF fonts to WOFF2 format, saving them in a specified output directory
   */
  ipcMain.handle('compress-fonts-to-folder', async (event, filePaths) => {
    const { filePath: outputDir } = await dialog.showSaveDialog({
      defaultPath: 'converted-fonts'
    });

    if (!outputDir) return;

    await Promise.all(filePaths.map(async (filePath) => {
      const fontBuffer = fs.readFileSync(filePath);
      const compressedBuffer = await compress(fontBuffer);

      const newFileName = path.basename(filePath, path.extname(filePath)) + '.woff2';
      const newFilePath = path.join(outputDir, newFileName);
      fs.writeFileSync(newFilePath, compressedBuffer);
    }));

    return outputDir;
  });


  /**
   * Handles compression of TTF fonts to WOFF2 format, saving them in the same directory
   */
  ipcMain.handle('compress-fonts', async (event, filePaths) => {
    const outputPaths = [];

    for (const ttfPath of filePaths) {
      try {
        const fontFile = fs.readFileSync(ttfPath);
        const compressed = await compress(fontFile);

        const dir = path.dirname(ttfPath);
        const baseName = path.basename(ttfPath, '.ttf');

        let outPath = path.join(dir, `${baseName}.woff2`);
        if (fs.existsSync(outPath)) {
          // Get all files in the directory
          const files = fs.readdirSync(dir);
          // Find the highest number used in existing files
          const pattern = new RegExp(`^${baseName}-(\\d+)\\.woff2$`);
          let maxNum = 0;

          files.forEach(file => {
            const match = file.match(pattern);
            if (match) {
              const num = parseInt(match[1]);
              maxNum = Math.max(maxNum, num);
            }
          });

          // Create new file with next number
          outPath = path.join(dir, `${baseName}-${maxNum + 1}.woff2`);
        }

        fs.writeFileSync(outPath, compressed);
        outputPaths.push(outPath);
      } catch (err) {
        console.error(`Failed to compress ${ttfPath}:`, err);
      }
    }

    return outputPaths;
  });

});
