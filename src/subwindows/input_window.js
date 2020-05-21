const { ipcRenderer } = require('electron');

window.onblur = () => {
  window.close();
};

document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  ipcRenderer.send('create-task', document.querySelector('input').value);
});
