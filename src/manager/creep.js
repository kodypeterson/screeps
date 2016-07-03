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
            creep.moveToHolding = function() {
                this.moveTo(Game.flags['HOLDING_' + this.room.name]);
            };
            // This is my creep to manage
            creepCount++;
            if ((creep.ticksToLive <= ((creep.body.length+1) * 3)) && !creep.memory.spawnQueued) {
                // This creep will die soon
                creep.say("Bye World!");
                if (!creep.memory.temporary) {
                    queue.push('spawn', 0, {
                        role: creep.memory.role,
                        room: room.name
                    });
                    creep.memory.spawnQueued = true;
                }
            }

            var jobs = require('./job')(room);
            var job = jobs.getJob(creep);
            if (job) {
                require('jobs_' + jobs.Jobs.list[job].name)(creep, jobs.Jobs.list[job]);
            } else if (creep.memory.role !== 'pickup') {
                creep.moveToHolding();
            }
        }
    }

    if (creepCount === 0) {
        room.memory.emptyRoom = true;
    } else {
        room.memory.emptyRoom = false;
        room.memory.spawnedEmptyRoom = false;
    }
};