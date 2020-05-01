const { ipcRenderer } = require('electron');

document.querySelector('#add_button').addEventListener('submit', (event) => {
  event.preventDefault();
  console.log('New task');
  ipcRenderer.send('add-task');
});

document.querySelector('.task').addEventListener('click', (event) => {
  event.preventDefault();
  event.currentTarget.remove();
});

ipcRenderer.on('add-task-to-list', (event, data) => {
  console.log('Add task to list, ok nibba');
  const new_item = document.createElement('button');
  new_item.innerHTML = data;
  new_item.className = 'task';
  new_item.addEventListener('click', (event) => {
    event.preventDefault();
    event.currentTarget.remove();
  });
  document.querySelector('ul').appendChild(new_item);
});

