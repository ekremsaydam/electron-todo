const { app, BrowserWindow, MenuItem, Menu, ipcMain } = require("electron");
const path = require("node:path");

const db = require("../lib/connectionSqlite3");

const isMac = process.platform === "darwin";

const isDev = process.env.NODE_ENV === "development";
// const isDev = true;

let mainWindow = new BrowserWindow();
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    focusable: true,
    frame: isDev,
    webPreferences: {
      preload: path.join(app.getAppPath(), "/src/mainWindowPreload.js"),
    },
  });

  mainWindow.loadFile(path.join(app.getAppPath(), "/pages/mainWindow.html"));

  mainWindow.on("closed", () => {
    if (!isMac) {
      app.quit();
      db.close();
    }
  });

  mainWindow.webContents.once("dom-ready", () => {
    db.all("SELECT * FROM todo", function (err, rows) {
      mainWindow.webContents.send("todo:list", rows);
    });
  });
};

let newTodoWindow;
const createNewTodoWindow = () => {
  newTodoWindow = new BrowserWindow({
    width: 480,
    height: 215,
    frame: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), "/src/newTodoWindowPreload.js"),
    },
  });

  newTodoWindow.loadFile(path.join(app.getAppPath(), "/pages/newTodoWindow.html"));
};

const createMainMenu = () => {
  const mainMenuTemplate = [
    new MenuItem({
      label: "File",
      submenu: [
        new MenuItem({
          label: "New Todo",
          accelerator: isMac ? "Command+N" : "Ctrl+N",
          click() {
            createNewTodoWindow();
          },
        }),
        new MenuItem({
          type: "separator",
        }),
        new MenuItem({
          role: "quit",
        }),
      ],
    }),
  ];

  if (isDev) {
    mainMenuTemplate.push(
      new MenuItem({
        label: "Dev Tools",
        submenu: [
          new MenuItem({
            role: "toggleDevTools",
          }),
          new MenuItem({
            role: "reload",
          }),
        ],
      })
    );
  }

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
};

const mainWindowFocus = () => {
  mainWindow.blur();
  mainWindow.focus();
};
const handlerIpcMain = () => {
  ipcMain.handle("main:close", (_event) => {
    mainWindow.close();
  });

  ipcMain.handle("main:close-cancel", () => {
    mainWindowFocus();
  });

  ipcMain.handle("todo:cancel-close", () => {
    newTodoWindow.close();
  });

  ipcMain.handle("todo:create", (_event, todoValue) => {
    db.run("INSERT INTO todo (text) VALUES (?)", [todoValue.text], function (error, val) {
      if (error) {
        console.log(err.message);
        return;
      }

      if (this.changes === 1) {
        db.all("SELECT * FROM todo WHERE id=?", [this.lastID], function (error, rows) {
          if (error) {
            return console.log(error.message);
          }

          mainWindow.webContents.send("todo:created", rows[0]);
        });
      }
    });

    if (todoValue.ref === "todo") {
      newTodoWindow.close();
      newTodoWindow = null;
    }
  });

  ipcMain.handle("todo:delete", (_event, deleteTodoId) => {
    db.run("DELETE FROM todo Where id=?", deleteTodoId, function (error) {
      if (error) {
        console.log(error.message);
        return;
      }

      mainWindowFocus();
    });
  });
};

app.whenReady().then(() => {
  handlerIpcMain();
  createMainMenu();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});
