// src/main/main.js
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { compress } = require('woff2-encoder');
const archiver = require('archiver');
const os = require('os');

const { FontHandler } = require('./FontHandler');
const fontHandler = new FontHandler();

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

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('dialog:openFiles', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Fonts', extensions: ['ttf', 'otf'] }]
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
   * Handles compression of TTF and OTF fonts to WOFF2 format, zipping them, and saving the result
   */
  ipcMain.handle('compress-fonts-and-zip', async (event, file_paths, sanitize) => {
    console.log(path.basename(file_paths[0]));

    const compressed_file_paths = [];
    const temp_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'converted-fonts-'));
    for (const file_path of file_paths) {
      try {
        const font_buffer = fs.readFileSync(file_path);
        const compressed_buffer = await compress(font_buffer);

        const file_name = sanitize ? fontHandler.normalize_font_name(path.basename(file_path)) : path.basename(file_path, path.extname(file_path));
        const new_file_name = file_name + '.woff2';
        const new_file_path = path.join(temp_dir, new_file_name);
        fs.writeFileSync(new_file_path, compressed_buffer);

        compressed_file_paths.push(new_file_path);
      } catch (err) {
        console.error(`Failed to compress font: ${file_path}`, err);
      }
    }
    const zip_path = await fontHandler.zip_files(compressed_file_paths);
    fs.rmSync(temp_dir, { recursive: true, force: true });

    return zip_path;
  });

  /**
   * Handles compression of TTF and OTF fonts to WOFF2 format, saving them in a specified output directory
   */
  ipcMain.handle('compress-fonts-to-folder', async (event, filePaths, sanitize) => {
    const convertedFiles = [];
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'converted-fonts-'));
    for (const filePath of filePaths) {
      try {
        const fontBuffer = fs.readFileSync(filePath);
        const compressedBuffer = await compress(fontBuffer);

        const newFileName = path.basename(filePath, path.extname(filePath)) + '.woff2';
        const newFilePath = path.join(tempDir, newFileName);
        fs.writeFileSync(newFilePath, compressedBuffer);

        convertedFiles.push(newFilePath);
      } catch (err) {
        console.error(`Failed to compress font: ${filePath}`, err);
      }
    }

    const outputDir = await save_files(convertedFiles, tempDir);

    return outputDir;
  });


  /**
   * Handles compression of TTF fonts to WOFF2 format, saving them in the same directory
   * making sure the file name is unique
   */
  ipcMain.handle('compress-fonts', async (event, filePaths, sanitize) => {
    const outputPaths = [];

    for (const filePath of filePaths) {
      try {
        const compressed = await fontHandler.compress_font(filePath);

        const dir = path.dirname(filePath);
        // Remove both .ttf and .otf extensions if they exist
        const baseName = path.basename(filePath).replace(/\.(ttf|otf)$/, '');

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
