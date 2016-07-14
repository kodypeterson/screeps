module.exports = function(room) {
    if (!room.memory.jobs) {
        room.memory.jobs = {
            list: {},
            creepJobMap: {},
            priorityQueue: []
        }
    }
    var Jobs = room.memory.jobs;

    function cleanup() {
        var Cache = require('../helper/cache');
        var structures = _.values(Cache.get(room, 'structures') || {});
        for (var i in Jobs.creepJobMap) {
            if (!Game.creeps[i] && !structures[i]) {
                if (Jobs.list[Jobs.creepJobMap[i]]) {
                    Jobs.list[Jobs.creepJobMap[i]].creeps = _.pull(Jobs.list[Jobs.creepJobMap[i]].creeps, i);
                }
                delete Jobs.creepJobMap[i];
            }
        }
    }

    function create(name, role, priority, params) {
        if (!params.neededCreeps) {
            params.neededCreeps = 1;
        }
        var job = {
            id: Math.floor((1 + Math.random()) * 0x10000).toString(8),
            name: name,
            params: params,
            role: role,
            priority: priority
        };

        if (!Jobs.priorityQueue[priority]) {
            Jobs.priorityQueue[priority] = [];
        }
        Jobs.priorityQueue[priority].push(job);
        Jobs.list[job.id] = job;
    }

    function exists(name, role, params) {
        return (_.find(Jobs.list, {name: name, params: params, role: role}));
    }

    function getJob(creep) {
        var id = creep.name || creep.id;
        if (Jobs.creepJobMap[id] && Jobs.list[Jobs.creepJobMap[id]]) {
            var job = Jobs.list[Jobs.creepJobMap[id]];
            if (job.isIdleJob) {
                var jobId = _getJob(creep);
                if (!Jobs.list[jobId].isIdleJob) {
                    return _assign(creep, jobId);
                }
            }
            return job.id;
        }

        return assign(creep);
    }

    function _getJob(creep) {
        var priorityJobs = _.filter(_.compact(_.flattenDeep(Jobs.priorityQueue)), {role: creep.memory.role});
        var selectedJob;
        if (priorityJobs && priorityJobs[0]) {
            _.forEach(priorityJobs, function(value) {
                var id = creep.name || creep.id;
                if (!Jobs.list[value.id].creeps || Jobs.list[value.id].creeps.length !== value.params.neededCreeps) {
                    selectedJob = value.id;

                    return false;
                }
            });
        }

        return selectedJob;
    }

    function _assign(creep, jobId) {
        var id = creep.name || creep.id;
        Jobs.list[jobId].creeps = Jobs.list[jobId].creeps || [];
        Jobs.list[jobId].creeps.push(id);
        Jobs.creepJobMap[id] = jobId;

        return jobId
    }

    function assign(creep) {
        var priorityJobs = _.filter(_.compact(_.flattenDeep(Jobs.priorityQueue)), {role: creep.memory.role});
        var selectedJob;
        if (priorityJobs && priorityJobs[0]) {
            _.forEach(priorityJobs, function(value) {
                var id = creep.name || creep.id;
                if (!Jobs.list[value.id].creeps || Jobs.list[value.id].creeps.length !== value.params.neededCreeps) {
                    _assign(creep, value.id);
                    selectedJob = value.id;

                    return false;
                }
            });
        }

        return selectedJob;
    }

    function complete(job, creep) {
        delete Jobs.creepJobMap[creep.id];
        delete Jobs.list[job.id];

        for(var i = Jobs.priorityQueue.length -1; i >= 0 ; i--){
            if (_.isArray(Jobs.priorityQueue[i])) {
                for(var ix = Jobs.priorityQueue[i].length -1; ix >= 0 ; ix--){
                    if (Jobs.priorityQueue[i][ix].id == job.id){
                        Jobs.priorityQueue[i].splice(ix, 1);
                    }
                }
            } else if(Jobs.priorityQueue[i] && Jobs.priorityQueue[i].id == job.id){
                Jobs.priorityQueue.splice(i, 1);
            }
        }
    }

    return {
        Jobs: Jobs,
        assign: assign,
        create: create,
        exists: exists,
        getJob: getJob,
        complete: complete,
        cleanup: cleanup
    };
};
