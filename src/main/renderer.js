const { ipcRenderer } = require('electron');

document.querySelector('#add_button').addEventListener('submit', (event) => {
    console.log('New task');
    ipcRenderer.send('add-task');
});

ipcRenderer.on('add-task-to-list', (event, data) => {
    console.log('Add task to list, ok nibba');
    let new_item = document.createElement('p');
    new_item.textContent = data;
    document.querySelector('.main').appendChild(new_item);
});