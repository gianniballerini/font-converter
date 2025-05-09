const archiver = require('archiver');
const { dialog } = require('electron');
const fs = require('fs');
const { compress } = require('woff2-encoder');
const path = require('path');

class FontHandler {
  constructor() {
    this.fonts = [];
  }

  async compress_font(fontPath) {
    const fontBuffer = fs.readFileSync(fontPath);
    const compressedBuffer = await compress(fontBuffer);
    return compressedBuffer;
  }

  async zip_files(convertedFiles) {
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

  async save_files(convertedFiles, tempDir) {
    const { filePath: outputDir } = await dialog.showSaveDialog({
      defaultPath: 'converted-fonts'
    });

    if (outputDir)
    {
      console.log('copying files');
      fs.cpSync(tempDir, outputDir, { recursive: true });
    }

    fs.rmSync(tempDir, { recursive: true, force: true });

    return outputDir || null;
  }

  normalize_font_name(font) {
    return font
      .replace(/\.[^/.]+$/, '')         // remove extension
      .replace(/[^a-zA-Z0-9\s]/g, '')    // keep only letters, numbers and spaces
      .replace(/([a-z])([A-Z])/g, '$1-$2') // handle camel/PascalCase
      .replace(/\s+/g, '-')             // replace spaces
      .toLowerCase();
  }

}

module.exports = { FontHandler };
