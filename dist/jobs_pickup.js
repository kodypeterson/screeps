module.exports = function(creep, job) {
    if (!creep.memory.status) {
        creep.memory.status = 'pickup';
    } else if (creep.memory.status === 'pickup') {
        pickup();
    } else if (creep.memory.status === 'dropoff') {
        dropoff();
    }

    function dropoff() {
        var energy = require('manager_energy')(creep.room);
        var target = energy.dropOff();
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
};