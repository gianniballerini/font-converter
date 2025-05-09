import { Settings } from "./Settings";

class Loading {
  constructor() {
    this.$container = document.querySelector('.loading');
    this.$title = document.querySelector('.loading__title');
    this.loading = false;
    this.currentFontIndex = 0;
    this.timeAccumulator = 0;
  }

  show() {
    this.$container.classList.remove('hidden');
    this.loading = true;
    this.currentFontIndex = 0;
    this.timeAccumulator = 0;
  }

  hide() {
    this.$container.classList.add('hidden');
    this.loading = false;
  }

  update(deltaTime) {
    if (!this.loading) return;

    this.timeAccumulator += deltaTime;

    if (this.timeAccumulator >= 0.1) {
      const fontName = Settings.font_names[this.currentFontIndex];
      if (fontName) {
        this.$title.style.fontFamily = fontName;
      }
      this.currentFontIndex = (this.currentFontIndex + 1) % Settings.font_names.length;
      this.timeAccumulator = 0;
    }
  }
}

export { Loading };

