// Main Electron process - handles window creation and file operations
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Create application window
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');
  win.setTitle("Tres Sari-Sari Store Inventory");
}

// Path where inventory data is stored
const filePath = path.join(__dirname, 'inventory.json');

// Read inventory data from file
ipcMain.handle('read-file', async () => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
});

// Write inventory data to file
ipcMain.handle('write-file', async (_, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return true;
});

// Check if inventory file exists
ipcMain.handle('file-exists', async () => {
  return fs.existsSync(filePath);
});

// Start app when ready
app.whenReady().then(createWindow);