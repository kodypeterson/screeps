var Cache = require('../helper/cache');

module.exports = function(room) {
    Cache.invalidate(room, 'towers');
    Cache.invalidate(room, 'structures');
    Cache.invalidate(room, 'sites');
    var structures = room.find(FIND_STRUCTURES);
    var cacheStruct = {};
    structures.forEach(function (structure) {
        if (!cacheStruct[structure.structureType]) cacheStruct[structure.structureType] = [];
        cacheStruct[structure.structureType].push(structure.id);
    });
    Cache.set(room, 'structures', cacheStruct, -1);

    var sites = room.find(FIND_CONSTRUCTION_SITES);
    var cacheSites = {};
    sites.forEach(function(site) {
        if (!cacheSites[site.structureType]) cacheSites[site.structureType] = [];
        cacheSites[site.structureType].push(site.id);
    });
    Cache.set(room, 'sites', cacheSites, -1);
};
