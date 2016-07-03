var Cache = require('helper_cache');

module.exports = function(creep, job, controller) {
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
        var result;
        if (target.transfer) {
            result = target.transfer(creep, RESOURCE_ENERGY);
        } else {
            result = target.transferEnergy(creep);
        }
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
        var energy = require('manager_energy')(creep.room);
        var id = job.params.site;
        var buildTarget = Game.getObjectById(id);
        var target = energy.pickup(true, typeof buildTarget.level !== 'undefined');

        if (!target) {
            creep.moveToHolding();
        } else {
            return target;
        }
    }

    function building() {
        var id = job.params.site;
        var target = Game.getObjectById(id);
        if (!target) {
            var jobManager = require('manager_job')(creep.room);
            // a construction was complete, refresh the cache
            creep.room.refreshStructureCache();
            jobManager.complete(job, creep);
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