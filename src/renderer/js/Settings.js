class Settings {
  constructor() {
    this.output_dir = null;
    this.output_format = 'default';
    this.font_names = [];
  }
}

const settings = new Settings();
export { settings as Settings };
