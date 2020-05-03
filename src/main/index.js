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
      enableRemoteModule: false,
      autoHideMenuBar: true
    }
  );
  MainWindow.loadFile('./src/main/index.html');

  MainWindow.on('ready-to-show', () => {
    MainWindow.show();
    // MainWindow.webContents.openDevTools();

    if (!data_handler.existsSync(task_history_path)) {
      console.log('Initialize task history');
      data_handler.create(task_history_path, JSON.stringify({
        tasks: []
      }), (err) => {
        if (err) dialog.showErrorBox('Error', `${err}\nError intializing tasks history JSON file.`);
      });
    } else {
      console.log('Task history exists');
      console.log(JSON.parse(data_handler.readSync(task_history_path)));
      MainWindow.webContents.send('add-task-to-list', JSON.parse(data_handler.readSync(task_history_path)));
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
  current_task_history.tasks.push({
    name: data,
    completions: 0
  });
  console.log(current_task_history.tasks);

  console.log(current_task_history.tasks.length);

  // Create the task and approriate index in history to listeners
  MainWindow.webContents.send('add-task-to-list', { tasks: [{ name: data, completions: 0 }], current_task_index: current_task_history.tasks.length - 1 });

  data_handler.create(task_history_path, JSON.stringify(current_task_history), (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nError updating task history.`);
  });
});

// Remove task from task history
ipcMain.on('remove-task', (event, data) => {
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
      task_history.tasks.splice(data, 1);
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
  task_history.tasks[data].completions++;
  data_handler.create(task_history_path, JSON.stringify(task_history), (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nFailed to increment task completion count.`);
  });
});
