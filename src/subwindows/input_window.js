const { ipcRenderer } = require('electron');

document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  ipcRenderer.send('create-task', document.querySelector('input').value);
});
