const { ipcRenderer } = require('electron');

document.querySelector('#add_button').addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('New task');
    ipcRenderer.send('add-task');
});

ipcRenderer.on('add-task-to-list', (event, data) => {
    console.log('Add task to list, ok nibba');
    const new_item = document.createElement('p');
    new_item.textContent = data;
    document.querySelector('ul').appendChild(new_item);
});