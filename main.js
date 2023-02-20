const { app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs');
const updater = require('electron-simple-updater');
let sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname + '/data/database.db');
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, permission INTEGER);');
db.run('INSERT INTO users (username, password, permission) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = ?)', ['root', 'Password', 10, 'root']);
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
  switch (arg) {
    case 'menu': window.loadFile('menu.html'); break;
    case 'createShow': window.loadFile('createShow.html'); break;
    case 'editShow': window.loadFile('editShow.html'); break;
    case 'manageShows': window.loadFile('manageShows.html'); break;
    case 'simpleConsole': window.loadFile('simpleConsole.html'); break;
    case 'userManagement': window.loadFile('userManagement.html'); break;
    case 'update': window.loadFile('update.html'); break;
}
});
ipcMain.on('log', (event, arg) => {
  console.log(arg);
});
  

app.on('ready', () => {
  window = new BrowserWindow({fullscreen: true, resizable: false, webPreferences: {nodeIntegration: true, contextIsolation: false, enableRemoteModule: true}});
  window.loadFile('loading.html');
  window.maximize();
  window.removeMenu();
  setTimeout(() => window.loadFile('login.html'), 3000);
});

function ipcSend(event, ...args) {
  window?.webContents.send('updater-event', event, ...args);
}
