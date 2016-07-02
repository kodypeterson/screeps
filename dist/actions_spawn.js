module.exports = function(params) {
    var attributes = {
        'miner': [WORK, WORK, MOVE],
        'pickup': [CARRY, CARRY, WORK, MOVE, MOVE],
        'builder': [WORK, WORK, MOVE, CARRY],
        'healer': [CARRY, CARRY, WORK, MOVE, MOVE]
    };

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