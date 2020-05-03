const { ipcRenderer } = require('electron');

function createTask(data) {
  for (let i = 0; i < data.length; i++) {
    const new_item = document.createElement('button');
    new_item.innerHTML = data[i];
    new_item.className = 'task';
    new_item.addEventListener('click', (event) => {
      event.preventDefault();
      event.currentTarget.remove();
      ipcRenderer.send('remove-task', event.currentTarget.innerHTML);
    });
    document.querySelector('.main').appendChild(new_item);
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