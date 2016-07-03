module.exports = function(creep, job) {
    if (creep.memory.isTower) {
        creep.memory.status = 'repair';
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

            case ERR_FULL:
                creep.memory.status = 'repair';
                repair();
                break;
        }
    }

    function getPickupTarget() {
        var energy = require('../manager/energy')(creep.room);
        var target = energy.pickup(false);

        if (!target && creep.moveToHolding) {
            creep.moveToHolding();
        } else {
            return target;
        }
    }

    function repair() {
        var target = Game.getObjectById(job.params.structure);
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
                if (job.params.fullRepair && target.hits === target.hitsMax ||
                    !job.params.fullRepair && target.hits >= minHealthNeeded) {
                    var jobManager = require('../manager/job')(creep.room);
                    jobManager.complete(job, creep);
                }
                break;
        }
    }
};