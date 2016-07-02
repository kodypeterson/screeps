module.exports = function(creep, job) {
    if (!creep.memory.status) {
        creep.memory.status = 'pickup';
    } else if (creep.memory.status === 'pickup') {
        pickup();
    } else if (creep.memory.status === 'dropoff') {
        dropoff();
    }

    function dropoff() {
        var target = Game.getObjectById(getDropOff());
        var result = creep.transfer(target, RESOURCE_ENERGY);
        switch (result) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.status = 'pickup';
                pickup();
                break;
        }
    }

    function pickup() {
        var target = Game.getObjectById(job.params.resource);
        var result = creep.pickup(target);
        switch (result) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target);
                break;

            case ERR_FULL:
                creep.memory.status = 'dropoff';
                dropoff();
                break;

            case ERR_INVALID_TARGET:
                var jobManager = require('manager_job')(creep.room);
                jobManager.complete(job, creep);
                creep.memory.status = 'dropoff';
                dropoff();
                break;
        }
    }

    function getDropOff() {
        for (var i in Game.spawns) {
            var spawn = Game.spawns[i];
            if (spawn.energy !== spawn.energyCapacity && spawn.room.name === creep.room.name) {
                return spawn.id;
            }
        }
        var extensions = creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });
        for (var i in extensions) {
            var extension = extensions[i];
            if (extension.energy !== extension.energyCapacity) {
                return extension.id;
            }
        }
    }
};