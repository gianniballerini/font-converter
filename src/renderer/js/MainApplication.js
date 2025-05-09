import DropZone from "./DropZone";
import { RenderLoop } from "./RenderLoop";
import { Settings } from "./Settings";

class MainApplication {
  constructor() {
    this.$github_link = document.querySelector('.footer__github-button');
    this.$github_link_text = this.$github_link.querySelector('.footer-link-text');
    this.$donate_link = document.querySelector('.footer__donate-button');
    this.$donate_link_text = this.$donate_link.querySelector('.footer-link-text');
    this.font_names = [];

    this.dropzone = new DropZone();
    this.render_loop = new RenderLoop(this);
  }

  init() {
    this.dropzone.init();
    this.load_app_fonts();
    this.render_loop.start();
  }

  handle_github_link_click() {
    // TODO: Track
    window.electronAPI.openExternal('https://github.com/gianniballerini/font-converter');
  }

  handle_donate_link_click() {
    // TODO: Track
    window.electronAPI.openExternal('https://ohzi.io');
  }

  // loads all the fonts in public/fonts and creates fontface rules for them
  load_app_fonts() {
    const fonts = window.electronAPI.getLocalFonts();
    const font_names = []
    for (let i = 0; i < fonts.length; i++) {
      const font = fonts[i];
      const font_name = this.normalize_font_name(font);
      if (font.endsWith('.woff2') && !font_names.includes(font_name)) {
        font_names.push(font_name);
        const fontFace = new FontFace(font_name, `url(/fonts/${font})`);
        document.fonts.add(fontFace);
      }
    }
    Settings.font_names = font_names;
  }

  normalize_font_name(font) {
    return font
      .replace(/\.[^/.]+$/, '')         // remove extension
      .replace(/[^a-zA-Z0-9\s]/g, '')    // keep only letters, numbers and spaces
      .replace(/([a-z])([A-Z])/g, '$1-$2') // handle camel/PascalCase
      .replace(/\s+/g, '-')             // replace spaces
      .toLowerCase();
  }

  update(deltaTime) {
    this.dropzone.update(deltaTime);
  }
}

export { MainApplication };
