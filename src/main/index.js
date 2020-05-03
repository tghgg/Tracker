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
      show: false,
      webPreferences: { nodeIntegration: true },
      enableRemoteModule: false
    }
  );
  MainWindow.loadFile('./src/main/index.html');


  MainWindow.on('ready-to-show', () => {
    MainWindow.show();
    // MainWindow.webContents.openDevTools();

    if (!data_handler.existsSync(task_history_path)) {
      console.log('Initialize task history');
      data_handler.create(task_history_path, JSON.stringify({
        tasks: [],
      }), (err) => {
        if (err) dialog.showErrorBox('Error', `${err}\nError intializing tasks history JSON file.`);
      });
    } else {
      console.log('Task history exists');
      const task_history = JSON.parse(data_handler.readSync(task_history_path))['tasks'];
      console.log(task_history);
      MainWindow.webContents.send('add-task-to-list', task_history);
    }
  });
  
});

// Create input window to get new task info
ipcMain.on('add-task', (event, data) => {
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

// Actually create the task, and add the task to task history
ipcMain.on('create-task', (event, data) => {
  InputWindow.close();

  const current_task_history = JSON.parse(data_handler.readSync(task_history_path));
  const id = 
  current_task_history['tasks'].push({
    name: data,
    id: current_task_history['tasks'].length,
    completions: 0
  });

  MainWindow.webContents.send('add-task-to-list', [{name:data,id:current_task_history['tasks'].length,completions:0}]);

  data_handler.create(task_history_path, JSON.stringify(current_task_history), (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nError updating task history.`);
  });
});

// Remove task from task history
ipcMain.on('remove-task', (event, data) => {
  console.log(data);
  dialog.showMessageBox(MainWindow, {
    title: 'Confirmation',
    type: 'question',
    buttons: ['Cancel', 'Remove'],
    defaultId: 0,
    message: 'Remove task?'
  }).then((result) => {
    if (result.response === 1) {
      // Delete from history
      const task_history = JSON.parse(data_handler.readSync(task_history_path));
      task_history['tasks'].splice(task_history['tasks'].indexOf(data), 1);
      data_handler.create(task_history_path, JSON.stringify(task_history), (err) => {
        if (err) dialog.showErrorBox('Error', `${err}\nFailed to remove task from task history.`);
      });
      // Remove from renderer
      MainWindow.webContents.send('remove-task-from-list', data);
    }
  }, (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nError removing task.`);
  });
});

// Increment a task's completions count
ipcMain.on('complete-task', (event, data) => {
  const task_history = JSON.parse(data_handler.readSync(task_history_path));
  task_history['tasks'][task_history['tasks'].indexOf(data)]['completions']++;
  data_handler.create(task_history_path, JSON.stringify(task_history), (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nFailed to increment task completion count.`);
  });
});