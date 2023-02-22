const { app, BrowserWindow, ipcMain, screen} = require("electron");
const path = require("path");
const fs = require("fs-extra");
const { platform } = require("os");
const shell = require('shelljs')
let sqlite3 = require("sqlite3").verbose();

let currentUser = null;
let window;

const Devmode = true;

ipcMain.on("loginUser", (event, arg) => {
  currentUser = arg;
});
ipcMain.on("logoutUser", (event, arg) => {
  currentUser = null;
});
ipcMain.on("getCurrentUser", (event, arg) => {
  event.returnValue = currentUser;
});

ipcMain.on("goto", (event, arg) => {
  switch (arg) {
    case "menu":
      window.loadFile("menu.html");
      break;
    case "createShow":
      window.loadFile("createShow.html");
      break;
    case "editShow":
      window.loadFile("editShow.html");
      break;
    case "manageShows":
      window.loadFile("manageShows.html");
      break;
    case "simpleConsole":
      window.loadFile("simpleConsole.html");
      break;
    case "userManagement":
      window.loadFile("userManagement.html");
      break;
    case "update":
      window.loadFile("update.html");
      break;
      case "openQLC":
        shell.exec("bash ./startQLC.sh");
        break;
  }
});
ipcMain.on("log", (event, arg) => {
  console.log(arg);
});

app.on("ready", () => {
  fs.ensureFile(__dirname + "/data/database.db")
    .then(() => {
      const db = new sqlite3.Database(__dirname + "/data/database.db");
      db.run(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, permission INTEGER);"
      );
      db.run(
        "INSERT INTO users (username, password, permission) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = ?)",
        ["root", "Password", 10, "root"]
      );
      db.close();
    })
    .catch((err) => {
      console.error(err);
    });
  window = new BrowserWindow({
    autoHideMenuBar: true,
    width: screen.getPrimaryDisplay().size.width,
    height: screen.getPrimaryDisplay().size.height,
    fullscreen: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  window.loadFile("loading.html");
  window.maximize();
  if (Devmode == false) {
    window.removeMenu();
  }
  //set the icon acording to the platform the app is running on
  if (platform() == "win32") {
    window.setIcon(__dirname + "/logo.ico");
  } else if (platform() == "linux") {
    window.setIcon(__dirname + "/logo.png");
  }

  window.setTitle("DMX Console - Initializing...");

  setTimeout(() => window.loadFile("login.html"), 3000);
});

function ipcSend(event, ...args) {
  window?.webContents.send("updater-event", event, ...args);
}
