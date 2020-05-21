// Template task Vue component

// const TASK = Vue.component('task', {
//     props: ['taskId', 'taskName', 'taskCompletions'],
//     template: '<div class="task" id={{ taskId }}><button class="task-button">{{ taskName }}</button><h3 class="task-tracker">{{ taskCompletions }}</h3></div>'
// });

// Props are for the initial values only
// If you want to change it, copy the props value to a data object, and mutate the data object's keys
Vue.component('task', {
    props: ['name', 'id', 'completions'],
    data: function() {
        return {taskName: this.name, taskId: this.id, taskCompletions: this.completions};
    },
    template: '<div class="task" :id="taskId"><button class="task-button" v-on:click="completeTask($event)">{{ taskName }}</button><h3 class="task-tracker">{{ taskCompletions }}</h3></div>',
    methods: {
        completeTask: function(event) {
            this.taskCompletions++;
            ipcRenderer.send('complete-task', this.id);
            console.log('helu');
            console.log(this.taskName);
        }
    }
});
