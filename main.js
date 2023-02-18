const { app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs');
const updater = require('electron-simple-updater');
let window;

updater.init({
  checkUpdateOnStart: true,
  autoDownload: true,
  logger: {
    info(...args) { ipcSend('update-log', 'info', ...args); },
    warn(...args) { ipcSend('update-log', 'warn', ...args); },
  },
});

var dataPath = __dirname + '/data';

if (fs.existsSync(dataPath)) {
  const stats = fs.statSync(path.join(dataPath, 'users.db'));
}
else {
  fs.mkdirSync(dataPath);
  fs.writeFileSync(dataPath + '/users.db', 'user:root,password:Password');
  const stats = fs.statSync(path.join(dataPath, 'users.db'));
}

updater
  .on('update-available', m => ipcSend('update-available', m))
  .on('update-downloading', () => ipcSend('update-downloading'))
  .on('update-downloaded', () => ipcSend('update-downloaded'));

ipcMain.handle('getBuild', () => updater.buildId);
ipcMain.handle('getVersion', () => updater.version);
ipcMain.handle('checkForUpdates', () => { updater.checkForUpdates(); });
ipcMain.handle('downloadUpdate', () => { updater.downloadUpdate(); });
ipcMain.handle('quitAndInstall', () => { updater.quitAndInstall(); });
ipcMain.handle('setOption', (_, opt, val) => { updater.setOptions(opt, val); });
ipcMain.on('gotomenue', (event, arg) => {
  if(arg=='main')
  {
    window.loadFile('index.html');
  }
});
  

app.on('ready', () => {
  window = new BrowserWindow({autoHideMenuBar: true, fullscreen: true, resizable: false, webPreferences: {nodeIntegration: true, contextIsolation: false, enableRemoteModule: true}});
  window.loadFile('loading.html');
  setTimeout(() => window.loadFile('login.html'), 3000);
});

function ipcSend(event, ...args) {
  window?.webContents.send('updater-event', event, ...args);
}
