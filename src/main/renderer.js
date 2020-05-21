const { ipcRenderer } = require('electron');

const TASKS = new Vue({
  el: '#list',
  data: {
    tasks: [
      'Helu',
      "helo",
      'Hele'
    ]
  }
});

// Add task button
document.querySelector('#add_button').addEventListener('submit', (event) => {
  console.log('Create new task');
  event.preventDefault();
  // ipcRenderer.send('add-task');
  TASKS.$children.push()
});

// Create a task containing details and a tracker
ipcRenderer.on('add-task-to-list', (event, data) => {
  console.log('Add task(s) to current task list');
  for (let i = 0; i < data.tasks.length; i++) {
    const task = document.createElement('div');
    task.className = 'task';
    task.id = data.tasks[i].id;
    const button = document.createElement('button');
    button.innerHTML = data.tasks[i].name.replace(/-/g, ' ');
    button.className = 'task-button';

    // Increment tracker on left click; ask to remove task on right click; play sound effect
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const task_tracker = event.currentTarget.parentElement.children[1];
      task_tracker.innerHTML++;
      task_tracker.classList.add('pop');
      task_tracker.addEventListener('webkitAnimationEnd', (event) => {
        task_tracker.classList.remove('pop');
      });
      document.querySelector('audio').play();
      ipcRenderer.send('complete-task', task.id);
    });
    button.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      ipcRenderer.send('remove-task', task.id);
    });

    const tracker = document.createElement('h3');
    tracker.className = 'task-tracker';
    tracker.textContent = data.tasks[i].completions;

    task.appendChild(button);
    task.appendChild(tracker);
    document.querySelector('.main').appendChild(task);
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
