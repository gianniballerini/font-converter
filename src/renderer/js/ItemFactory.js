class ItemFactory {
  constructor() {
    this.template = document.querySelector('.file-item-template');
  }

  create_item(name, buffer, on_delete) {
    const item = this.template.cloneNode(true);
    const delete_button = item.querySelector('.file-item__action--delete');
    item.classList.remove('file-item-template');
    item.classList.remove('hidden');
    item.dataset.name = name;
    item.querySelector('.file-item__name').textContent = name;
    delete_button.addEventListener('click', on_delete);
    this.load_font(buffer, name, item);
    return item;
  }

  async load_font(buffer, name, item) {
    try {
      const blob = new Blob([buffer], { type: 'font/ttf' });
      const blobUrl = URL.createObjectURL(blob);
      const sanitized_name = name.replace(/[^a-zA-Z0-9]/g, '');

      const fontFace = new FontFace(sanitized_name, `url("${blobUrl}")`);

      await fontFace.load();
      document.fonts.add(fontFace);

      item.querySelector('.file-item__name').style.fontFamily = sanitized_name;
      // console.log(`✅ Loaded font: ${name}`);
    } catch (error) {
      console.error(`❌ Error loading font: ${name}`, error);
      item.classList.add('font-load-error');
      item.querySelector('.file-item__name').textContent += ' (❌ probably corrupted)';
    }
  }
}

export { ItemFactory };
