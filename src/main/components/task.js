// Template task Vue component

// Props are for the initial values only
// If you want to change it, copy the props value to a data object, and mutate the data object's keys
Vue.component('task', {
  props: ['name', 'id', 'completed'],
  // Only mutable keys in the data object
  data: function () {
    return { taskCompleted: this.completed };
  },
  template: '<div class="task" :id="id"><button class="task-button" v-on:contextmenu="removeTask($event)" v-on:click="completeTask">{{ name }}</button><h3 class="task-tracker" v-if="taskCompleted">Done</h3><h3 class="task-tracker" v-else>X</h3></div>',
  methods: {
    completeTask: function () {
      this.taskCompleted = true;
      ipcRenderer.send('complete-task', this.id);
      // document.getElementsByTagName('audio').play();
      setTimeout(() => document.getElementById(this.id).remove(), 500 );
      
    },
    removeTask: function (event) {
      event.preventDefault();
      console.log(this.id);
      ipcRenderer.send('remove-task', this.id);
    }
  }
});
