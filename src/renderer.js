const { ipcRenderer } = require('electron');

document.querySelector('#add_button').addEventListener('submit', (event) => {
    console.log('New task');
    ipcRenderer.send('add-task');
});