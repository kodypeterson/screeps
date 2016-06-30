module.exports = function(room) {
    var Queue = require('../helper/queue');
    var queue = new Queue('creep', {
        priority: true,
        room: room
    });
    var creepCount = 0;

    for (var i in Game.creeps) {
        var creep = Game.creeps[i];
        if (creep.room.name === room.name) {
            // This is my creep to manage
            creepCount++;
            if ((creep.ticksToLive <= ((creep.body.length+1) * 3)) && !creep.memory.spawnQueued) {
                // This creep will die soon
                creep.say("Bye World!");
                queue.push('spawn', 0, {
                    role: creep.memory.role,
                    room: room.name
                });
                creep.memory.spawnQueued = true;
            }

            if (!creep.memory.activeJob) {
                var jobs = require('./job')(room);
                jobs.assign(creep);
            }
            if (creep.memory.activeJob) {
                require('jobs_' + creep.memory.activeJob.name)(creep);
            } else if (creep.memory.role === 'builder') {
                require('jobs_build')(creep, room.controller.id);
            }

            //require('creep_role_' + creep.memory.role)(creep);
        }
    }

    if (creepCount === 0) {
        room.memory.emptyRoom = true;
    } else {
        room.memory.emptyRoom = false;
        room.memory.spawnedEmptyRoom = false;
    }
};