'use strict';
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');

const { join, extname } = require('path');

const DataHandler = require('../../lib/data.js');

const TaskHistoryPath = join(app.getPath('userData'), 'tudu-tasks-history.json');

const menu = [
  {
    label: 'File',
    submenu: [{
      label: 'New Task',
      click: () => {
        console.log('Show task creation window');
        InputWindow = new BrowserWindow({
          width: 300,
          height: 80,
          resizable: false,
          center: true,
          useContentSize: true,
          frame: false,
          backgroundColor: '#0f0f0f',
          show: true,
          webPreferences: { nodeIntegration: true },
          enableRemoteModule: false,
          parent: MainWindow,
          autoHideMenuBar: true,
          modal: true
        });
        InputWindow.loadFile('./src/subwindows/input_window.html');
      }
    }, {
      type: 'separator'
    }, {
      label: 'Export Task History',
      click: () => {
        console.log('Export task history');
        if (Object.keys(JSON.parse(DataHandler.readSync(TaskHistoryPath))).length === 0) {
          dialog.showErrorBox('No Tasks', "There's nothing to export.");
          return;
        }
        dialog.showMessageBoxSync(MainWindow, {
          type: 'info',
          message: 'Please choose where you want to save the exported task history',
          buttons: ['OK']
        });
        dialog.showSaveDialog(MainWindow, {
          title: 'Export Task History'
        }).then((result) => {
          if (result.canceled) return;
          if (extname(result.filePath) !== '.history') result.filePath += '.history';
          DataHandler.create(result.filePath, DataHandler.readSync(TaskHistoryPath), (err) => {
            if (err) dialog.showErrorBox('Error', `${err}\nFailed to export task history`);
          });
        });
      }
    }, {
      // Replace current tasks with the imported task history
      label: 'Import Task History',
      click: () => {
        if (Object.keys(JSON.parse(DataHandler.readSync(TaskHistoryPath))).length !== 0) {
          console.log('Ask for overwrite confirmation');
          const result = dialog.showMessageBoxSync(MainWindow, {
            title: 'Confirmation',
            type: 'question',
            buttons: ['Cancel', 'Overwrite'],
            defaultId: 0,
            message: 'There are existing tasks. Overwrite them with imported tasks?'
          });
          if (result !== 1) return;
        }
        console.log('Import task history');
        dialog.showOpenDialog(MainWindow, {
          filters: [{
            name: 'Task History', extensions: ['history']
          }, {
            name: 'All Files', extensions: ['*']
          }],
          properties: ['openFile']
        }).then((fileObject) => {
          if (fileObject.canceled) return;

          MainWindow.webContents.send('remove-all-tasks');

          const newTaskHistory = JSON.parse(DataHandler.readSync(fileObject.filePaths[0]));
          MainWindow.webContents.send('add-task-to-list', newTaskHistory);
          DataHandler.create(TaskHistoryPath, JSON.stringify(newTaskHistory), (err) => {
            if (err) dialog.showErrorBox('Error', `${err}\nError importing new task history.`);
          });
        });
      }
    }]
  },
  {
    label: 'About',
    click: (menuItem, window, event) => {
      dialog.showMessageBox(MainWindow, {
        title: 'About',
        type: 'info',
        icon: './assets/fsnowdin.png',
        message: 'TuDu by Falling Snowdin.\nNode.js version: ' + process.versions.node + '; ' + 'Electron version: ' + process.versions.electron + '.\nFile bugs here: https://github.com/tghgg/Tracker',
        buttons: ['Close']
      });
    }
  },
  {
    label: 'Quit',
    role: 'quit'
  }
];

let MainWindow, InputWindow;

// Initialize app
app.on('ready', () => {
  console.log('Initialize app');
  app.allowRendererProcessReuse = true;

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

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
    console.log('Show main window');
    MainWindow.show();
    // MainWindow.webContents.openDevTools();

    if (!DataHandler.existsSync(TaskHistoryPath)) {
      console.log('Initialize task history');
      DataHandler.create(TaskHistoryPath, JSON.stringify({}), (err) => {
        if (err) dialog.showErrorBox('Error', `${err}\nError intializing tasks history JSON file.`);
      });
    } else {
      console.log('Task history exists');
      MainWindow.webContents.send('add-task-to-list', JSON.parse(DataHandler.readSync(TaskHistoryPath)));
    }
  });

  // Resize the webpage automatically to ensure the task lists look correct
  MainWindow.on('resize', () => {
    MainWindow.webContents.send('resize', MainWindow.getContentSize());
  });
});

// Create input window to get new task info
ipcMain.on('add-task', (event, data) => {
  console.log('Show window for task information input');
  InputWindow = new BrowserWindow({
    width: 300,
    height: 80,
    resizable: false,
    center: true,
    useContentSize: true,
    frame: false,
    backgroundColor: '#0f0f0f',
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
  console.log('Add the task to task history and create the task');
  InputWindow.close();
  data = data.trim();
  data = data.replace(/ /g, '-');

  const currentTaskHistory = JSON.parse(DataHandler.readSync(TaskHistoryPath));
  const currentTime = new Date();
  const id = `task_${data}_${currentTime.getFullYear()}${currentTime.getMonth()}${currentTime.getDate()}`;
  // ID starts with 'task_' since HTML does not allow ID to start with a digit
  const newTask = {
    name: data,
    id: id,
    completed: false
  };
  currentTaskHistory[id] = newTask;

  // Send the task(s) and their info to the renderer
  const tempTask = {};
  tempTask[id] = newTask;
  MainWindow.webContents.send('add-task-to-list', tempTask);

  DataHandler.create(TaskHistoryPath, JSON.stringify(currentTaskHistory), (err) => {
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
    message: `Remove ${data.name}?`
  }).then((result) => {
    if (result.response === 1) {
      console.log('Remove task');
      // Delete from history
      const taskHistory = JSON.parse(DataHandler.readSync(TaskHistoryPath));
      delete taskHistory[data.id];
      DataHandler.create(TaskHistoryPath, JSON.stringify(taskHistory), (err) => {
        if (err) dialog.showErrorBox('Error', `${err}\nFailed to remove task from task history.`);
      });
      // Remove from the renderer
      MainWindow.webContents.send('remove-task-from-list', data.id);
    }
  }, (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nError removing task.`);
  });
});

// Complete a task and remove it from history
ipcMain.on('complete-task', (event, data) => {
  console.log('Complete task');
  const taskHistory = JSON.parse(DataHandler.readSync(TaskHistoryPath));
  delete taskHistory[data];
  DataHandler.create(TaskHistoryPath, JSON.stringify(taskHistory), (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nFailed to increment task completion count.`);
  });
});
