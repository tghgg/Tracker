// Template task Vue component

// Props are for the initial values only
// If you want to change it, copy the props value to a data object, and mutate the data object's keys
Vue.component('task', {
    props: ['name', 'id', 'completions'],
    // Only mutable keys in the data object
    data: function() {
        return {taskName: this.name, taskCompletions: this.completions};
    },
    template: '<div class="task" :id="id"><button class="task-button" v-on:contextmenu="removeTask($event)" v-on:click="completeTask">{{ taskName }}</button><h3 class="task-tracker">{{ taskCompletions }}</h3></div>',
    methods: {
        completeTask: function() {
            this.taskCompletions++;
            ipcRenderer.send('complete-task', this.id);
            document.getElementsByTagName('audio').play();
        },
        removeTask: function(event) {
            event.preventDefault();
            console.log(this.id);
            ipcRenderer.send('remove-task', this.id);
        }
    }
});
