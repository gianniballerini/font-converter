import { Settings } from "./Settings";

class Preferences {
    constructor() {
        this.$container = document.querySelector('.preferences');
        this.$open_button = document.querySelector('.preferences__open-button');
        this.$close_button = document.querySelector('.preferences__close-button');

        // Preferences items
        this.$output_format_options = document.querySelector('.preferences__output-format-options');
        this.$theme_options = document.querySelector('.preferences__theme-options');

        this.$sanitize_options = document.querySelector('.preferences__sanitize-options');
        this.$sanitize_info = document.querySelector('.preferences__sanitize-info');
        this.$sanitize_info_icon = document.querySelector('.preferences__sanitize-info-icon');
    }

    init() {
        this.$open_button.addEventListener('click', this.open.bind(this));
        this.$close_button.addEventListener('click', this.close.bind(this));

        this.update_output_format(Settings.output_format);
        for (let i = 0; i < this.$output_format_options.children.length; i++) {
            const $option = this.$output_format_options.children[i];
            $option.addEventListener('click', this.update_output_format.bind(this, $option.dataset.option));
        }
        this.update_theme(Settings.theme);
        for (let i = 0; i < this.$theme_options.children.length; i++) {
            const $option = this.$theme_options.children[i];
            $option.addEventListener('click', this.update_theme.bind(this, $option.dataset.option));
        }

        this.update_sanitize(Settings.sanitize);
        for (let i = 0; i < this.$sanitize_options.children.length; i++) {
            const $option = this.$sanitize_options.children[i];
            $option.addEventListener('click', this.update_sanitize.bind(this, $option.dataset.option));
        }

        this.$sanitize_info_icon.addEventListener('mouseenter', this.open_sanitize_info.bind(this));
        this.$sanitize_info_icon.addEventListener('mouseleave', this.close_sanitize_info.bind(this));
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
        document.body.classList.remove('theme-' + Settings.theme);
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

    update_sanitize(option) {
        Settings.update('sanitize', option);
        for (let i = 0; i < this.$sanitize_options.children.length; i++) {
            const option = this.$sanitize_options.children[i];
            if (option.dataset.option !== option) {
                option.classList.remove('selected');
            }
        }
        this.$sanitize_options.querySelector(`[data-option="${option}"]`).classList.add('selected');
    }

    open_sanitize_info() {
        this.$sanitize_info.classList.remove('closed');
    }

    close_sanitize_info() {
        this.$sanitize_info.classList.add('closed');
    }
}

export { Preferences };
