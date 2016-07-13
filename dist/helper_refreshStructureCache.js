var Cache = require('helper_cache');

module.exports = function(room) {
    Cache.invalidate(room, 'towers');
    Cache.invalidate(room, 'structures');
    Cache.invalidate(room, 'sites');
    var structures = room.find(FIND_STRUCTURES);
    var cacheStruct = {};
    structures.forEach(function (structure) {
        if (!cacheStruct[structure.structureType]) {
            cacheStruct[structure.structureType] = [];
            cacheStruct[structure.structureType + '_details'] = {};
        }
        if (!cacheStruct[structure.structureType + '_details'][structure.id]) {
            cacheStruct[structure.structureType + '_details'][structure.id] = {

            };
        }
        cacheStruct[structure.structureType].push(structure.id);

        var details = cacheStruct[structure.structureType + '_details'][structure.id];
        if (structure.structureType === 'spawn') {
            details.holding = structure.energy;
            details.capacity = structure.energyCapacity;
            details.store = {
                energy: structure.energy
            }
        }
        if (structure.structureType === 'extension') {
            details.holding = structure.energy;
            details.capacity = structure.energyCapacity;
            details.store = {
                energy: structure.energy
            }
        }
        if (structure.structureType === 'storage') {
            details.holding = _.sum(structure.store);
            details.capacity = structure.storeCapacity;
            details.store = structure.store;
        }
    });
    Cache.set(room, 'structures', cacheStruct, -1);

    var sites = room.find(FIND_CONSTRUCTION_SITES);
    var cacheSites = {};
    sites.forEach(function(site) {
        if (!cacheSites[site.structureType]) cacheSites[site.structureType] = [];
        cacheSites[site.structureType].push(site.id);
    });
    Cache.set(room, 'sites', cacheSites, -1);

    room.memory.lastStructureRefresh = Game.time;
};
