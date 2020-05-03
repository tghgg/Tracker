const { ipcRenderer } = require('electron');

// Create a task containing details and a tracker
function createTask (data) {
  console.log(data);
  console.log('data');

  for (let i = 0; i < data.tasks.length; i++) {
    const task = document.createElement('div');
    task.className = 'task';

    const button = document.createElement('button');
    button.innerHTML = data.tasks[i].name;
    button.className = 'task-button';

    // Increment tracker on left click; ask to remove task on right click
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const task_tracker = event.currentTarget.parentElement.children[1];
      task_tracker.innerHTML++;
      task_tracker.classList.add('pop');
      task_tracker.addEventListener('webkitAnimationEnd', (event) => {
        task_tracker.classList.remove('pop');
      });
      if ('current_task_index' in data) ipcRenderer.send('complete-task', data.current_task_index);
      else ipcRenderer.send('complete-task', i);
    });
    button.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      if ('current_task_index' in data) ipcRenderer.send('remove-task', data.current_task_index);
      else ipcRenderer.send('remove-task', i);
    });

    const tracker = document.createElement('h3');
    tracker.className = 'task-tracker';
    tracker.textContent = data.tasks[i].completions;

    task.appendChild(button);
    task.appendChild(tracker);
    document.querySelector('.main').appendChild(task);
  }
}

// Add task button
document.querySelector('#add_button').addEventListener('submit', (event) => {
  event.preventDefault();
  ipcRenderer.send('add-task');
});

ipcRenderer.on('add-task-to-list', (event, data) => {
  createTask(data);
});

ipcRenderer.on('remove-task-from-list', (event, data) => {
  const tasks = document.querySelectorAll('.task');
  if (tasks.length === 0) tasks[0].remove();
  else tasks[data].remove();
});
