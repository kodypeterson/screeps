module.exports = function(creep) {
    if (creep.room.memory.repairing.indexOf(creep.memory.activeJob.params.structure) === -1) {
        creep.room.memory.repairing.push(creep.memory.activeJob.params.structure);
    }
    if (!creep.memory.status) {
        creep.memory.status = 'pickup';
        pickup();
    } else if(creep.memory.status === 'pickup') {
        pickup();
    } else {
        repair();
    }

    function pickup() {
        var target = getPickupTarget();
        if (!target) return;
        var result = target.transferEnergy(creep);
        switch (result) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target);
                break;

            case ERR_FULL:
                creep.memory.status = 'repair';
                repair();
                break;
        }
    }

    function getPickupTarget() {
        var extensions = creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });
        for (var i in extensions) {
            var extension = extensions[i];
            if (extension.energy !== 0) {
                return extension;
            }
        }
    }

    function repair() {
        var target = Game.getObjectById(creep.memory.activeJob.params.structure);
        var result = creep.repair(target);
        switch (result) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target);
                break;

            case ERR_NOT_ENOUGH_ENERGY:
            case ERR_FULL:
                creep.memory.status = 'pickup';
                pickup();
                break;

            case OK:
                var minHealthNeeded = (50 / 100) * target.hitsMax;
                if (creep.memory.activeJob.params.fullRepair && target.hits === target.hitsMax ||
                    !creep.memory.activeJob.params.fullRepair && target.hits >= minHealthNeeded) {
                    delete creep.memory.activeJob;
                }
                break;
        }
    }
};