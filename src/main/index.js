const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');

const { join, extname } = require('path');

const data_handler = require('../../lib/data.js');

const task_history_path = join(app.getPath('userData'), 'tasks.history');

const menu = [
  {
    label: 'File',
    submenu: [{
      label: 'New Task',
      click: () => {
        console.log('Show window for task information input');
        InputWindow = new BrowserWindow({
          width: 400,
          height: 300,
          backgroundColor: '#1d1d1d',
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
        dialog.showMessageBoxSync(MainWindow, {
          type: 'info',
          message: 'Please choose where you want to save the exported task history',
          buttons: ['OK']
        });
        dialog.showSaveDialog(MainWindow, {
          title: 'Export Task History',
        }).then((result) => {
          console.log(result);
          if (result.canceled) return;
          if (extname(result.filePath) !== '.history') result.filePath += '.history';
          data_handler.create(result.filePath, data_handler.readSync(task_history_path), (err) => {
            if (err) dialog.showErrorBox('Error', `${err}\nFailed to export task history`);
          });
        });
      }
    }, {
      // Replace current tasks with the imported task history
      label: 'Import Task History',
      click: () => {
        dialog.showOpenDialog(mainWindow, {
          filters: [{
            name: 'Task History', extensions: ['history']
          }, {
            name: 'All Files', extensions: ['*']
          }],
          properties: ['openFile'],
        }).then((file_object) => {
          if (file_object.canceled) return;
          // Ask for confirmation if there are existing tasks
          const current_task_history = JSON.parse(data_handler.readSync(task_history_path));
          if (current_task_history.tasks !== []) {
            dialog.showMessageBox(MainWindow, {
              title: 'Confirmation',
              type: 'question',
              buttons: ['Cancel', 'Overwrite'],
              defaultId: 0,
              message: 'There are existing tasks. Overwrite them with imported tasks?'
            }).then((result) => {
              if (result.response === 1) {
                console.log('Import new tasks');
                MainWindow.webContents.send('remove-all-tasks');
                MainWindow.webContents.send('add-task-to-list', JSON.parse(data_handler.readSync(file_object.filePath)));
              }
            });
          }
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
        // icon: './assets/fsnowdin.png',
        message: 'Task Tracker by Falling Snowdin.\nNode.js version: ' + process.versions.node + '; ' + 'Electron version: ' + process.versions.electron + '.\nFile bugs here: https://github.com/tghgg/Tracker',
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
      enableRemoteModule: false,
    }
  );
  MainWindow.loadFile('./src/main/index.html');

  MainWindow.on('ready-to-show', () => {
    console.log('Show main window');
    MainWindow.show();
    MainWindow.webContents.openDevTools();

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
  console.log('Show window for task information input');
  InputWindow = new BrowserWindow({
    width: 400,
    height: 300,
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
  console.log('Add the task to task history and create the task');
  InputWindow.close();
  data = data.trim();
  data = data.replace(/ /g, '-');

  const current_task_history = JSON.parse(data_handler.readSync(task_history_path));
  const current_time = new Date();
  // ID starts with 'task_' since HTML does not allow ID to start with a digit
  const new_task = {
    name: data,
    id: `task_${data}_${current_time.getFullYear()}${current_time.getMonth()}${current_time.getDate()}`,
    completions: 0
  };
  current_task_history.tasks.push(new_task);

  // Create the task and approriate index in history to listeners
  // We send an object with a 'tasks' key so we can re-use the add-task-to-list when the app re-create existing tasks on start
  MainWindow.webContents.send('add-task-to-list', { tasks: [new_task] });

  data_handler.create(task_history_path, JSON.stringify(current_task_history), (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nError updating task history.`);
  });
});

// Remove task from task history
ipcMain.on('remove-task', (event, data) => {
  console.log(data);
  console.log('lmao')
  dialog.showMessageBox(MainWindow, {
    title: 'Confirmation',
    type: 'question',
    buttons: ['Cancel', 'Remove'],
    defaultId: 0,
    message: 'Remove task?'
  }).then((result) => {
    if (result.response === 1) {
      console.log('Remove a task');
      // Delete from history
      const task_history = JSON.parse(data_handler.readSync(task_history_path));

      for (let index = 0; index < task_history.tasks.length; index++) {
        if (task_history.tasks[index].id === data) {
          task_history.tasks.splice(index, 1);
          break;
        }
      }

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
  console.log('Complete a task');
  const task_history = JSON.parse(data_handler.readSync(task_history_path));

  for (let index = 0; index < task_history.tasks.length; index++) {
    if (task_history.tasks[index].id === data) {
      console.log("yolo")
      task_history.tasks[index].completions++;
      break;
    }
  }

  data_handler.create(task_history_path, JSON.stringify(task_history), (err) => {
    if (err) dialog.showErrorBox('Error', `${err}\nFailed to increment task completion count.`);
  });
});
