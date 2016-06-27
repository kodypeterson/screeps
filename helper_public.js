module.exports = {};

module.exports.newWorker = function(type) {
    var attributes = [MOVE, WORK, CARRY, WORK];

    var creep = Game.spawns.Spawn1.createCreep(attributes, 'Worker' + Object.keys(Game.creeps).length);
    if (type) {
        console.log(creep);
    }
};
