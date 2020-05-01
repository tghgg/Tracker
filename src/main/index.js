const { app, BrowserWindow, ipcMain, dialog } = require('electron');

const { join } = require('path');

const data_handler = require('../../lib/data.js');

const task_history_path = join(app.getPath('userData'), 'tasks.json');

let MainWindow, InputWindow;

// Initialize app
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

  if (!data_handler.existsSync(task_history_path)) {
    data_handler.create(task_history_path, JSON.stringify({
      tasks: []
    }), (err) => {
      if (err) dialog.showErrorBox('Error', `${err}\nError intializing tasks history JSON file.`);
    });
  }
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

// Actually create the task; save the task locally in a JSON file
ipcMain.on('create-task', (event, data) => {
  InputWindow.close();
  MainWindow.webContents.send('add-task-to-list', data);
  const current_task_history = JSON.parse(data_handler.readSync(task_history_path));
  console.log(typeof(current_task_history));
  current_task_history['tasks'].push(data);
  console.log(current_task_history);
  data_handler.create(task_history_path, JSON.stringify(current_task_history), (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nError updating task history.`);
  });
});
