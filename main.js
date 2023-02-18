const { app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs');
const updater = require('electron-simple-updater');
let sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname + '/data/database.db');
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, permission INTEGER);');
db.run('IF NOT EXISTS(SELECT * FROM users WHERE username = "root") THEN INSERT INTO users (username, password, permission) VALUES ("root", "Password", 10); END IF;');
db.close();
let window;

updater.init({
  checkUpdateOnStart: true,
  autoDownload: true,
  logger: {
    info(...args) { ipcSend('update-log', 'info', ...args); },
    warn(...args) { ipcSend('update-log', 'warn', ...args); },
  },
});



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
ipcMain.on('goto', (event, arg) => {
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
