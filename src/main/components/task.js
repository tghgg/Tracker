// Template task Vue component

// const TASK = Vue.component('task', {
//     props: ['taskId', 'taskName', 'taskCompletions'],
//     template: '<div class="task" id={{ taskId }}><button class="task-button">{{ taskName }}</button><h3 class="task-tracker">{{ taskCompletions }}</h3></div>'
// });

Vue.component('task', {
    props: ['name', 'id'],
    template: '<button :id="id">{{ name }}</button>'
});
