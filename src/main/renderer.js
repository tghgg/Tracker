const { ipcRenderer } = require('electron');

class Task {
  constructor (id, name, completions) {
    this.id = id;
    this.name = name;
    this.completions = completions;
  }
}

const TASKS_LIST = new Vue({
  el: '.main',
  data: {
    tasks: []
  }
});

// Add task button
document.querySelector('#add_button').addEventListener('submit', (event) => {
  console.log('Create new task');
  event.preventDefault();
  ipcRenderer.send('add-task');
});

// Create a task containing details and a tracker
ipcRenderer.on('add-task-to-list', (event, data) => {
  console.log('Add task(s) to current task list');
  for (let i = 0; i < data.tasks.length; i++) {
    const newTask = new Task(data.tasks[i].id, data.tasks[i].name.replace(/-/g, ' '), data.tasks[i].completions);
    TASKS_LIST.tasks.push(newTask);
  }
});

ipcRenderer.on('remove-task-from-list', (event, data) => {
  console.log('Remove task');
  document.querySelector(`#${data}`).remove();
});

ipcRenderer.on('remove-all-tasks', (event, data) => {
  console.log('Remove all tasks');
  const current_tasks = document.querySelectorAll('.task');
  for (let i = 0; i < current_tasks.length; i++) {
    current_tasks[i].remove();
  }
});
