module.exports = function(creep) {
    if (creep.room.memory.collecting.indexOf(creep.memory.activeJob.params.resource) === -1) {
        creep.room.memory.collecting.push(creep.memory.activeJob.params.resource);
    }
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
        var target = Game.getObjectById(creep.memory.activeJob.params.resource);
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
                delete creep.memory.activeJob;
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