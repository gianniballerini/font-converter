const archiver = require('archiver');
const { dialog } = require('electron');
const fs = require('fs');
const { compress } = require('woff2-encoder');
const path = require('path');
const os = require('os');

class FontHandler {
  constructor() {
  }

  async compress_font(font_path) {
    const font_buffer = fs.readFileSync(font_path);
    const compressed_buffer = await compress(font_buffer);
    return compressed_buffer;
  }

  async compress_fonts(file_paths, sanitize) {
    const compressed_file_paths = [];
    const temp_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'converted-fonts-'));
    for (const file_path of file_paths) {
      try {
        const compressed_buffer = await this.compress_font(file_path);

        const file_name = sanitize === 'true' ? this.normalize_font_name(path.basename(file_path)) : path.basename(file_path, path.extname(file_path));
        const new_file_name = file_name + '.woff2';
        const new_file_path = path.join(temp_dir, new_file_name);
        fs.writeFileSync(new_file_path, compressed_buffer);

        compressed_file_paths.push(new_file_path);
      } catch (err) {
        console.error(`Failed to compress font: ${file_path}`, err);
      }
    }
    return {
      compressed_file_paths,
      temp_dir
    };
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

  async save_files(converted_files, temp_dir) {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select output folder',
      properties: ['openDirectory']
    });

    if (canceled || filePaths.length === 0) {
      return null;
    }

    const output_dir = filePaths[0];

    for (const file of fs.readdirSync(temp_dir)) {
      const src_path = path.join(temp_dir, file);
      const dest_path = path.join(output_dir, file);
      fs.copyFileSync(src_path, dest_path);
    }

    return output_dir;
  }

  normalize_font_name(font) {
    return font
      .replace(/\.[^/.]+$/, '')         // remove extension
      .replace(/[^a-zA-Z0-9\s]/g, '')    // keep only letters, numbers and spaces
      .replace(/([a-z])([A-Z])/g, '$1-$2') // handle camel/PascalCase
      .replace(/\s+/g, '_')             // replace spaces
      .toLowerCase();
  }

  async compress_fonts_to_same_origin(event, file_paths, sanitize) {
    const output_paths = [];

    for (const file_path of file_paths) {
      try {
        const compressed = await this.compress_font(file_path);

        const dir = path.dirname(file_path);
        // Remove both .ttf and .otf extensions if they exist
        const base_name = path.basename(file_path).replace(/\.(ttf|otf)$/, '');

        let out_path = path.join(dir, `${base_name}.woff2`);
        if (fs.existsSync(out_path)) {
          // Get all files in the directory
          const files = fs.readdirSync(dir);
          // Find the highest number used in existing files
          const pattern = new RegExp(`^${base_name}-(\\d+)\\.woff2$`);
          let max_num = 0;

          files.forEach(file => {
            const match = file.match(pattern);
            if (match) {
              const num = parseInt(match[1]);
              max_num = Math.max(max_num, num);
            }
          });

          // Create new file with next number
          out_path = path.join(dir, `${base_name}-${max_num + 1}.woff2`);
        }

        fs.writeFileSync(out_path, compressed);
        output_paths.push(out_path);
      } catch (err) {
        console.error(`Failed to compress ${ttf_path}:`, err);
      }
    }

    return output_paths;

  }

  async compress_and_zip(event, file_paths, sanitize) {
    const { compressed_file_paths, temp_dir } = await this.compress_fonts(file_paths, sanitize);
    const zip_path = await this.zip_files(compressed_file_paths);
    fs.rmSync(temp_dir, { recursive: true, force: true });

    return zip_path;
  }

  async compress_fonts_to_folder(event, file_paths, sanitize) {
    const { compressed_file_paths, temp_dir } = await this.compress_fonts(file_paths, sanitize);
    const output_dir = await this.save_files(compressed_file_paths, temp_dir);
    fs.rmSync(temp_dir, { recursive: true, force: true });

    return output_dir;
  }

}

module.exports = { FontHandler };
