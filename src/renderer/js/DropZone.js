import { ItemFactory } from "./ItemFactory";
import { Settings } from "./Settings";

class DropZone {
  constructor() {
    this.dropzone = document.querySelector('.dropzone');
    this.convert_button = document.querySelector('.dropzone-convert-button');
    this.reset_button = document.querySelector('.dropzone-reset-button');
    this.bottom_container = document.querySelector('.dropzone-bottom-container');
    this.list_container = document.querySelector('.dropzone-list-container');
    this.buttons_container = document.querySelector('.dropzone-buttons-container');
    this.files = [];

    this.item_factory = new ItemFactory();
  }

  init() {
    this.convert_button.addEventListener('click', this.handle_convert_click.bind(this));
    this.reset_button.addEventListener('click', this.handle_reset_click.bind(this));
  }

  async handle_select_files_click() {
    const files = await window.electronAPI.selectFiles();

    if (files.length > 0) {
      this.dropzone.classList.add('hidden');

      this.buttons_container.classList.remove('hidden');
      this.list_container.classList.remove('hidden');
      this.bottom_container.classList.remove('hidden');

      for( let i = 0; i < files.length; i++ ) {
        const path = files[i];
        this.add_file_to_list(path);
      }
    }
  }

  async handle_select_folder_click() {
    const files = await window.electronAPI.selectFolder();

    if (files.length > 0) {
      this.dropzone.classList.add('hidden');

      this.buttons_container.classList.remove('hidden');
      this.list_container.classList.remove('hidden');
      this.bottom_container.classList.remove('hidden');

      for( let i = 0; i < files.length; i++ ) {
        if (files[i].toLowerCase().endsWith('.ttf')) {
          const path = files[i];
          this.add_file_to_list(path);
        }
      }
    }
  }

  is_in_list(filename) {
    return this.files.some(file => file.split('/').pop() === filename);
  }

  add_file_to_list(path) {
    const filename = path.split('/').pop();
    if (this.is_in_list(filename)) {
      return;
    }
    else {
      this.files.push(path);
      const index = this.files.length - 1;
      const url = window.electronAPI.loadFont(path);
      const item = this.item_factory.create_item(filename, url, this.remove_file_from_list.bind(this, filename));
      this.list_container.appendChild(item);
    }
  }

  remove_file_from_list(filename) {
    const item = this.list_container.querySelector(`[data-name="${filename}"]`);
    const index = this.files.indexOf(filename);
    this.files.splice(index, 1);
    item.remove();

    if (this.files.length === 0) {
      this.dropzone.classList.remove('hidden');
      this.list_container.classList.add('hidden');
      this.bottom_container.classList.add('hidden');
      this.buttons_container.classList.add('hidden');
    }
  }

  async handle_convert_click() {
    switch (Settings.output_format) {
      case 'zip':
        const path_to_zip = await window.electronAPI.compressFontsAndZip(this.files);
        console.log(path_to_zip);
        break;
      case 'folder':
        const path_to_folder = await window.electronAPI.compressFontsToFolder(this.files);
        console.log(path_to_folder);
        break;
      default:
        const response = await window.electronAPI.compressFonts(this.files);
        console.log(response);
        break;
    }
  }

  handle_reset_click() {
    this.files = [];
    this.list_container.innerHTML = '';
    this.list_container.classList.add('hidden');
    this.bottom_container.classList.add('hidden');
    this.buttons_container.classList.add('hidden');
    this.dropzone.classList.remove('hidden');
  }
}

export default DropZone;
