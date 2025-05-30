class Settings {
  constructor() {
    this.output_dir = null;
    this.output_format = 'default';
    this.font_names = [];
    this.theme = 'default';
    this.theme_options = ['default', 'green', 'olive', 'marine', 'pink', 'blue'];
    this.sanitize = 'false';
  }

  init() {
    let local_storage_settings = localStorage.getItem('custom_settings')
    if (local_storage_settings) {
      local_storage_settings = JSON.parse(local_storage_settings)
      this.output_dir = local_storage_settings.output_dir || null
      this.output_format = local_storage_settings.output_format || 'default'
      this.font_names = local_storage_settings.font_names
      this.theme = local_storage_settings.theme || 'default'
      this.sanitize = local_storage_settings.sanitize || 'false'
    } else {
      this.save()
    }
  }

  save() {
    localStorage.setItem('custom_settings', JSON.stringify(this))
  }

  update(key, value) {
    this[key] = value
    this.save()
  }
}

const settings = new Settings();
settings.init()
export { settings as Settings };
