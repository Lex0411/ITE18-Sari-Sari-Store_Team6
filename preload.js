// Bridge between renderer and main process for security
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe file operations to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: () => ipcRenderer.invoke('read-file'),
  writeFile: (data) => ipcRenderer.invoke('write-file', data),
  fileExists: () => ipcRenderer.invoke('file-exists'),
});
