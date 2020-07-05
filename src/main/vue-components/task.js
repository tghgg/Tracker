/* Task */

'use strict';

// Props are for the initial values only
// If you want to change it, copy the props value to a data object, and mutate the data object's keys
Vue.component('task', {
  props: ['name', 'id', 'completed'],
  // Only mutable keys in the data object
  data: function () {
    return { taskName: this.name, taskCompleted: this.completed };
  },
  template: '<div class="task" :id="id" v-on:contextmenu="removeTask($event)"><button class="task-button" v-on:click="editTask">{{ taskName }}</button><div class="task-tracker" v-on:click="completeTask"><button v-if="taskCompleted">Done</button><button v-else>X</button></div></div>',
  methods: {
    completeTask: function () {
      this.taskCompleted = true;
      ipcRenderer.send('complete-task', this.id);

      // Hightlight the task before removing it from view
      document.querySelector(`#${this.id} > button`).disabled = true;
      document.querySelector(`#${this.id} > .task-tracker`).style['background-color'] = 'rgb(55, 207, 93)';
      document.querySelector(`#${this.id} > .task-tracker`).style['border-color'] = 'rgb(55, 207, 93)';
      document.querySelector(`#${this.id} > .task-button`).style['background-color'] = 'rgb(55, 207, 93)';
      document.querySelector(`#${this.id} > .task-button`).style['border-color'] = 'rgb(55, 207, 93)';

      setTimeout(() => document.getElementById(this.id).remove(), 250);
    },
    editTask: function () {
      ipcRenderer.invoke('edit-task-name', { name: this.taskName, id: this.id }).then((newName) => {
        if (newName) {
          this.taskName = newName;
        }
      });
    },
    removeTask: function (event) {
      event.preventDefault();
      ipcRenderer.send('remove-task', { id: this.id, name: this.name });
    }
  }
});
