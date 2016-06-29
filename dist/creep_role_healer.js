var cache = require('helper_cache');

module.exports = function (creep) {
    if (!creep.memory.repairing || creep.memory.repairing === null) {
        var needsRepair = getStructuresNeedRepair();
        //console.log(needsRepair);
        if (needsRepair.now.length > 0) {
            needsRepair.now.forEach(function(struct) {
               if (Memory.beingRepaired.indexOf(struct) === -1 && (!creep.memory.repairing || creep.memory.repairing === null)) {
                   creep.memory.repairing = struct;
               }
            });
        } else if (needsRepair.later.length > 0) {
            needsRepair.later.forEach(function(struct) {
                if (Memory.beingRepaired.indexOf(struct) === -1 && (!creep.memory.repairing || creep.memory.repairing === null)) {
                    creep.memory.repairing = struct;
                }
            });
        }
    }

    if (creep.memory.repairing !== null) {
        if (!creep.memory.status) {
            creep.memory.status = 'pickup';
            pickup();
        } else if(creep.memory.status === 'pickup') {
            pickup();
        } else {
            repair();
        }
    }

    function pickup() {
        if (!canHeal()) return;

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
        var target = Game.getObjectById(creep.memory.repairing);
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
                if (target.hits === target.hitsMax) {
                    getStructuresNeedRepair(true);
                    creep.memory.repairing = null;
                }
                break;
        }
    }

    function getStructuresNeedRepair(force) {
        var needsRepair = cache.get('structures_need_repair');
        if (!needsRepair || force) {
            needsRepair = creep.room.find(FIND_STRUCTURES, {
                filter: function (o) {
                    return o.hits !== o.hitsMax;
                }
            });
            var ret = {
                now: [],
                later: []
            };

            needsRepair.forEach(function (struct) {
                var minHelthNeeded = (75 / 100) * struct.hitsMax;
                if (struct.hits < minHelthNeeded) {
                    ret.now.push(struct.id);
                } else {
                    ret.later.push(struct.id);
                }
            });
            Memory.repairNowCount = ret.now.length;

            cache.set('structures_need_repair', ret);
            needsRepair = ret;
        }

        return needsRepair;
    }

    function canHeal() {
        return !Memory.needsSpawn;
    }
};
