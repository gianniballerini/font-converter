class Settings {
  constructor() {
    this.settings = {
      output_dir: null,
      output_format: 'folder'
    };
  }
}

const settings = new Settings();
export { settings as Settings };
