module.exports = function(params) {
    // Need to have half of non-move parts as move
    var attributes = {
        'miner': [WORK, WORK, MOVE],
        'pickup': [CARRY, CARRY, WORK, MOVE, MOVE],
        'builder': [WORK, WORK, MOVE, CARRY],
        'healer': [CARRY, CARRY, WORK, MOVE, MOVE]
    };
    var Cache = require('helper_cache');
    var structures = Cache.get(Game.rooms[params.room], 'structures') || {};
    var extensions = structures[STRUCTURE_EXTENSION];
    if (extensions) {
        var count = extensions.length;
        var roomHasPickup = false;
        for (var i in Game.creeps) {
            var creep = Game.creeps[i];
            if (creep.room.name === params.room && creep.memory.role === 'pickup') {
                roomHasPickup = true;
            }
        }
        if (!roomHasPickup) {
            extensions.forEach(function(extension) {
                var ext = Game.getObjectById(extension);
                if (ext.energy !== ext.energyCapacity) {
                    count--;
                }
            });
        }
        switch (count) {
            case 4:
                attributes.miner.push(WORK);

            case 3:
                attributes.pickup.push(CARRY);
                attributes.pickup.push(MOVE);

            case 2:
                attributes.miner.push(WORK);
                attributes.miner.push(MOVE);

            case 1:
                attributes.pickup.push(CARRY);
                //attributes.builder.push(CARRY);
                //attributes.healer.push(CARRY);
                break;
        }
    }

    var name = params.role + "_" + Math.floor(Math.random() * (1 - 9999999 + 1) + 9999999);
    for (var i in Game.spawns) {
        var spawn = Game.spawns[i];
        if (spawn.room.name === params.room) {
            if (spawn.canCreateCreep(attributes[params.role], name) === OK) {
                if (!params.memory) params.memory = {};
                params.memory.role = params.role;

                spawn.createCreep(attributes[params.role], name, params.memory);

                return true;
            }
        }
    }
};