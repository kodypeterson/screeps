module.exports = function(creep) {
    if (!creep.room.memory.sources[creep.memory.activeJob.params.index].miner) {
        creep.room.memory.sources[creep.memory.activeJob.params.index].miner = creep.name;
    }

    var source = Game.getObjectById(creep.memory.activeJob.params.source);
    var result = creep.harvest(source);
    switch (result) {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(source);
            break;
    }
};