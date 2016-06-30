module.exports = function(creep, controller) {
    if (!controller && creep.room.memory.building.indexOf(creep.memory.activeJob.params.site) === -1) {
        creep.room.memory.building.push(creep.memory.activeJob.params.site);
    }

    if (!creep.memory.status) {
        creep.memory.status = 'pickup';
    }

    if (creep.memory.status === 'pickup') {
        pickup();
    } else {
        building();
    }

    function pickup() {
        var target = getPickupTarget();
        if (!target) return;
        var result = target.transferEnergy(creep);
        switch (result) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target);
                break;

            case ERR_NOT_ENOUGH_ENERGY:
            case ERR_FULL:
                creep.memory.status = 'building';
                building();
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

    function building() {
        var id = controller;
        if (creep.memory.activeJob) {
            id = creep.memory.activeJob.params.site;
        }
        var target = Game.getObjectById(id);
        if (!target && creep.memory.activeJob) {
            delete creep.memory.activeJob;
            return;
        }
        if (target.level != undefined) {
            var result = creep.upgradeController(target);
            switch (result) {
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(target);
                    break;

                case ERR_NOT_ENOUGH_RESOURCES:
                    creep.memory.status = 'pickup';
                    pickup();
                    break;
            }
        } else {
            var result = creep.build(target);
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
    }
};