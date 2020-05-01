const { ipcRenderer } = require('electron');

// Add task button
document.querySelector('#add_button').addEventListener('submit', (event) => {
  event.preventDefault();
  ipcRenderer.send('add-task');
});

ipcRenderer.on('add-task-to-list', (event, data) => {
  const new_item = document.createElement('button');
  new_item.innerHTML = data;
  new_item.className = 'task';
  new_item.addEventListener('click', (event) => {
    event.preventDefault();
    event.currentTarget.remove();
  });
  document.querySelector('ul').appendChild(new_item);
});

ipcRenderer.on('existing-tasks', (event, data) => {
  console.log('hmmm');
  console.log(data);
  // Create a task and attach a click listener to delete it
  for (let i = 0; i < data.length; i++) {
    const new_item = document.createElement('button');
    new_item.innerHTML = data[i];
    new_item.className = 'task';
    new_item.addEventListener('click', (event2) => {
      event2.preventDefault();
      event2.currentTarget.remove();
      console.log(event2.currentTarget.innerHTML);
      ipcRenderer.send('remove-task', event2.currentTarget.innerHTML);
    });
    document.querySelector('ul').appendChild(new_item);
  }
});