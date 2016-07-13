module.exports = function(creep, job) {
    var Cache = require('../helper/cache');
    if (creep.memory.isTower) {
        creep.memory.status = 'repair';
    }
    if (!creep.memory.status) {
        creep.memory.status = 'pickup';
        pickup();
    } else if(creep.memory.status === 'pickup') {
        pickup();
    } else {
        var sites = _.values(Cache.get(creep.room, 'sites') || {});
        if (sites.length > 0) {
            // We have construction sites that need to be built
            // Don't repair anything
            // TODO: Make this dynamic based on energy in storage
            creep.memory.holdStatus = 'Waiting on construction build';
            if (creep.moveToHolding) {
                creep.moveToHolding();
            }
            return;
        }
        creep.memory.holdStatus = false;
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
            creep.memory.holdStatus = 'Waiting on pickup source';
            creep.moveToHolding();
        } else {
            return target;
        }
    }

    function repair() {
        var target = Game.getObjectById(job.params.structure);
        if (!target) {
            console.log('d');
        }
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
