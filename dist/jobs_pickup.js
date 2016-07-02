module.exports = function(creep, job) {
    if (!creep.memory.status) {
        creep.memory.status = 'pickup';
    } else if (creep.memory.status === 'pickup') {
        pickup();
    } else if (creep.memory.status === 'dropoff') {
        dropoff();
    }

    function dropoff() {
        if (!creep.memory.dropoff) {
            creep.memory.dropoff = getDropOff();
        }
        var target = Game.getObjectById(creep.memory.dropoff);
        var result = creep.transfer(target, RESOURCE_ENERGY);
        switch (result) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                var pickupTarget = Game.getObjectById(job.params.resource);
                if (!pickupTarget) {
                    var jobManager = require('manager_job')(creep.room);
                    jobManager.complete(job, creep);
                }
                creep.memory.status = 'pickup';
                delete creep.memory.dropoff;
                break;
            case ERR_FULL:
                delete creep.memory.dropoff;
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
        //TODO: Make the below cached
        var extensions = creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });
        for (var i in extensions) {
            var extension = extensions[i];
            if (extension.energy !== extension.energyCapacity) {
                return extension.id;
            }
        }
        var towers = creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        });
        for (var i in towers) {
            var tower = towers[i];
            if (tower.energy !== tower.energyCapacity) {
                return tower.id;
            }
        }
        var containers = creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_CONTAINER }
        });
        for (var i in containers) {
            var container = containers[i];
            if (container.energy !== container.energyCapacity) {
                return container.id;
            }
        }
    }
};