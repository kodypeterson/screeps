var Cache = require('../helper/cache');

module.exports = function() {
    Cache.invalidate(room, 'towers');
    Cache.invalidate(room, 'structures');
    var structures = room.find(FIND_STRUCTURES);
    var cacheStruct = {};
    structures.forEach(function (structure) {
        if (!cacheStruct[structure.structureType]) cacheStruct[structure.structureType] = [];
        cacheStruct[structure.structureType].push(structure.id);
    });
    Cache.set(room, 'structures', cacheStruct, -1);
};