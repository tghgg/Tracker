const { ipcRenderer } = require('electron');

let input = new Vue({
  el: 'form',
  methods: {
    createTask: (event) => {
      event.preventDefault();
      console.log(event);
      ipcRenderer.send('create-task', document.querySelector('input').value);
    }
  }
});

// document.querySelector('form').addEventListener('submit', (event) => {
//   event.preventDefault();
//   ipcRenderer.send('create-task', document.querySelector('input').value);
// });
