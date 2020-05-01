const { app, BrowserWindow, ipcMain } = require('electron');

let MainWindow;

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
    MainWindow.loadFile('./src/index.html');
});

// Create input window to get new task info
ipcMain.on('add-task', (event, data) => {
    console.log('Add new task');
    let InputWindow = new BrowserWindow({
        width: 400,
        hegiht: 300,
        backgroundColor: '#000',
        show: true,
        webPreferences: { nodeIntegration: true },
        enableRemoteModule: false,
        parent: MainWindow
    });
    InputWindow.loadFile('./src/renderer/input_window.html');
});

ipcMain.on('create-task', (event, data) => {
  console.log(data);
});