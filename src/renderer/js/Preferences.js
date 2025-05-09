import { Settings } from "./Settings";

class Preferences {
    constructor() {
        this.$container = document.querySelector('.preferences');
        this.$open_button = document.querySelector('.preferences__open-button');
        this.$close_button = document.querySelector('.preferences__close-button');

        // Preferences items
        this.$output_format_options = document.querySelector('.preferences__output-format-options');
        this.$theme_options = document.querySelector('.preferences__theme-options');
    }

    init() {
        this.$open_button.addEventListener('click', this.open.bind(this));
        this.$close_button.addEventListener('click', this.close.bind(this));

        this.update_output_format(Settings.output_format);
        for (let i = 0; i < this.$output_format_options.children.length; i++) {
            const option = this.$output_format_options.children[i];
            option.addEventListener('click', this.update_output_format.bind(this, option.dataset.option));
        }
        this.update_theme(Settings.theme);
        for (let i = 0; i < this.$theme_options.children.length; i++) {
            const option = this.$theme_options.children[i];
            option.addEventListener('click', this.update_theme.bind(this, option.dataset.option));
        }
    }

    open() {
        this.$open_button.classList.add('hidden');
        this.$close_button.classList.remove('hidden');
        this.$container.classList.remove('closed');
    }

    close() {
        this.$open_button.classList.remove('hidden');
        this.$close_button.classList.add('hidden');
        this.$container.classList.add('closed');
    }

    update_output_format(option) {
        Settings.update('output_format', option);
        for (let i = 0; i < this.$output_format_options.children.length; i++) {
            const option = this.$output_format_options.children[i];
            if (option.dataset.option !== option) {
                option.classList.remove('selected');
            }
        }
        this.$output_format_options.querySelector(`[data-option="${option}"]`).classList.add('selected');
    }

    update_theme(option) {
        Settings.update('theme', option);
        document.body.classList.add('theme-' + option);
        for (let i = 0; i < this.$theme_options.children.length; i++) {
            const option = this.$theme_options.children[i];
            if (option.dataset.option !== option) {
                option.classList.remove('selected');
            }
        }
        this.$theme_options.querySelector(`[data-option="${option}"]`).classList.add('selected');
    }
}

export { Preferences };
