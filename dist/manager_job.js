module.exports = function(room) {
    var Queue = require('helper_queue');

    function create(name, role, priority, params) {
        var queue = new Queue('jobs_' + role, {
            priority: true,
            room: room,
            dontAutoRun: true
        });
        params.room = room.name;
        queue.push(name, priority, params);
    }

    function exists(name, role, params) {
        var queue = new Queue('jobs_' + role, {
            priority: true,
            room: room,
            dontAutoRun: true
        });
        if (!params) params = {};
        params.room = room.name;

        return (_.find(queue.items(), {action: name, params: params}));
    }

    function assign(creep) {
        var queue = new Queue('jobs_' + creep.memory.role, {
            priority: true,
            room: room,
            dontAutoRun: true
        });
        var job = queue.items()[0];
        if (job) {
            creep.memory.activeJob = {
                name: job.action,
                params: job.params
            };
            queue.remove(job.id);
        }
    }

    return {
        assign: assign,
        create: create,
        exists: exists
    };
};