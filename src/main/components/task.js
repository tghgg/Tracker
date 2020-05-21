// Template task Vue component

// const TASK = Vue.component('task', {
//     props: ['taskId', 'taskName', 'taskCompletions'],
//     template: '<div class="task" id={{ taskId }}><button class="task-button">{{ taskName }}</button><h3 class="task-tracker">{{ taskCompletions }}</h3></div>'
// });

Vue.component('task', {
    props: ['name', 'id', 'completions'],
    template: '<div class="task" :id="id"><button class="task-button" >{{ name }}</button><h3 class="task-tracker">{{ completions }}</h3></div>',
});
