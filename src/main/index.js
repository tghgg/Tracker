const { app, BrowserWindow, ipcMain } = require('electron');

let MainWindow, InputWindow;

app.on('ready', () => {
  MainWindow = new BrowserWindow(
    {
      width: 800,
      height: 600,
      backgroundColor: '#1d1d1d',
      show: true,
      webPreferences: { nodeIntegration: true },
      enableRemoteModule: false
    }
  );
  MainWindow.loadFile('./src/main/index.html');
});

// Create input window to get new task info
ipcMain.on('add-task', (event, data) => {
  console.log('Add new task');
  InputWindow = new BrowserWindow({
    width: 300,
    height: 200,
    backgroundColor: '#1d1d1d',
    show: true,
    webPreferences: { nodeIntegration: true },
    enableRemoteModule: false,
    parent: MainWindow,
    autoHideMenuBar: true,
    modal: true
  });
  InputWindow.loadFile('./src/subwindows/input_window.html');
});

// Actually create the task
ipcMain.on('create-task', (event, data) => {
  InputWindow.close();
  MainWindow.webContents.send('add-task-to-list', data);
});
