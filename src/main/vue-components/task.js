/* Task */

'use strict';

// Props are for the initial values only
// If you want to change it, copy the props value to a data object, and mutate the data object's keys
Vue.component('task', {
  props: ['name', 'id', 'completed'],
  // Only mutable keys in the data object
  data: function () {
    return { taskCompleted: this.completed };
  },
  template: '<div class="task" :id="id" v-on:contextmenu="removeTask($event)"><button class="task-button"v-on:click="completeTask">{{ name }}</button><div class="task-tracker"><h3 v-if="taskCompleted">Done</h3><h3 v-else>X</h3></div></div>',
  methods: {
    completeTask: function () {
      this.taskCompleted = true;
      ipcRenderer.send('complete-task', this.id);
      document.querySelector(`#${this.id} > button`).disabled = true;
      document.querySelector(`#${this.id} > .task-tracker`).style['background-color'] = 'rgb(55, 207, 93)';
      document.querySelector(`#${this.id} > .task-tracker`).style['border-color'] = 'rgb(55, 207, 93)';
      setTimeout(() => document.getElementById(this.id).remove(), 500);
    },
    removeTask: function (event) {
      event.preventDefault();
      ipcRenderer.send('remove-task', { id: this.id, name: this.name });
    }
  }
});
