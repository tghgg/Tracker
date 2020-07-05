'use strict';

const { ipcRenderer } = require('electron');

window.onblur = () => {
  window.close();
};

document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  ipcRenderer.send('create-task', document.querySelector('input').value);

  // Reset the input field and focus the input field again
  document.getElementById('task-name').value = '';
  document.getElementById('task-name').focus();
});

document.querySelector('.main > button').addEventListener('click', (event) => {
  event.preventDefault();
  window.close();
});
