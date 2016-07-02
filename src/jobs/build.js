var Cache = require('../helper/cache');

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
        var containers = Cache.get(creep.room, 'structures')[STRUCTURE_CONTAINER];
        if (containers) {
            for (var i = 0;i < containers.length;i++) {
                var container = Game.getObjectById(containers[i]);
                if (container.energy !== 0) {
                    return container;
                }
            }
        }
        var id = job.params.site;
        var target = Game.getObjectById(id);
        if (target && target.level) {
            // This is a job for leveling controller
            // Do not pull from extensions just for this
            return creep.moveToHolding();
        }
        var extensions = Cache.get(creep.room, 'structures')[STRUCTURE_EXTENSION];
        if (extensions) {
            for (var i = 0;i < extensions.length;i++) {
                var extension = Game.getObjectById(extensions[i]);
                if (extension.energy !== 0) {
                    return extension;
                }
            }
            // We have extensions but they are empty
            // Don't pull from spawn then
            return creep.moveToHolding();
        }
        var Queue = require('../helper/queue');
        var creepQueue = new Queue('creep', {
            priority: true,
            room: creep.room
        });
        if (creepQueue.items().length > 0) {
            return creep.moveToHolding();
        }
        var spawns = Cache.get(creep.room, 'structures')[STRUCTURE_SPAWN];
        if (spawns) {
            for (var i = 0;i < spawns.length;i++) {
                var spawn = Game.getObjectById(spawns[i]);
                if (spawn.energy !== 0) {
                    return spawn;
                }
            }
        }

        creep.moveToHolding();
    }

    function building() {
        var id = job.params.site;
        var target = Game.getObjectById(id);
        if (!target) {
            var jobManager = require('../manager/job')(creep.room);
            // a construction was complete, refresh the cache
            refreshStructureCache();
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

    function refreshStructureCache() {
        Cache.invalidate(creep.room, 'towers');
        Cache.invalidate(creep.room, 'structures');
        var structures = creep.room.find(FIND_MY_STRUCTURES);
        var cacheStruct = {};
        structures.forEach(function (structure) {
            if (!cacheStruct[structure.structureType]) cacheStruct[structure.structureType] = [];
            cacheStruct[structure.structureType].push(structure.id);
        });
        Cache.set(creep.room, 'structures', cacheStruct, -1);
    }
};