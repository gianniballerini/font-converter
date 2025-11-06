# Font Converter

A desktop application built with Electron that allows users to convert fonts between different formats. This tool provides a user-friendly interface for font conversion tasks.

![](https://github.com/gianniballerini/font-converter/blob/main/public/icon.png?raw=true)

## Features

- Convert fonts between different formats
- Modern and intuitive user interface
- Cross-platform support (macOS, Windows, Linux)
- Built with Electron for native performance

## Prerequisites

- Node.js (Latest LTS version recommended)
- Yarn package manager

## Installation

1. Clone the repository:
```bash
git clone git@github.com:gianniballerini/font-converter.git
cd font-converter
```

2. Install dependencies:
```bash
yarn install
```

## Development

To run the application in development mode:

```bash
yarn start
```

This will start both the Vite development server and the Electron application.

## Building

To build the application for production:

```bash
rm -rf dist && yarn build && yarn dist
```

This will create platform-specific packages in the `dist` directory.

## Project Structure

```
font-converter/
├── src/
│   ├── main/         # Main process code
│   ├── renderer/     # Renderer process code
│   └── preload/      # Preload scripts
├── public/           # Static assets
├── build/            # Build resources
└── dist/            # Distribution files
```

## Technologies Used

- Electron - Cross-platform desktop application framework
- Vite - Next Generation Frontend Tooling
- SASS - CSS preprocessor
- Pug - Template engine
- Archiver - File archiving utilities
- woff2-encoder - WOFF2 font format support

## Scripts

- `yarn start` - Start development server
- `yarn build` - Build the application
- `yarn dist` - Create distributable packages

## License

MIT © Gianni Ballerini
