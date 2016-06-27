// TODO: Have the pickup be attached to a miner location

var cache = require('helper_cache');

module.exports = function (creep) {
    var result;
    if (creep.memory.unload) {
        unload();
    } else {
        load();
    }

    function load() {
        var sources = cache.get('energy_resources');
        if (!sources) {
            sources = updateSources();
        }
        if (!sources[0]) return;
        var target = Game.getObjectById(sources[0]);
        result = creep.pickup(target);

        switch (result) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target);
                break;

            case ERR_FULL:
                creep.memory.unload = true;
                unload();
                break;

            case ERR_INVALID_TARGET:
                creep.memory.unload = true;
                unload();
                sources = updateSources();
                break;
        }
    }

    function unload() {
        var target = Game.getObjectById(Memory.energyDropoff);
        result = creep.transfer(target, RESOURCE_ENERGY);

        switch (result) {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.unload = false;
                load();
                break;
        }
    }


    function updateSources() {
        var sources = creep.room.find(FIND_DROPPED_RESOURCES);
        var dropoff = Game.getObjectById(Memory.energyDropoff);
        var sourcesIds = [];
        var distance = [];
        var shortest = 99999999;
        sources.forEach(function(source) {
            var path = creep.room.findPath(dropoff.pos, source.pos);
            if (path.length < shortest) {
                shortest = path.length;
                sourcesIds = [source.id];
            }
        });
        sources = sourcesIds;
        cache.set('energy_resources', sourcesIds);

        return sources;
    }
};
