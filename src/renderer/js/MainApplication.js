import DropZone from "./DropZone";

class MainApplication {
  constructor() {
    this.github_link = document.querySelector('.footer__github-button');
    this.github_link_text = this.github_link.querySelector('.footer-link-text');
    this.donate_link = document.querySelector('.footer__donate-button');
    this.donate_link_text = this.donate_link.querySelector('.footer-link-text');

    this.dropzone = new DropZone();
  }

  init() {
    this.dropzone.init();
  }

  handle_github_link_click() {
    // TODO: Track
    window.electronAPI.openExternal('https://github.com/gianniballerini/font-converter');
  }

  handle_donate_link_click() {
    // TODO: Track
    window.electronAPI.openExternal('https://ohzi.io');
  }
}

export { MainApplication };
