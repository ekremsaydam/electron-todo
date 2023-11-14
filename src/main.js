const { app, BrowserWindow, MenuItem, Menu, ipcMain } = require("electron");
const path = require("node:path");

const isMac = process.platform === "darwin";

const isDev = process.env.NODE_ENV === "development";
// const isDev = true;
const todoList = [];

let mainWindow;
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
    if (!isMac) app.quit();
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

const handlerIpcMain = () => {
  ipcMain.handle("main:close", (_event) => {
    mainWindow.close();
  });

  ipcMain.handle("main:close-cancel", () => {
    mainWindow.blur();
    mainWindow.focus();
  });

  ipcMain.handle("todo:cancel-close", () => {
    newTodoWindow.close();
  });

  ipcMain.handle("todo:create", (_event, todoValue) => {
    todoList.push(todoValue.text);
    mainWindow.webContents.send("todo:created", {
      id: todoList.length,
      text: todoValue.text,
      addedOnDate: new Date().toLocaleString(),
    });

    if (todoValue.ref === "todo") {
      newTodoWindow.close();
      newTodoWindow = null;
    }
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
