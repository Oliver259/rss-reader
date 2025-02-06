# RSS Reader

A simple RSS reader desktop application built with Electron.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Development](#development)
  - [File Structure](#file-structure)
  - [Hot Reloading](#hot-reloading)
- [Packaging](#packaging)
  - [Prerequisites](#prerequisites-1)
  - [Build and Package](#build-and-package)
  - [Remove Previous Installation](#remove-previous-installation)

## Prerequisites

- Node.js
- npm
- Electron Forge CLI

## Setup

1. **Clone the repository**:

   ```sh
   git clone https://github.com/your-username/rss-reader.git
   cd rss-reader
   ```

2. **Install dependencies**

    `npm install`

3. **Run the application**

    `npm start`

## Development
### File Structure
```
├── forge.config.js - Config file for Electron Forge
├── index.html - Main HTML file
├── main.js - Main process script
├── output.css - CSS file for styling
├── package-lock.json
├── package.json
├── preload.js - Preload script for the renderer process
├── readme.md - This file
├── renderer.js - Renderer process script
└── tailwind.config.js - Config file for tailwind
```

### Hot Reloading
Hot reloading is enabled using `electron-reload`. Uncomment the following lines in `main.js` to enable it:
```js
require("electron-reload")(__dirname, {
   electron: path.join(__dirname, "node_modules", ".bin", "electron"),
 });
```
## Packaging
\* These steps are written for Ubuntu
### Prerequisites
Ensure you have the necessary external binaries installed:
- `dpkg` and `fakeroot` for Debian packages

Install these binaries on Ubuntu:
```sh
sudo apt-get update
sudo apt-get install dpkg fakeroot
```

### Build and Package
1. **Build the application:**

```sh
npm run make
```

2. **Install the .deb package**

```sh
sudo dpkg -i out/make/deb/x64/rss-reader_1.0.0_amd64.deb\
```

3. **Run the applcication**

```sh
rss-reader
```

#### Remove Previous Installation:

1. **Remove the Previous Installation:** Use the dpkg command to remove the previously installed version of your application:

```sh
sudo dpkg -r rss-reader
```

2. **Install the New Version:** After removing the previous version, install the new version of the application:

```sh
sudo dpkg -i out/make/deb/x64/rss-reader_1.0.0_amd64.deb
```

3. **Run the Application:** After installing the new version, you can run the application from your application menu or by executing the command:

```sh
rss-reader
```