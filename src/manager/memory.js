module.exports = function() {
    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) delete Memory.creeps[i];
    }
    for (var i in Memory.rooms) {
        if (!Game.rooms[i]) delete Memory.rooms[i];
    }
};