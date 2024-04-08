# unsighted-randomeister-log-reader

Simple viewer and updater for logging files from https://github.com/TheG-Meister/unsighted-randomeister's.

## Project Setup

### Install

```bash
$ npm install
```

### Development

This project is built using Electron and React, uses EmotionJS for styling, and Typescript.

```bash
$ npm run dev
```

An electron project is split into "main", "renderer", and "prebuild".
* Main - Server side. Handles browser spawning, menu handling, and file system access. Also used to host the currently loadded log. Listens to events from the renderer using ipcMain
* Renderer - Client side. Handles renderering everything. Has limited access to everything and must go through the exposed API.
* Preload - Code ran by the renderer but has elevated privilages. Due to electron's permission model, it is recommended that all uses of ipcRenderer to communicate with the server occurs here. The actual functions are defined in api.ts.

#### My error numbers in the window look wrong!

React error numbers in the application window do not support sourcemaps. Open the developer console using F12 for the correct error number.

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
